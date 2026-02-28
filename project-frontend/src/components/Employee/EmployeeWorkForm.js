import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import styles from "../../styles/Employee/EmployeeWorkForm.module.css";
import { useEmployee } from "../../context/EmployeeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const EmployeeWorkForm = () => {
  const { employee, loading } = useEmployee();
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [startDisabled, setStartDisabled] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [assignedActivities, setAssignedActivities] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { work } = location.state || {};

  const { showToast } = useToast();
  // manager view/edit if present

  const [activeWorkId, setActiveWorkId] = useState(() => {
    return localStorage.getItem("activeWorkId") || null;
  });

  const [formData, setFormData] = useState({
    projectId: "",
    clientName: "",
    projectActivityType: "",
    activityId: "",
    activityName: "",
    category: "",
    startTime: "",
    endTime: "",
    workHours: "",
    projectActivity: "",
    assignedWork: "",
    status: "Pending",
    remarks: "",
    assignedWorkId: ""
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isViewMode, setIsViewMode] = useState(!!work);
  const [isEditMode, setIsEditMode] = useState(false);

  // persist activeWorkId to localStorage
  useEffect(() => {
    if (activeWorkId) {
      localStorage.setItem("activeWorkId", activeWorkId);
    } else {
      localStorage.removeItem("activeWorkId");
    }
  }, [activeWorkId]);

  // Fetch projects and activities
  useEffect(() => {
    if (!employee || !employee.reportingToId) return;

    axiosInstance
      .get(`/project/${employee.reportingToId}`)
      .then((res) => {
        //const filtered = res.data.filter(project => project.tlId!=null);
        setProjects(res.data);
      })


    axiosInstance
      .get("/activity/")
      .then((res) => setActivities(res.data))

  }, [employee]);

  // Prevent back navigation on /employee routes (only while this component is mounted)
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent back navigation only on employee pages
      if (location.pathname.startsWith("/employee")) {
        // Replace current history entry with same path to stop back navigation effect
        navigate(location.pathname, { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location]);

  // Mirror existing filtered activities behavior
  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  // Resume or restore logic — ONLY run for employee mode (skip when manager view is present)
  useEffect(() => {

    // helper to enable stop button after remaining ms


    // CASE 1: If there's an activeWorkId (stopped-but-not-submitted), fetch by ID
    if (activeWorkId) {
      axiosInstance
        .get(`/workdetails/${activeWorkId}`)
        .then(async (res) => {
          const workData = res.data;

          if (!workData) {
            // no work found by id -> fallback to check active
            checkActiveRunningWork();
            return;
          }

          await fetchAssignedActivities(workData.projectId, employee.empId);

          const selectedProject = projects.find(
            (proj) => proj.id.toString() === workData.projectId?.toString()
          );
          const selectedActivity = activities.find(
            (act) => act.id.toString() === workData.activityId?.toString()
          );

          // Autofill form for stopped or stopped-but-not-submitted work
          setFormData({
            projectId: workData.projectId?.toString() || "",
            clientName: selectedProject ? selectedProject.clientName : "",
            projectActivityType: selectedActivity ? selectedActivity.mainType : "",
            activityId: workData.activityId?.toString() || "",
            activityName: selectedActivity?.activityName?.toString() || "",
            category: selectedActivity ? selectedActivity.category : "",
            startTime: workData.startTime ? workData.startTime.substring(0, 5) : "",
            endTime: workData.endTime ? workData.endTime.substring(0, 5) : "",
            workHours: workData.workHours || "",
            projectActivity: workData.projectActivity || "",
            assignedWork: workData.assignedWork || "",
            assignedWorkId: workData.assignedWorkId || "",
            status: workData.status || "Pending",
            remarks: workData.remarks || "",
          });

          // If it's still running (no endTime) — set running state and compute wait time for stop button
          if (!workData.endTime) {
            setIsRunning(true);
            setStartDisabled(true);
            setSubmitDisabled(true);

            const now = new Date();
            const [startH, startM] = (workData.startTime || "00:00").split(":").map(Number);
            const startDate = new Date();
            startDate.setHours(startH, startM, 0);

          } else {
            // stopped work — ready to submit
            setIsRunning(false);
            setStartDisabled(true);

            setSubmitDisabled(false);
          }
        })
        .catch((err) => {
          // If fetching by ID fails, fall back to checking active running work
          checkActiveRunningWork();
        });
    } else {
      // CASE 2: No activeWorkId — check if there's a currently active running work for this employee

      checkActiveRunningWork();
    }


    function checkActiveRunningWork() {
      axiosInstance
        .get(`/workdetails/active/${employee.empId}`)
        .then((res) => {
          const active = res.data;

          if (active && !active.endTime) {
            const selectedProject = projects.find(
              (proj) => proj.id.toString() === active.projectId?.toString()
            );
            const selectedActivity = activities.find(
              (act) => act.id.toString() === active.activityId?.toString()
            );

            //const assigned = assignedActivities.find((a) => a.id.toString()===active.)

            // Store running work ID locally so the stopped-but-not-submitted flow works
            setActiveWorkId(active.id);


            // Autofill form for the running session
            setFormData({
              projectId: active.projectId?.toString() || "",
              clientName: selectedProject ? selectedProject.clientName : "",
              projectActivityType: selectedActivity ? selectedActivity.mainType : "",
              activityId: active.activityId?.toString() || "",
              category: selectedActivity ? selectedActivity.category : "",
              startTime: active.startTime ? active.startTime.substring(0, 5) : "",
              endTime: "",
              workHours: "",
              assignedWork: active.assignedWork || "",
              assignedWorkId: active.assignedWorkId || "",
              projectActivity: active.projectActivity || "",
              status: active.status || "Pending",
              remarks: active.remarks || "",
            });

            // maintain button states
            setIsRunning(true);
            setStartDisabled(true);
            setSubmitDisabled(true);

            const now = new Date();
            const [startH, startM] = (active.startTime || "00:00").split(":").map(Number);
            const startDate = new Date();
            startDate.setHours(startH, startM, 0);


          } else {
            // No active work found — reset to idle
            setIsRunning(false);
            setStartDisabled(false);

            setSubmitDisabled(true);
          }
        })
        .catch((err) => {
          // In case of error, safely stay idle
          setIsRunning(false);
          setStartDisabled(false);

          setSubmitDisabled(true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, projects, activities, activeWorkId]);

  const fetchAssignedActivities = async (projectId, employeeId) => {
    try {
      const response = await axiosInstance.get(
        `/assigned-work/project/${projectId}/employee/${employeeId}/active`
      );

      setAssignedActivities(response.data);
    } catch (error) {

      setAssignedActivities([]);
    }
  };


  const handleDiscard = () => {
    if (!activeWorkId) {
      showToast("No active work to discard.", "info");
      return;
    }

    if (!window.confirm("Are you sure you want to discard this work?")) return;

    axiosInstance
      .delete(`/workdetails/work/discard/${activeWorkId}`)
      .then(() => {
        showToast("Work discarded successfully!", "success");

        // Clear local storage
        localStorage.removeItem("activeWorkId");
        setActiveWorkId(null);

        // Reset form data to initial
        setFormData({
          projectId: "",
          clientName: "",
          projectActivityType: "",
          activityId: "",
          activityName: "",
          category: "",
          startTime: "",
          endTime: "",
          workHours: "",
          projectActivity: "",
          assignedWork: "",
          assignedWorkId: "",
          status: "Pending",
          remarks: "",
        });

        // Reset states
        setIsRunning(false);
        setStartDisabled(false);

        setSubmitDisabled(true);
      })
      .catch((err) => {

        showToast("Failed to discard work.", "error");
      });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Generic field update
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ✅ When changing activity type for Special or Idle Work
    if (name === "projectActivityType") {
      const selectedType = value;
      const selectedActivityName =
        formData.assignedWork === "Special Work" ? "Special Activity" : "Idle";

      // Find matching activity by both name + mainType
      const match = activities.find(
        (act) =>
          act.activityName.toLowerCase() === selectedActivityName.toLowerCase() &&
          act.mainType.toLowerCase() === selectedType.toLowerCase()
      );

      if (match) {
        setFormData((prev) => ({
          ...prev,
          projectActivityType: selectedType,
          activityName: match.activityName,
          activityId: match.id,
          category: match.category,
        }));
      }
    }
  };


  const handleProjectChange = (e) => {
    const selectedProject = projects.find((proj) => proj.id.toString() === e.target.value);

    // Reset form data first
    setFormData((prev) => ({
      ...prev,
      projectId: e.target.value,
      clientName: selectedProject ? selectedProject.clientName : "",
      projectActivityType: "",
      activityId: "",
      category: "",
      projectActivity: selectedProject?.projectActivityStatus || "",
    }));


    // Clear previous assigned activities
    setAssignedActivities([]);

    // Fetch assigned activities ONLY if project is selected
    if (e.target.value && employee) {
      fetchAssignedActivities(e.target.value, employee.empId);
    }
  };

  // Employee's Start/Stop flow (preserved)
  const handleStartStop = () => {
    if (!isRunning) {
      if (!isFormValid(false)) {
        showToast("Please fill in all required fields before starting.", "warning");
        return;
      }

      const now = new Date();
      const start =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      const payload = {
        employeeId: employee.empId,
        managerId: employee.reportingToId,
        projectId: formData.projectId,
        activityId: formData.activityId,
        activityName: formData.activityName,
        date: new Date().toISOString().split("T")[0],
        startTime: start + ":00",
        projectActivity: formData.projectActivity,
        assignedWork: formData.assignedWork,
        assignedWorkId: formData.assignedWorkId || Number("0"),
        status: formData.status,
        remarks: formData.remarks,
      };


      axiosInstance
        .post("/workdetails/save", payload)
        .then((res) => {
          const workId = res.data.id;
          setActiveWorkId(workId);

          setFormData((prev) => ({
            ...prev,
            startTime: start, // only add start time
          }));


          setIsRunning(true);

          setSubmitDisabled(true);

        })
        .catch((err) => {

          showToast("Could not start activity.", "error");
        });
    } else {

      const confirmStop = window.confirm(
        "Are you sure you want to stop this activity?"
      );

      if (!confirmStop) return;
      const now = new Date();
  const end =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

      const [startH, startM] = formData.startTime.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      const diffHours = (diffMinutes / 60).toFixed(2);
      console.log(end)
      console.log(diffHours)
      axiosInstance
        .put(`/workdetails/stop/${employee.empId}`, null, {
          params: {
            endTime: end + ":00",
            workHours: diffHours,
          },
        })
        .then(() => {
          setFormData((prev) => ({
            ...prev,
            endTime: end,
            workHours: diffHours,
          }));
          setIsRunning(false);

          setStartDisabled(true);
          setSubmitDisabled(false);
        })
        .catch((err) => {


          // Extract backend error message safely
          const backendMsg =
            err.response?.data?.message || err.response?.data || "Something went wrong while stopping work!";
          console.log(backendMsg)
          // Show the exact backend message to user
          showToast(backendMsg, "error");
        });
    }
  };


  const handleAssignedActivityChange = (e) => {
    const selected = e.target.value;

    // ✅ If "Special Work" or "Idle"
    if (selected === "Special Work" || selected === "Idle") {
      setFormData((prev) => ({
        ...prev,
        assignedWork: selected,
        projectActivityType: "",
        activityName: selected === "Special Work" ? "Special Activity" : "Idle",
        activityId: "",
        category: "",
      }));
      return;
    }

    // ✅ Normal assigned work auto-fill
    const selectedAssigned = assignedActivities.find(
      (act) => act.id.toString() === selected
    );

    const act = activities.find(
      (a) => a.id === selectedAssigned?.activityId
    );

    if (selectedAssigned && act) {
      setFormData((prev) => ({
        ...prev,
        assignedWorkId: selectedAssigned.id,
        assignedWork: selectedAssigned.description,
        projectActivityType: act.mainType,
        activityName: act.activityName,
        activityId: act.id,
        category: act.category,
      }));
    }
  };



  // Employee submit or Manager update (preserved)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employee) return;
    if (!isFormValid(true)) {
      showToast("Please fill in all required fields before submitting.", "warning");
      return;
    }

    const payload = {
      assignedWorkId: formData.assignedWorkId,
      activityId: formData.activityId, 
      status: formData.status,
      remarks: formData.remarks,
    };


    axiosInstance
      .put(`/workdetails/savefinal`, payload, {
        params: { activeWorkId: activeWorkId },
      })
      .then(() => {
        showToast("Work submitted successfully!", "success");
        setFormData({
          projectId: "",
          clientName: "",
          activityId: "",
          activityName: "",
          category: "",
          startTime: "",
          endTime: "",
          workHours: "",
          projectActivity: "",
          assignedWork: "",
          assignedWorkId: "",
          status: "Pending",
          remarks: "",
        });
        setSubmitDisabled(true);
        setStartDisabled(false);
        setActiveWorkId(null);
      })
      .catch((err) => {

        showToast("Submission failed!", "error");
      });
  };

  const isFormValid = (checkStatus = false) => {
    const {
      projectId,
      projectActivityType,
      activityId,
      category,
      //projectActivity,
      assignedWork,
      status,
    } = formData;


    const baseFieldsFilled =
      projectId &&
      projectActivityType &&
      activityId &&
      category &&
      //projectActivity &&
      assignedWork;

    return checkStatus ? baseFieldsFilled && status : baseFieldsFilled;
  };

  const isReadOnly = (field) => {
    if (!isViewMode) return false;
    if (!isEditMode) return true;
    return ![
      //"projectActivity",
      "status",
      "startTime",
      "endTime",
      "remarks",
    ].includes(field);
  };

  if (loading) return <p>Loading employee details...</p>;

  return (
    <div>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Employee details */}
          <div className={styles.topRow}>
            <div className={styles.field}>
              <label>Employee ID</label>
              <input type="text" value={employee.empId} readOnly />
            </div>
            <div className={styles.field}>
              <label>Employee Name</label>
              <input type="text" value={employee.name} readOnly />
            </div>
            <div className={styles.field}>
              <label>Designation</label>
              <input type="text" value={employee.designation} readOnly />
            </div>
          </div>

          {/* Project row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Project Name</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleProjectChange}
                disabled={isReadOnly("projectId")}
              >
                <option value="">Project Name</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Client Name</label>
              <input type="text" value={formData.clientName} readOnly />
            </div>

            <div className={styles.field}>
              <label>Assigned Work</label>
              <select
                name="assignedWorkId"
                value={
                  formData.assignedWork === "Special Work" ? "Special Work"
                    : formData.assignedWork === "Idle" ? "Idle"
                      : formData.assignedWorkId || ""
                }
                onChange={handleAssignedActivityChange}
              >
                <option value="">Select Assigned Activity</option>
                {assignedActivities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.description}
                  </option>

                ))}
                <option value="Special Work">Special Work</option>
                <option value="Idle">Idle</option>
              </select>

            </div>
          </div>

          {/* Activity row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Activity Type</label>

              {(formData.assignedWork === "Special Work" || formData.assignedWork === "Idle") ? (
                <select
                  name="projectActivityType"
                  value={formData.projectActivityType}
                  onChange={handleChange}
                >
                  <option value="">Select Activity Type</option>
                  <option value="Modeling">Modeling</option>
                  <option value="Checking">Checking</option>
                  <option value="Detailing">Detailing</option>
                  {formData.assignedWork === "Idle" && (
                    <option value="Common">Common</option>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.projectActivityType}
                  readOnly
                  placeholder="Activity type"
                />
              )}
            </div>



            <div className={styles.field}>
              <label>Activity</label>
              {/* <select
                  name="activityId"
                  value={formData.activityId}
                  onChange={handleActivityChange}
                  disabled={isReadOnly("activityId")}
                >
                  <option value="">Activity</option>
                  {filteredActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.activityName}
                    </option>
                  ))}
                </select> */}
              <input
                type="text"
                value={formData.activityName}
                readOnly
                placeholder="Activity"
              />
            </div>

            <div className={styles.field}>
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                readOnly
                placeholder="Category"
              />
            </div>
          </div>

          {/* Time row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <label>Work Hours</label>
              <input type="text" value={formData.workHours} readOnly />
            </div>
          </div>

          {/* Work details */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Project Activity</label>
              {/* <select
                  name="projectActivity"
                  value={formData.projectActivity}
                  onChange={handleChange}
                  disabled={isReadOnly("projectActivity")}
                >
                  <option value="">Project Activity</option>
                  <option value="IFRA">IFRA</option>
                  <option value="Client Rework">Client Rework</option>
                  <option value="Internal Rework">Internal Rework</option>
                </select> */}
              <input
                type="text"
                value={formData.projectActivity}
                readOnly
                placeholder="Project Activity"
              />
            </div>



            <div className={styles.field}>
              <label>Date</label>
              <input
                type="text"
                value={new Date().toISOString().split("T")[0]}
                readOnly
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isReadOnly("status")}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                readOnly={isReadOnly("remarks")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.row}>
            {!isViewMode ? (
              <>
                {!isRunning ? (
                  <button
                    type="button"
                    onClick={handleStartStop}
                    className={`${styles.startBtn} ${startDisabled ? styles.buttonDisabled : ""}`}
                    disabled={startDisabled}
                  >
                    Start
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartStop}
                    className={styles.stopBtn}
                  >
                    Stop
                  </button>
                )}

                <button
                  type="submit"
                  className={`${styles.submitBtn} ${submitDisabled ? styles.buttonDisabled : ""}`}
                  disabled={submitDisabled}
                >
                  Submit Work
                </button>

                <button
                  type="button"
                  onClick={handleDiscard}
                  className={`${styles.discardBtn}`}
                >
                  Discard
                </button>
              </>
            ) : !isEditMode ? (
              <button
                type="button"
                className={styles.startBtn}
                onClick={() => setIsEditMode(true)}
              >
                Edit
              </button>
            ) : (
              <button type="submit" className={styles.submitBtn}>
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeWorkForm;