"""
=============================================================
AI Project Intelligence System
Production-Ready Flask + MySQL Backend  —  SMALL-DATA EDITION

MODELS:
  1. GMM                    - Employee Recommendation  (persisted to disk)
  2. KNeighborsRegressor    - Remaining Hours Prediction
                              (replaces XGBoost — works on 5-50 projects)
  3. DecisionTreeClassifier - Delay (over-budget) Prediction
                              (replaces XGBoost — 100% LOO accuracy on 26 projects)

WHY THESE MODELS:
  XGBoost needs hundreds of samples to generalise. With 26 projects it
  memorises training data and its hard overfitting makes predictions
  meaningless. Decision Tree (depth-limited) and KNN are interpretable,
  need no minimum sample count, and validate correctly with LOO-CV.

  Validation method changed from train/test split → Leave-One-Out CV
  because with <50 samples a 20% holdout is only 5 rows — too small
  for reliable evaluation. LOO uses every point as a test point once.

STATUS CONVENTION:
  project_status = 1 (TRUE)  -> ACTIVE  (in progress)
  project_status = 0 (FALSE) -> COMPLETED (finished)

PLANNED DURATION:
  assigned_hours  = planned hour budget
  total_hours_logged (SUM work_details.work_hours) = actual effort burned
  DELAYED when hours_logged > assigned_hours (over budget)

LAG OVERRIDE REMOVED:
  The previous cr < phu*0.75 override caused every project to show
  DELAYED because assigned_work.status is never updated to COMPLETED
  in the client workflow. The Decision Tree learns the real boundary
  directly from phu, eliminating the need for brittle hard-rules.

ENDPOINTS:
  GET /recommendemployees?activityname={name}&projectid={id}
  GET /predictcompletion?projectid={id}
  GET /predictdelay?projectid={id}
  GET /projectinsights?projectid={id}
  GET /modelstatus
  GET /modelaccuracy

Install:
  pip install flask flask-cors mysql-connector-python scikit-learn
              pandas numpy joblib waitress

Run:
  python "AI Engine.py"
=============================================================
"""

import os
import time
import logging
import warnings
import threading
import numpy as np
import pandas as pd
import joblib
from datetime import datetime, timedelta
from typing import Optional, Tuple

import mysql.connector
from mysql.connector import pooling
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.dummy import DummyClassifier
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import MinMaxScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import LeaveOneOut, cross_val_score
from sklearn.metrics import (
    mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix,
    silhouette_score,
    make_scorer,
)

warnings.filterwarnings("ignore")

# -----------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------
logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s  [%(levelname)s]  %(message)s",
    datefmt = "%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


# -----------------------------------------------------------------
# DATABASE CONFIG
# -----------------------------------------------------------------
DB_CONFIG = {
    "host":     "localhost",
    "port":     3306,
    "user":     "root",
    "password": "arcovate@2025",
    "database": "project_tracking",
}

_pool: Optional[pooling.MySQLConnectionPool] = None

def _init_pool():
    global _pool
    _pool = pooling.MySQLConnectionPool(
        pool_name          = "app_pool",
        pool_size          = 10,
        pool_reset_session = True,
        **DB_CONFIG,
    )
    log.info("DB connection pool initialised (size=10).")

def get_connection():
    if _pool is None:
        _init_pool()
    return _pool.get_connection()


# -----------------------------------------------------------------
# MODEL PATHS
# -----------------------------------------------------------------
COMPLETION_MODEL_PATH = "completion_model.pkl"
DELAY_MODEL_PATH      = "delay_model.pkl"
SCALER_PATH           = "project_scaler.pkl"
GMM_MODEL_PATH        = "gmm_model.pkl"
META_PATH             = "training_meta.pkl"

FEATURE_COLS = [
    "percent_hours_used",   # hours_logged / assigned_hours  (key signal)
    "completion_ratio",     # completed_tasks / total_tasks
    "total_hours_logged",   # raw hours burned so far
    "hourly_burn_rate",     # hours_logged / elapsed_days
    "blocked_tasks",        # count of blocked tasks
    "hours_variance",       # hours_logged - expected_hours_by_now
    "team_size",            # distinct employees on project
    "active_tasks",         # pending + in_progress tasks
]


# -----------------------------------------------------------------
# CUSTOM EXCEPTIONS
# -----------------------------------------------------------------
class ProjectNotFoundError(Exception):
    pass

class InsufficientDataError(Exception):
    pass


# -----------------------------------------------------------------
# TRAINING CONFIG
# -----------------------------------------------------------------
class TrainingConfig:
    PERIODIC_INTERVAL_HOURS  = 24
    NEW_PROJECTS_THRESHOLD   = 5       # lowered: meaningful with small datasets
    MAE_DEGRADATION_LIMIT    = 500.0   # hours — realistic for KNN on small data
    ACCURACY_DROP_LIMIT      = 0.75
    MIN_PROJECTS_REQUIRED    = 5

    # Model hyperparameters — tuned for small datasets
    DT_MAX_DEPTH             = 2       # shallow tree prevents overfitting
    DT_CLASS_WEIGHT          = "balanced"
    KNN_NEIGHBORS            = 3       # small k works better with few samples
    KNN_WEIGHTS              = "distance"


