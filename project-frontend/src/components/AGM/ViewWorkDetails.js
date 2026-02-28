import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import styles from "../../styles/Employee/EmployeeWorkForm.module.css";
import { useEmployee } from "../../context/EmployeeContext";
import { useToast } from "../../context/ToastContext";


const ViewWorkDetails = ({ work, onBack,onUpdate }) => {
  const { employee } = useEmployee();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const {showToast} = useToast();

  const [formData, setFormData] = useState({
    id: "",
    employeeName: "",
    managerName: "",
    projectName: "",
    activityName: "",
    date: "",
    workHours: "",
    startTime: "",
    endTime: "",
    projectActivity: "",
    assignedWork: "",
    status: "",
    remarks: "",
  });

  const [type, setType] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [projectActivityOptions] = useState([
    "IFRA",
    "IFA",
    "REIFA",
    "IFC",
    "REIFC",
    "BFA",
    "Field Measurement",
    "Client Rework",
    "Internal Rework",
  ]);

  // 🟢 Load work data
  useEffect(() => {
    if (work) {
      setFormData({
        id: work.id || "",
        employeeName: work.employeeName || "",
        managerName: work.managerName || "",
        projectName: work.projectName || "",
        activityName: work.activityName || "",
        date: work.date || "",
        workHours: work.workHours || "",
        startTime: work.startTime?.substring(0, 5) || "",
        endTime: work.endTime?.substring(0, 5) || "",
        projectActivity: work.projectActivity || "",
        assignedWork: work.assignedWork || "",
        status: work.status || "",
        remarks: work.remarks || "",
      });
    }
  }, [work]);

  useEffect(() => {
    if (!work?.managerId) return; // ✅ ensure managerId is present before API call

    axiosInstance
      .get(`/project/${work.managerId}`)
      .then((res) => {
        setProjects(Array.isArray(res.data) ? res.data : []);
      })
      
  }, [work?.managerId]);



  // 🟢 Fetch Type
  useEffect(() => {
    if (!work?.activityId) return;

    axiosInstance
      .get(`/activity/get-type/${work.activityId}`)
      .then((res) => {
        setType(res.data || "");
        setSelectedType(res.data || "");
      })
      .catch((err) => {
      
        setType("N/A");
      });
  }, [work?.activityId]);

  // 🟢 Fetch all activities
  useEffect(() => {
    axiosInstance
      .get("/activity/")
      .then((res) => {
        setActivities(res.data);
        setFilteredActivities(res.data);
      })
      
  }, []);

  // 🟢 Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleUpdate = async () => {
    const payload = {
      employeeId: work.id,
      managerId: work.managerId,
      projectId: selectedProjectId || work.projectId,
      activityId: selectedActivityId || work.activityId,
      date: formData.date,
      workHours: parseFloat(formData.workHours) || 0,
      startTime: formData.startTime + ":00",
      endTime: formData.endTime + ":00",
      projectActivity: formData.projectActivity,
      assignedWork: formData.assignedWork,
      status: formData.status,
      remarks: formData.remarks,
    };

    

    try {
      const res = await axiosInstance.put(
        `/workdetails/edit-log/${formData.id}`,
        payload
      );
      
      if (onUpdate) onUpdate(res.data);
      showToast("Work log updated successfully!","success");
      setIsEditing(false);
    } catch (err) {
  
     const backendMsg =
      err.response?.data?.message || err.response?.data || "Something went wrong while stopping work!";

    // Show the exact backend message to user
    showToast(backendMsg,"error");
    }
  };


  // 🟢 Handle dropdown and input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "startTime" || name === "endTime") {
      calculateWorkHours(name === "startTime" ? value : formData.startTime, name === "endTime" ? value : formData.endTime);
    }
  };

  // 🟢 Handle Type change (similar to EmployeeWorkForm)
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);

    const filtered = activities.filter(
      (act) => act.mainType && act.mainType.toLowerCase() === newType.toLowerCase()
    );
    setFilteredActivities(filtered);
  };

  // 🟢 Calculate work hours based on start and end
  const calculateWorkHours = (start, end) => {
    if (!start || !end) return;

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;

    const diffHours = (diffMinutes / 60).toFixed(2);
    setFormData((prev) => ({ ...prev, workHours: diffHours }));
  };

  if (!work) return <p>No work details available.</p>;

  return (
    <div className={styles.wrapper}>
      <header className={styles.workDetailsHeader}>
        <h1>Work Details</h1>
      </header>

      <div className={styles.container}>
        <form className={styles.form}>
          {/* 🔹 Top Row */}
          <div className={styles.topRow}>
            <div className={styles.field}>
              <label>Date</label>
              <input type="text" value={formData.date} readOnly />
            </div>
            <div className={styles.field}>
              <label>Employee</label>
              <input type="text" value={formData.employeeName} readOnly />
            </div>
            <div className={styles.field}>
              <label>Manager</label>
              <input type="text" value={formData.managerName} readOnly />
            </div>
          </div>

          {/* 🔹 Project / Activity / Type */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Project</label>
              {isEditing ? (
                <select
                  name="projectName"
                  value={formData.projectName}
                  onChange={(e) => {
                    const selectedProject = projects.find(
                      (p) => p.projectName === e.target.value
                    );
                    setSelectedProjectId(selectedProject?.id || null);
                    setFormData((prev) => ({
                      ...prev,
                      projectName: selectedProject?.projectName || "",
                    }));
                  }}

                >
                  <option value="">Select Project</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.projectName}>
                      {proj.projectName}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" value={formData.projectName} readOnly />
              )}
            </div>


            <div className={styles.field}>
              <label>Activity</label>
              {isEditing ? (
                <select
                  name="activityName"
                  value={formData.activityName}
                  onChange={(e) => {
                    const selectedAct = filteredActivities.find(
                      (act) => act.activityName === e.target.value
                    );
                    setSelectedActivityId(selectedAct?.id || null);
                    setFormData((prev) => ({
                      ...prev,
                      activityName: e.target.value,
                    }));
                  }}

                >
                  <option value="">Select Activity</option>
                  {filteredActivities.map((act) => (
                    <option key={act.id} value={act.activityName}>
                      {act.activityName}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" value={formData.activityName} readOnly />
              )}
            </div>

            <div className={styles.field}>
              <label>Type</label>
              {isEditing ? (
                <select value={selectedType} onChange={handleTypeChange}>
                  <option value="">Select Type</option>
                  <option value="Modeling">Modeling</option>
                  <option value="Checking">Checking</option>
                  <option value="Detailing">Detailing</option>
                  <option value="Common">Common</option>
                </select>
              ) : (
                <input type="text" value={type} readOnly />
              )}
            </div>
          </div>

          {/* 🔹 Time Row */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
            <div className={styles.field}>
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
            <div className={styles.field}>
              <label>Work Hours</label>
              <input type="text" value={formData.workHours} readOnly />
            </div>
          </div>

          {/* 🔹 Project Activity & Assigned Work */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Project Activity</label>
              {isEditing ? (
                <select
                  name="projectActivity"
                  value={formData.projectActivity}
                  onChange={handleChange}
                >
                  <option value="">Select Project Activity</option>
                  {projectActivityOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" value={formData.projectActivity} readOnly />
              )}
            </div>
            <div className={styles.field}>
              <label>Assigned Work</label>
              {isEditing ? (
                <input
                  type="text"
                  name="assignedWork"
                  value={formData.assignedWork}
                  onChange={handleChange}
                />
              ) : (
                <input type="text" value={formData.assignedWork} readOnly />
              )}

            </div>
          </div>

          {/* 🔹 Status */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              ) : (
                <input type="text" value={formData.status} readOnly />
              )}

            </div>
          </div>

          {/* 🔹 Remarks */}
          {/* 🔹 Remarks */}
<div className={styles.row}>
  <div className={styles.field} style={{ gridColumn: "span 3" }}>
    <label>Remarks</label>
    {isEditing ? (
      <textarea
        name="remarks"
        value={formData.remarks}
        onChange={handleChange}
      />
    ) : (
      <textarea value={formData.remarks} readOnly />
    )}
  </div>
</div>


          {/* 🔹 Buttons */}
          <div className={styles.row} style={{ justifyContent: "center", gap: "10px" }}>
            <button type="button" className={styles.stopBtn} onClick={onBack}>
              Back
            </button>
            <button
              type="button"
              className={isEditing ? styles.submitBtn : styles.startBtn}
              onClick={isEditing ? handleUpdate : handleEditToggle}
            >
              {isEditing ? "Save" : "Edit"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewWorkDetails;