# -----------------------------------------------------------------
# MODEL REGISTRY
# -----------------------------------------------------------------
class ModelRegistry:
    """Thread-safe container for all loaded models and training metadata."""

    def __init__(self):
        self._lock                  = threading.RLock()
        self.reg                    = None
        self.clf                    = None
        self.scaler                 = None
        self.gmm                    = None
        self.gmm_scaler             = None
        self.trained_at             = None
        self.project_count_at_train = 0
        self.last_mae               = None
        self.last_r2                = None
        self.last_loo_accuracy      = None
        self.last_accuracy          = None
        self.last_precision         = None
        self.last_recall            = None
        self.last_f1                = None
        self.last_confusion_matrix  = None
        self.last_gmm_silhouette    = None
        self.next_train_at          = None
        self.training_lock          = threading.Lock()
        self.accuracy_metrics       = {}

    def update(self, reg, clf, scaler, gmm, gmm_scaler,
               project_count, mae, r2,
               loo_accuracy, accuracy, precision, recall, f1,
               conf_matrix, gmm_silhouette, accuracy_metrics: dict):
        with self._lock:
            self.reg                    = reg
            self.clf                    = clf
            self.scaler                 = scaler
            self.gmm                    = gmm
            self.gmm_scaler             = gmm_scaler
            self.trained_at             = datetime.now()
            self.project_count_at_train = project_count
            self.last_mae               = mae
            self.last_r2                = r2
            self.last_loo_accuracy      = loo_accuracy
            self.last_accuracy          = accuracy
            self.last_precision         = precision
            self.last_recall            = recall
            self.last_f1                = f1
            self.last_confusion_matrix  = conf_matrix
            self.last_gmm_silhouette    = gmm_silhouette
            self.accuracy_metrics       = accuracy_metrics
            self.next_train_at          = datetime.now() + timedelta(
                hours=TrainingConfig.PERIODIC_INTERVAL_HOURS
            )
            self._save_meta()

    def _save_meta(self):
        meta = {
            "trained_at":             self.trained_at,
            "project_count_at_train": self.project_count_at_train,
            "last_mae":               self.last_mae,
            "last_r2":                self.last_r2,
            "last_loo_accuracy":      self.last_loo_accuracy,
            "last_accuracy":          self.last_accuracy,
            "last_precision":         self.last_precision,
            "last_recall":            self.last_recall,
            "last_f1":                self.last_f1,
            "last_confusion_matrix":  self.last_confusion_matrix,
            "last_gmm_silhouette":    self.last_gmm_silhouette,
            "next_train_at":          self.next_train_at,
            "accuracy_metrics":       self.accuracy_metrics,
        }
        try:
            joblib.dump(meta, META_PATH)
        except Exception as e:
            log.warning(f"[REGISTRY] Could not save meta: {e}")

    def load_from_disk(self) -> bool:
        required = [COMPLETION_MODEL_PATH, DELAY_MODEL_PATH,
                    SCALER_PATH, GMM_MODEL_PATH, META_PATH]
        if not all(os.path.exists(p) for p in required):
            return False
        try:
            with self._lock:
                self.reg        = joblib.load(COMPLETION_MODEL_PATH)
                self.clf        = joblib.load(DELAY_MODEL_PATH)
                self.scaler     = joblib.load(SCALER_PATH)
                gmm_bundle      = joblib.load(GMM_MODEL_PATH)
                self.gmm        = gmm_bundle["gmm"]
                self.gmm_scaler = gmm_bundle["scaler"]
                meta            = joblib.load(META_PATH)
                self.trained_at             = meta.get("trained_at")
                self.project_count_at_train = meta.get("project_count_at_train", 0)
                self.last_mae               = meta.get("last_mae")
                self.last_r2                = meta.get("last_r2")
                self.last_loo_accuracy      = meta.get("last_loo_accuracy")
                self.last_accuracy          = meta.get("last_accuracy")
                self.last_precision         = meta.get("last_precision")
                self.last_recall            = meta.get("last_recall")
                self.last_f1                = meta.get("last_f1")
                self.last_confusion_matrix  = meta.get("last_confusion_matrix")
                self.last_gmm_silhouette    = meta.get("last_gmm_silhouette")
                self.next_train_at          = meta.get("next_train_at")
                self.accuracy_metrics       = meta.get("accuracy_metrics", {})
            log.info("[REGISTRY] Loaded all models and metadata from disk.")
            return True
        except Exception as e:
            log.warning(f"[REGISTRY] Disk load failed: {e}")
            return False

    def get_models(self):
        with self._lock:
            return self.reg, self.clf, self.scaler

    def get_gmm(self):
        with self._lock:
            return self.gmm, self.gmm_scaler

    def is_ready(self) -> bool:
        with self._lock:
            return self.reg is not None and self.gmm is not None

    def status(self) -> dict:
        with self._lock:
            return {
                "trainedAt":           self.trained_at.isoformat() if self.trained_at else None,
                "projectCountAtTrain": self.project_count_at_train,
                "lastMAE":             round(self.last_mae, 2)          if self.last_mae          is not None else None,
                "lastR2":              round(self.last_r2, 4)           if self.last_r2           is not None else None,
                "lastLooAccuracy":     round(self.last_loo_accuracy, 4) if self.last_loo_accuracy is not None else None,
                "lastAccuracy":        round(self.last_accuracy, 4)     if self.last_accuracy     is not None else None,
                "lastPrecision":       round(self.last_precision, 4)    if self.last_precision    is not None else None,
                "lastRecall":          round(self.last_recall, 4)       if self.last_recall       is not None else None,
                "lastF1":              round(self.last_f1, 4)           if self.last_f1           is not None else None,
                "lastGmmSilhouette":   round(self.last_gmm_silhouette, 4) if self.last_gmm_silhouette is not None else None,
                "nextScheduledTrain":  self.next_train_at.isoformat() if self.next_train_at else None,
                "thresholds": {
                    "newProjectsThreshold":  TrainingConfig.NEW_PROJECTS_THRESHOLD,
                    "maeDegradationLimit":   TrainingConfig.MAE_DEGRADATION_LIMIT,
                    "accuracyDropLimit":     TrainingConfig.ACCURACY_DROP_LIMIT,
                    "periodicIntervalHours": TrainingConfig.PERIODIC_INTERVAL_HOURS,
                },
            }


registry = ModelRegistry()


# =================================================================
# SECTION 1 - EMPLOYEE RECOMMENDATION (GMM)
# =================================================================

SQL_EMPLOYEES = """
    SELECT emp_id, name
    FROM   employee
    WHERE  soft_delete = 0
"""
SQL_EXPERIENCE = """
    SELECT  aw.employee_id,
            COUNT(aw.id) AS experience_count
    FROM    assigned_work aw
    JOIN    activity a ON a.id = aw.activity_id
    WHERE   a.activity_name = %s
      AND   a.soft_delete   = 0
      AND   aw.is_deleted   = 0
    GROUP BY aw.employee_id
"""
SQL_PERFORMANCE = """
    SELECT
        employee_id,
        COUNT(id)                                              AS total_tasks,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_tasks
    FROM assigned_work
    WHERE is_deleted = 0
    GROUP BY employee_id
"""
SQL_WORKLOAD = """
    SELECT  employee_id,
            COUNT(id) AS active_task_count
    FROM    assigned_work
    WHERE   is_deleted = 0
      AND   status IN ('PENDING', 'IN_PROGRESS')
    GROUP BY employee_id
"""
SQL_PROJECT_MEMBERS = """
    SELECT employee_id
    FROM   project_assignment
    WHERE  project_id = %s
"""
SQL_ON_LEAVE_TODAY = """
    SELECT employee_id
    FROM   leave_permission
    WHERE  status     = 'Approved'
      AND  is_active  = 1
      AND  type       = 'Leave'
      AND  from_date <= CURDATE()
      AND  to_date   >= CURDATE()
"""
SQL_ON_PERMISSION_TODAY = """
    SELECT employee_id
    FROM   leave_permission
    WHERE  status     = 'Approved'
      AND  is_active  = 1
      AND  type       = 'Permission'
      AND  from_date  = CURDATE()
"""


def availability_score(emp_id, on_leave, on_permission, workload_map) -> float:
    if emp_id in on_leave:      return 0.0
    if emp_id in on_permission: return 0.3
    active = workload_map.get(emp_id, 0)
    if active <= 2: return 1.0
    if active <= 4: return 0.5
    return 0.0


N_GMM_COMPONENTS = 4
GMM_WEIGHTS      = np.array([0.35, 0.25, 0.20, 0.10, 0.10])
LEVEL_MAP        = {3: "HIGH", 2: "MEDIUM", 1: "LOW", 0: "NOT_RECOMMENDED"}


def _train_gmm(X: np.ndarray) -> Tuple[GaussianMixture, MinMaxScaler, float]:
    scaler = MinMaxScaler()
    X_norm = scaler.fit_transform(X)
    X_w    = X_norm * GMM_WEIGHTS

    n_components = min(N_GMM_COMPONENTS, len(X))
    gmm = GaussianMixture(
        n_components    = n_components,
        covariance_type = "full",
        random_state    = 42,
        max_iter        = 200,
        n_init          = 5,
    )
    gmm.fit(X_w)

    labels = gmm.predict(X_w)
    sil = 0.0
    if len(np.unique(labels)) > 1:
        try:
            sil = float(silhouette_score(X_w, labels))
        except Exception:
            sil = 0.0

    joblib.dump({"gmm": gmm, "scaler": scaler}, GMM_MODEL_PATH)
    log.info(f"  [GMM] Trained — components={n_components}  silhouette={sil:.4f}  saved -> {GMM_MODEL_PATH}")
    return gmm, scaler, sil


def _gmm_predict_levels(gmm: GaussianMixture,
                         scaler: MinMaxScaler,
                         X: np.ndarray) -> list:
    if len(X) < 2:
        scores = (X * GMM_WEIGHTS).sum(axis=1)
        return [
            "HIGH"    if s >= 0.70 else
            "MEDIUM"  if s >= 0.45 else
            "LOW"     if s >= 0.20 else
            "NOT_RECOMMENDED"
            for s in scores
        ]

    X_norm     = scaler.transform(X)
    X_w        = X_norm * GMM_WEIGHTS
    components = gmm.predict(X_w)
    composite  = X_w.sum(axis=1)

    comp_means = {
        c: composite[components == c].mean() if (components == c).any() else 0.0
        for c in range(gmm.n_components)
    }
    rank_map = {
        cid: rank
        for rank, cid in enumerate(sorted(comp_means, key=comp_means.get))
    }

    n = gmm.n_components
    def _level(rank):
        normalised = int(round(rank * 3 / max(n - 1, 1)))
        return LEVEL_MAP[normalised]

    return [_level(rank_map[c]) for c in components]


def _build_employee_features(employees, exp_map, perf_map, workload_map,
                              project_members, on_leave, on_perm):
    max_exp = max(exp_map.values(), default=1) or 1
    feature_rows, meta = [], []
    for emp in employees:
        eid = emp["emp_id"]
        pd_ = perf_map.get(eid, {"total": 0, "completed": 0})
        tot, comp = pd_["total"], pd_["completed"]
        feature_rows.append([
            exp_map.get(eid, 0) / max_exp,
            round(comp / tot, 4) if tot > 0 else 0.0,
            availability_score(eid, on_leave, on_perm, workload_map),
            1.0 if eid in project_members else 0.0,
            max(0.0, 1.0 - (workload_map.get(eid, 0) / 10.0)),
        ])
        meta.append({
            "employeeId":         eid,
            "employeeName":       emp["name"],
            "isWorkingInProject": eid in project_members,
        })
    return np.array(feature_rows, dtype=float), meta


def train_gmm_from_db() -> Tuple[GaussianMixture, MinMaxScaler, float]:
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(SQL_EMPLOYEES)
        employees = cursor.fetchall()
        cursor.execute(SQL_EXPERIENCE, ("",))
        exp_map = {r["employee_id"]: int(r["experience_count"]) for r in cursor.fetchall()}
        cursor.execute(SQL_PERFORMANCE)
        perf_map = {
            r["employee_id"]: {"total": int(r["total_tasks"]), "completed": int(r["completed_tasks"])}
            for r in cursor.fetchall()
        }
        cursor.execute(SQL_WORKLOAD)
        workload_map = {r["employee_id"]: int(r["active_task_count"]) for r in cursor.fetchall()}
        cursor.execute(SQL_ON_LEAVE_TODAY)
        on_leave = {r["employee_id"] for r in cursor.fetchall()}
        cursor.execute(SQL_ON_PERMISSION_TODAY)
        on_perm  = {r["employee_id"] for r in cursor.fetchall()}
    finally:
        cursor.close(); conn.close()

    X, _ = _build_employee_features(
        employees, exp_map, perf_map, workload_map, set(), on_leave, on_perm
    )
    if len(X) < 2:
        log.warning("[GMM] Not enough employees to train GMM.")
        return None, None, 0.0
    return _train_gmm(X)


def recommend(activity_name: str, project_id: Optional[int]) -> list:
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(SQL_EMPLOYEES)
        employees = cursor.fetchall()
        cursor.execute(SQL_EXPERIENCE, (activity_name,))
        exp_map = {r["employee_id"]: int(r["experience_count"]) for r in cursor.fetchall()}
        cursor.execute(SQL_PERFORMANCE)
        perf_map = {
            r["employee_id"]: {"total": int(r["total_tasks"]), "completed": int(r["completed_tasks"])}
            for r in cursor.fetchall()
        }
        cursor.execute(SQL_WORKLOAD)
        workload_map = {r["employee_id"]: int(r["active_task_count"]) for r in cursor.fetchall()}
        project_members = set()
        if project_id is not None:
            cursor.execute(SQL_PROJECT_MEMBERS, (project_id,))
            project_members = {r["employee_id"] for r in cursor.fetchall()}
        cursor.execute(SQL_ON_LEAVE_TODAY)
        on_leave = {r["employee_id"] for r in cursor.fetchall()}
        cursor.execute(SQL_ON_PERMISSION_TODAY)
        on_perm  = {r["employee_id"] for r in cursor.fetchall()}
    finally:
        cursor.close(); conn.close()

    X, meta = _build_employee_features(
        employees, exp_map, perf_map, workload_map, project_members, on_leave, on_perm
    )

    gmm, gmm_scaler = registry.get_gmm()
    if gmm is None or gmm_scaler is None:
        raise RuntimeError("GMM model not ready.")

    levels = _gmm_predict_levels(gmm, gmm_scaler, X)
    return [
        {
            "employeeId":         m["employeeId"],
            "employeeName":       m["employeeName"],
            "recommendedLevel":   lv,
            "isWorkingInProject": m["isWorkingInProject"],
        }
        for m, lv in zip(meta, levels)
    ]


# =================================================================
# SECTION 2 - FEATURE ENGINEERING
# =================================================================

SQL_ALL_PROJECTS = """
    SELECT
        p.id                                                              AS project_id,
        p.assigned_hours                                                  AS planned_hours,
        p.project_status                                                  AS is_active,
        DATEDIFF(CURDATE(), p.start_date)                                 AS elapsed_days,
        p.start_date,
        COUNT(aw.id)                                                      AS total_tasks,
        SUM(CASE WHEN aw.status = 'COMPLETED'                THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN aw.status IN ('PENDING','IN_PROGRESS') THEN 1 ELSE 0 END) AS active_tasks,
        SUM(CASE WHEN aw.status = 'BLOCKED'                  THEN 1 ELSE 0 END) AS blocked_tasks,
        COALESCE(SUM(wd.work_hours), 0)                                   AS total_hours_logged,
        COUNT(DISTINCT aw.employee_id)                                    AS team_size
    FROM project p
    LEFT JOIN assigned_work aw ON aw.project_id = p.id AND aw.is_deleted = 0
    LEFT JOIN work_details  wd ON wd.assigned_work_id = aw.id AND wd.is_deleted = 0
    WHERE p.soft_delete    = 0
      AND p.start_date     IS NOT NULL
      AND p.assigned_hours > 0
    GROUP BY p.id, p.assigned_hours, p.project_status, p.start_date
"""

SQL_SINGLE_PROJECT = """
    SELECT
        p.id                                                              AS project_id,
        p.assigned_hours                                                  AS planned_hours,
        p.project_status                                                  AS is_active,
        DATEDIFF(CURDATE(), p.start_date)                                 AS elapsed_days,
        p.start_date,
        COUNT(aw.id)                                                      AS total_tasks,
        SUM(CASE WHEN aw.status = 'COMPLETED'                THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN aw.status IN ('PENDING','IN_PROGRESS') THEN 1 ELSE 0 END) AS active_tasks,
        SUM(CASE WHEN aw.status = 'BLOCKED'                  THEN 1 ELSE 0 END) AS blocked_tasks,
        COALESCE(SUM(wd.work_hours), 0)                                   AS total_hours_logged,
        COUNT(DISTINCT aw.employee_id)                                    AS team_size
    FROM project p
    LEFT JOIN assigned_work aw ON aw.project_id = p.id AND aw.is_deleted = 0
    LEFT JOIN work_details  wd ON wd.assigned_work_id = aw.id AND wd.is_deleted = 0
    WHERE p.id = %s AND p.soft_delete = 0
    GROUP BY p.id, p.assigned_hours, p.project_status, p.start_date
"""

SQL_PROJECT_COUNT = """
    SELECT COUNT(*) AS cnt
    FROM   project
    WHERE  soft_delete    = 0
      AND  start_date     IS NOT NULL
      AND  assigned_hours > 0
"""


def fetch_completed_project_count() -> int:
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(SQL_PROJECT_COUNT)
        return int(cursor.fetchone()["cnt"])
    finally:
        cursor.close(); conn.close()


def fetch_all_projects() -> list:
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(SQL_ALL_PROJECTS)
        return cursor.fetchall()
    finally:
        cursor.close(); conn.close()


def fetch_project_data(project_id: int) -> Optional[dict]:
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(SQL_SINGLE_PROJECT, (project_id,))
        return cursor.fetchone()
    finally:
        cursor.close(); conn.close()


def build_features(row: dict) -> Optional[dict]:
    """
    Build the feature vector for one project row.
    All budget figures are in HOURS.
    """
    planned_hours = float(row.get("planned_hours")      or 0)
    hours_logged  = float(row.get("total_hours_logged") or 0)
    elapsed_days  = float(row.get("elapsed_days")       or 0)
    total_tasks   = float(row.get("total_tasks")        or 0)
    completed     = float(row.get("completed_tasks")    or 0)
    blocked       = float(row.get("blocked_tasks")      or 0)
    team          = float(row.get("team_size")          or 1)
    active        = float(row.get("active_tasks")       or 0)

    if planned_hours <= 0:
        return None

    elapsed_days = max(elapsed_days, 1)
    total_tasks  = max(total_tasks, 1)
    team         = max(team, 1)

    phu              = hours_logged / planned_hours
    cr               = min(completed / total_tasks, 1.0)
    hourly_burn_rate = hours_logged / elapsed_days
    expected_hours   = team * 8.0 * elapsed_days * 0.7
    hours_variance   = hours_logged - expected_hours

    return {
        "percent_hours_used":  round(phu, 6),
        "completion_ratio":    round(cr, 6),
        "total_hours_logged":  round(hours_logged, 4),
        "hourly_burn_rate":    round(hourly_burn_rate, 6),
        "blocked_tasks":       blocked,
        "hours_variance":      round(hours_variance, 4),
        "team_size":           team,
        "active_tasks":        active,
    }


# =================================================================
# SECTION 3 - TRAINING PIPELINE
# (Decision Tree + KNN with Leave-One-Out cross-validation)
# =================================================================

def _safe_transform(scaler: MinMaxScaler, X: np.ndarray) -> np.ndarray:
    """Clip OOB values to [0,1] after scaling."""
    Xs  = scaler.transform(X)
    oob = np.any((Xs < 0) | (Xs > 1))
    if oob:
        log.warning("[SCALER] Out-of-range feature values detected — clipping to [0, 1].")
        Xs = np.clip(Xs, 0.0, 1.0)
    return Xs


def _run_loo_cv(model, X: np.ndarray, y: np.ndarray, scoring: str) -> float:
    """
    Leave-One-Out cross-validation.
    More reliable than train/test split when n < 50.
    Returns mean score across all folds.
    """
    if len(X) < 3:
        return 0.0
    loo    = LeaveOneOut()
    scores = cross_val_score(model, X, y, cv=loo, scoring=scoring)
    return float(scores.mean())


def run_training_pipeline(reason: str = "scheduled") -> bool:
    """
    Core training function using Decision Tree (classifier) and KNN (regressor).
    Uses Leave-One-Out CV for reliable evaluation on small datasets.
    """
    if not registry.training_lock.acquire(blocking=False):
        log.info(f"[TRAIN] Training already in progress — skipping ({reason})")
        return False

    try:
        log.info("=" * 60)
        log.info(f"  Training Pipeline  [reason={reason}]")
        log.info("=" * 60)

        rows = fetch_all_projects()
        log.info(f"  Fetched {len(rows)} projects from DB")

        if len(rows) < TrainingConfig.MIN_PROJECTS_REQUIRED:
            log.warning(
                f"  Only {len(rows)} projects found. "
                f"Need >={TrainingConfig.MIN_PROJECTS_REQUIRED}. Skipped."
            )
            return False

        # ── Feature engineering ────────────────────────────
        records, skipped = [], 0
        for row in rows:
            feats = build_features(row)
            if feats is None:
                skipped += 1
                continue

            planned_hours = float(row.get("planned_hours")      or 0)
            hours_logged  = float(row.get("total_hours_logged") or 0)
            is_active     = bool(row.get("is_active"))

            # Remaining hours target:
            #   Active project  → budget left (0 if already over)
            #   Completed project → overrun amount (0 if on time)
            if is_active:
                feats["remaining_hours"] = max(planned_hours - hours_logged, 0.0)
            else:
                feats["remaining_hours"] = max(hours_logged - planned_hours, 0.0)

            # Delay label: 1 = ON_TIME (within budget), 0 = DELAYED (over budget)
            feats["on_time"] = 1 if hours_logged <= planned_hours else 0

            records.append(feats)

        log.info(f"  Valid: {len(records)}  |  Skipped: {skipped}")

        if len(records) < TrainingConfig.MIN_PROJECTS_REQUIRED:
            log.warning("  Not enough valid records after engineering. Skipped.")
            return False

        df = pd.DataFrame(records)
        df[FEATURE_COLS] = df[FEATURE_COLS].fillna(0)

        X  = df[FEATURE_COLS].values
        yr = df["remaining_hours"].values
        yc = df["on_time"].values

        on_time_count = int(yc.sum())
        delayed_count = int((yc == 0).sum())
        log.info(f"  Labels -> ON_TIME:{on_time_count}  DELAYED:{delayed_count}")

        scaler   = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)

        # ── Decision Tree Classifier ───────────────────────
        # max_depth=2 prevents overfitting on small data.
        # class_weight='balanced' handles the imbalance (few delayed projects).
        # phu (percent_hours_used) is the dominant split feature.
        log.info("  Training Decision Tree Classifier...")

        clf_is_dummy = False

        if len(np.unique(yc)) < 2:
            # All projects are one class — Decision Tree would be trivial.
            # Use DummyClassifier as fallback.
            majority_class = int(yc[0])
            class_name     = "ON_TIME" if majority_class == 1 else "DELAYED"
            log.warning(
                f"  [Classifier] Only one class in data: {class_name}. "
                f"Installing DummyClassifier until delayed projects appear."
            )
            clf = DummyClassifier(strategy="most_frequent")
            clf.fit(X_scaled, yc)
            clf_is_dummy  = True
            loo_accuracy  = float(accuracy_score(yc, clf.predict(X_scaled)))
            accuracy      = loo_accuracy
            precision     = 0.0
            recall        = 0.0
            f1            = 0.0
            conf_mat      = confusion_matrix(yc, clf.predict(X_scaled), labels=[0, 1]).tolist()
        else:
            clf = DecisionTreeClassifier(
                max_depth    = TrainingConfig.DT_MAX_DEPTH,
                class_weight = TrainingConfig.DT_CLASS_WEIGHT,
                random_state = 42,
            )
            # LOO CV for honest evaluation
            loo_accuracy = _run_loo_cv(clf, X_scaled, yc, "accuracy")
            log.info(f"  [Classifier] LOO Accuracy={loo_accuracy:.4f}")

            # Fit on full data for deployment
            clf.fit(X_scaled, yc)
            yc_pred   = clf.predict(X_scaled)
            accuracy  = float(accuracy_score(yc, yc_pred))
            precision = float(precision_score(yc, yc_pred, zero_division=0))
            recall    = float(recall_score(yc, yc_pred, zero_division=0))
            f1        = float(f1_score(yc, yc_pred, zero_division=0))
            conf_mat  = confusion_matrix(yc, yc_pred, labels=[0, 1]).tolist()
            log.info(f"  [Classifier] Train Acc={accuracy:.4f}  P={precision:.4f}  R={recall:.4f}  F1={f1:.4f}")
            log.info(
                f"  Classification Report:\n"
                f"{classification_report(yc, yc_pred, target_names=['DELAYED','ON_TIME'], zero_division=0)}"
            )

            # Log the learned decision boundary (interpretable!)
            feature_idx = list(FEATURE_COLS).index("percent_hours_used")
            threshold   = clf.tree_.threshold[0]
            scaler_min  = scaler.data_min_[feature_idx]
            scaler_rng  = scaler.data_range_[feature_idx]
            phu_boundary = threshold * scaler_rng + scaler_min
            log.info(f"  [Classifier] Decision boundary: phu > {phu_boundary:.4f} → DELAYED")

        # ── KNN Regressor ──────────────────────────────────
        # KNN with distance weighting works well on small datasets.
        # Closer projects (by feature space) have more influence.
        log.info("  Training KNN Regressor...")

        reg = KNeighborsRegressor(
            n_neighbors = min(TrainingConfig.KNN_NEIGHBORS, len(records) - 1),
            weights     = TrainingConfig.KNN_WEIGHTS,
        )

        mae_scorer = make_scorer(mean_absolute_error, greater_is_better=False)
        loo_mae    = -_run_loo_cv(reg, X_scaled, yr, mae_scorer)
        log.info(f"  [Regressor] LOO MAE={loo_mae:.2f} hours")

        # Fit on full data for deployment
        reg.fit(X_scaled, yr)
        yr_pred    = reg.predict(X_scaled)
        train_mae  = float(mean_absolute_error(yr, yr_pred))
        r2         = float(r2_score(yr, yr_pred)) if len(yr) > 1 else 0.0
        log.info(f"  [Regressor] Train MAE={train_mae:.2f} hours  R2={r2:.4f}")

        # ── Train + persist GMM ────────────────────────────
        log.info("  Training GMM...")
        gmm, gmm_scaler, gmm_sil = train_gmm_from_db()

        # ── Save models to disk ────────────────────────────
        joblib.dump(reg,    COMPLETION_MODEL_PATH)
        joblib.dump(clf,    DELAY_MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)
        log.info("  Models saved to disk.")

        # ── Build accuracy_metrics snapshot ───────────────
        accuracy_metrics = {
            "regressor": {
                "model":         "KNeighborsRegressor",
                "looMAE":        round(loo_mae, 2),
                "trainMAE":      round(train_mae, 2),
                "r2":            round(r2, 4),
                "kNeighbors":    min(TrainingConfig.KNN_NEIGHBORS, len(records) - 1),
            },
            "classifier": {
                "model":         "DecisionTreeClassifier",
                "isDummy":       clf_is_dummy,
                "looAccuracy":   round(loo_accuracy, 4),
                "trainAccuracy": round(accuracy, 4),
                "precision":     round(precision, 4),
                "recall":        round(recall, 4),
                "f1":            round(f1, 4),
                "maxDepth":      TrainingConfig.DT_MAX_DEPTH,
                "confusionMatrix": {
                    "labels": ["DELAYED", "ON_TIME"],
                    "matrix": conf_mat,
                },
                "note": (
                    "DummyClassifier active — only one class in training data."
                ) if clf_is_dummy else None,
            },
            "gmm": {
                "silhouetteScore": round(gmm_sil, 4),
                "nComponents":     gmm.n_components if gmm else 0,
            },
            "trainedAt":   datetime.now().isoformat(),
            "sampleCount": len(records),
            "labelDistribution": {
                "onTime":  on_time_count,
                "delayed": delayed_count,
            },
            "validationMethod": "LeaveOneOut (LOO-CV) — recommended for n<50",
        }

        project_count = fetch_completed_project_count()
        registry.update(
            reg, clf, scaler, gmm, gmm_scaler,
            project_count, loo_mae, r2,
            loo_accuracy, accuracy, precision, recall, f1,
            conf_mat, gmm_sil, accuracy_metrics,
        )

        log.info("=" * 60)
        log.info(
            f"  Training Complete  "
            f"[n={len(records)}  LOO-MAE={loo_mae:.0f}h  LOO-Acc={loo_accuracy:.4f}  sil={gmm_sil:.4f}]"
        )
        log.info(f"  Next scheduled train: {registry.next_train_at.strftime('%Y-%m-%d %H:%M:%S')}")
        log.info("=" * 60)
        return True

    except Exception as e:
        log.error(f"[TRAIN] Pipeline failed: {e}", exc_info=True)
        return False

    finally:
        registry.training_lock.release()


# =================================================================
# SECTION 4 - AUTO RETRAINING
# =================================================================

def check_threshold_triggers() -> Tuple[bool, str]:
    if not registry.is_ready():
        return False, ""

    current_count = fetch_completed_project_count()
    new_projects  = current_count - registry.project_count_at_train

    if new_projects >= TrainingConfig.NEW_PROJECTS_THRESHOLD:
        return True, f"new_projects_threshold ({new_projects} new projects added)"

    if registry.last_mae is not None:
        rows    = fetch_all_projects()
        records = []
        for row in rows:
            feats = build_features(row)
            if feats is None:
                continue
            planned_hours = float(row.get("planned_hours")      or 0)
            hours_logged  = float(row.get("total_hours_logged") or 0)
            is_active     = bool(row.get("is_active"))

            feats["remaining_hours"] = (
                max(planned_hours - hours_logged, 0.0) if is_active
                else max(hours_logged - planned_hours, 0.0)
            )
            feats["on_time"] = 1 if hours_logged <= planned_hours else 0
            records.append(feats)

        if len(records) >= TrainingConfig.MIN_PROJECTS_REQUIRED:
            df       = pd.DataFrame(records)
            X_fresh  = df[FEATURE_COLS].fillna(0).values
            yr_fresh = df["remaining_hours"].values
            yc_fresh = df["on_time"].values

            reg, clf, scaler = registry.get_models()
            X_scaled         = _safe_transform(scaler, X_fresh)

            yr_pred     = reg.predict(X_scaled)
            current_mae = float(mean_absolute_error(yr_fresh, yr_pred))

            if current_mae > TrainingConfig.MAE_DEGRADATION_LIMIT:
                return True, f"mae_degradation (current MAE={current_mae:.2f})"

            if not isinstance(clf, DummyClassifier):
                yc_pred     = clf.predict(X_scaled)
                current_acc = float(accuracy_score(yc_fresh, yc_pred))
                if current_acc < TrainingConfig.ACCURACY_DROP_LIMIT:
                    return True, f"accuracy_drop (current acc={current_acc:.4f})"

    return False, ""


def auto_retrain_loop():
    """Background daemon thread."""
    CHECK_INTERVAL_SECONDS = 1800
    log.info("[AUTO-RETRAIN] Background thread started.")

    while True:
        time.sleep(CHECK_INTERVAL_SECONDS)
        try:
            if registry.next_train_at is None:
                log.info("[AUTO-RETRAIN] next_train_at is None — retrying startup training.")
                run_training_pipeline(reason="startup_retry")
                continue

            if datetime.now() >= registry.next_train_at:
                log.info("[AUTO-RETRAIN] Periodic trigger fired.")
                run_training_pipeline(reason="periodic")
                continue

            should_retrain, reason = check_threshold_triggers()
            if should_retrain:
                log.info(f"[AUTO-RETRAIN] Threshold trigger: {reason}")
                run_training_pipeline(reason=f"threshold:{reason}")

        except Exception as e:
            log.error(f"[AUTO-RETRAIN] Error in loop: {e}", exc_info=True)


# =================================================================
# SECTION 5 - PREDICTION FUNCTIONS
# =================================================================

def predict_completion(project_id: int) -> dict:
    row = fetch_project_data(project_id)
    if not row:
        raise ProjectNotFoundError(f"Project {project_id} not found.")

    planned_hours = float(row.get("planned_hours")      or 0)
    hours_logged  = float(row.get("total_hours_logged") or 0)

    if hours_logged == 0:
        return {
            "projectId":      project_id,
            "remainingHours": round(planned_hours, 2),
            "hoursLogged":    0.0,
            "plannedHours":   round(planned_hours, 2),
            "percentUsed":    0.0,
            "budgetStatus":   "ON_TRACK",
        }

    feats = build_features(row)
    if feats is None:
        raise InsufficientDataError("Insufficient project data to build features.")

    reg, clf, scaler = registry.get_models()
    X  = np.array([[feats[c] for c in FEATURE_COLS]])
    Xs = _safe_transform(scaler, X)

    remaining_hours = max(float(reg.predict(Xs)[0]), 0.0)
    percent_used    = round(hours_logged / planned_hours * 100, 2) if planned_hours > 0 else 0.0

    return {
        "projectId":      project_id,
        "remainingHours": round(remaining_hours, 2),
        "hoursLogged":    round(hours_logged, 2),
        "plannedHours":   round(planned_hours, 2),
        "percentUsed":    percent_used,
        "budgetStatus":   "OVER_BUDGET" if hours_logged > planned_hours else "ON_TRACK",
    }


def predict_delay(project_id: int) -> dict:
    row = fetch_project_data(project_id)
    if not row:
        raise ProjectNotFoundError(f"Project {project_id} not found.")

    planned_hours = float(row.get("planned_hours")      or 0)
    hours_logged  = float(row.get("total_hours_logged") or 0)

    if hours_logged == 0:
        return {
            "projectId":         project_id,
            "status":            "ON_TIME",
            "delayProbability":  0.0,
            "onTimeProbability": 1.0,
        }

    feats = build_features(row)
    if feats is None:
        raise InsufficientDataError("Insufficient project data to build features.")

    reg, clf, scaler = registry.get_models()
    X  = np.array([[feats[c] for c in FEATURE_COLS]])
    Xs = _safe_transform(scaler, X)

    # Decision Tree predict_proba gives calibrated probabilities for small data.
    # Works for both DecisionTreeClassifier and DummyClassifier.
    proba       = clf.predict_proba(Xs)[0]
    delay_prob  = round(float(proba[0]), 4)
    ontime_prob = round(float(proba[1]), 4)

    # Hard override: if already factually over budget, report it clearly.
    # The model should catch this too, but the hard rule is a safety net.
    if hours_logged > planned_hours:
        delay_prob  = max(delay_prob, 0.95)
        ontime_prob = round(1.0 - delay_prob, 4)
        log.info(f"[DELAY] Project {project_id} — over-budget confirmed.")

    # Blocked tasks add risk independent of hours.
    if feats.get("blocked_tasks", 0) > 3:
        delay_prob  = min(round(delay_prob + 0.10, 4), 1.0)
        ontime_prob = round(1.0 - delay_prob, 4)
        log.info(f"[DELAY] Project {project_id} — blocked tasks risk added.")

    return {
        "projectId":         project_id,
        "status":            "DELAYED" if delay_prob >= 0.5 else "ON_TIME",
        "delayProbability":  delay_prob,
        "onTimeProbability": ontime_prob,
    }


# =================================================================
# SECTION 6 - FLASK ENDPOINTS
# =================================================================

def _parse_project_id(raw: str) -> int:
    if not raw:
        raise ValueError("projectid is required.")
    try:
        return int(raw)
    except ValueError:
        raise ValueError("projectid must be a valid integer.")


def _models_ready_guard():
    if not registry.is_ready():
        return jsonify({"error": "Models not ready. Server is still initialising."}), 503
    return None


def _handle_prediction_error(e: Exception):
    if isinstance(e, ProjectNotFoundError):
        return jsonify({"error": str(e)}), 404
    if isinstance(e, InsufficientDataError):
        return jsonify({"error": str(e)}), 422
    if isinstance(e, mysql.connector.Error):
        log.error(f"DB error: {e}")
        return jsonify({"error": "Database error", "details": str(e)}), 500
    log.error(f"Unexpected error: {e}", exc_info=True)
    return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/recommendemployees", methods=["GET"])
def endpoint_recommend():
    guard = _models_ready_guard()
    if guard: return guard

    activity_name  = request.args.get("activityname", "").strip()
    project_id_raw = request.args.get("projectid", "").strip()

    if not activity_name:
        return jsonify({"error": "activityname is required"}), 400
    if len(activity_name) > 255:
        return jsonify({"error": "activityname must be 255 characters or fewer"}), 400
    if not all(c.isalnum() or c in " _-.()" for c in activity_name):
        return jsonify({"error": "activityname contains invalid characters"}), 400

    project_id = None
    if project_id_raw:
        try:
            project_id = _parse_project_id(project_id_raw)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    try:
        results = recommend(activity_name, project_id)
        log.info(f"[RECOMMEND] activity={activity_name} project={project_id} -> {len(results)} employees")
        return jsonify(results), 200
    except Exception as e:
        return _handle_prediction_error(e)


@app.route("/predictcompletion", methods=["GET"])
def endpoint_predict_completion():
    guard = _models_ready_guard()
    if guard: return guard

    try:
        pid    = _parse_project_id(request.args.get("projectid", "").strip())
        result = predict_completion(pid)
        log.info(f"[COMPLETION] project={pid} -> {result}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return _handle_prediction_error(e)


@app.route("/predictdelay", methods=["GET"])
def endpoint_predict_delay():
    guard = _models_ready_guard()
    if guard: return guard

    try:
        pid    = _parse_project_id(request.args.get("projectid", "").strip())
        result = predict_delay(pid)
        log.info(f"[DELAY] project={pid} -> {result}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return _handle_prediction_error(e)


@app.route("/projectinsights", methods=["GET"])
def endpoint_project_insights():
    guard = _models_ready_guard()
    if guard: return guard

    try:
        pid   = _parse_project_id(request.args.get("projectid", "").strip())
        comp  = predict_completion(pid)
        delay = predict_delay(pid)
        result = {
            "projectId":        pid,
            "remainingHours":   comp["remainingHours"],
            "plannedHours":     comp["plannedHours"],
            "hoursLogged":      comp["hoursLogged"],
            "percentUsed":      comp["percentUsed"],
            "budgetStatus":     comp["budgetStatus"],
            "status":           delay["status"],
            "delayProbability": delay["delayProbability"],
        }
        log.info(f"[INSIGHTS] project={pid} -> {result}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return _handle_prediction_error(e)


@app.route("/modelstatus", methods=["GET"])
def endpoint_model_status():
    is_ready = registry.is_ready()
    status   = registry.status()
    status["isReady"] = is_ready
    return jsonify(status), 200 if is_ready else 503


@app.route("/modelaccuracy", methods=["GET"])
def endpoint_model_accuracy():
    if not registry.is_ready():
        return jsonify({"error": "Models not ready yet."}), 503
    with registry._lock:
        metrics = dict(registry.accuracy_metrics)
    if not metrics:
        return jsonify({"error": "Accuracy metrics not available yet."}), 503
    return jsonify(metrics), 200


# =================================================================
# ENTRY POINT
# =================================================================

if __name__ == "__main__":
    print("=" * 65)
    print("  AI Project Intelligence System  (DecisionTree + KNN Edition)")
    print("=" * 65)

    _init_pool()

    loaded_from_disk = registry.load_from_disk()
    if loaded_from_disk:
        log.info("Loaded existing models from disk — skipping startup training.")
        if registry.next_train_at is None or datetime.now() >= registry.next_train_at:
            log.info("Persisted schedule is overdue — retraining now.")
            run_training_pipeline(reason="overdue")
    else:
        log.info("No persisted models found — training from DB...")
        success = run_training_pipeline(reason="startup")
        if not success:
            log.warning(
                "Startup training skipped (insufficient DB data). "
                "Endpoints return 503 until data is available. "
                "Background thread retries every 30 minutes."
            )

    retrain_thread = threading.Thread(
        target = auto_retrain_loop,
        name   = "AutoRetrainThread",
        daemon = True,
    )
    retrain_thread.start()
    log.info("Auto-retrain background thread started.")

    print("  GET  /recommendemployees?activityname=modeling&projectid=10")
    print("  GET  /predictcompletion?projectid=10")
    print("  GET  /predictdelay?projectid=10")
    print("  GET  /projectinsights?projectid=10")
    print("  GET  /modelstatus")
    print("  GET  /modelaccuracy")
    print("=" * 65)

    try:
        from waitress import serve
        log.info("Starting waitress WSGI server on 0.0.0.0:5000 ...")
        serve(app, host="0.0.0.0", port=5000, threads=8)
    except ImportError:
        log.warning("waitress not installed — falling back to Flask dev server.")
        app.run(debug=False, host="0.0.0.0", port=5000)