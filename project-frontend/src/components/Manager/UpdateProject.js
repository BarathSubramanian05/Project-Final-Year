import React, { useEffect, useState } from "react";
import { useEmployee } from "../../context/EmployeeContext";
import styles from "../../styles/Employee/LeavePermissionForm.module.css";
import { useToast } from "../../context/ToastContext";
import axiosInstance from "../axiosConfig";

const ManagerProjectActions = () => {
  const { employee, loading } = useEmployee();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [extraHours, setExtraHours] = useState("");
  const [tab, setTab] = useState("Send Request");
  const [requestType, setRequestType] = useState("");
  const [reason, setReason] = useState("");
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [newCompletionDate, setNewCompletionDate] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const { showToast } = useToast();


  const fetchProjects = async () => {
    if (!employee?.empId) return;
    try {
      const res = await axiosInstance.get(
        `/project/manager/${employee.empId}/active`
      );
      setProjects(res.data);
    } catch (err) {

    }
  };

  const handleAddResources = async () => {
  if (!selectedProject) {
    showToast("Please select a project", "warning");
    return;
  }

  if (selectedResources.length === 0) {
    showToast("Please select at least one resource", "warning");
    return;
  }

  try {
    const payload = {
      project_id: selectedProject.id,
      employeeIds: selectedResources,
    };

    // 🚀 backend call (enable when endpoint is ready)
    await axiosInstance.post("/project-assignment/assign", payload);

    

    showToast("✅ Resources added successfully", "success");

    // reset states
    setShowAddResourceModal(false);
    setSelectedResources([]);
    setRequestType("");
  } catch (err) {
    console.error(err);
    showToast("❌ Failed to add resources", "error");
  }
};


  const handleSubmitProjectUpdate = async () => {
    if (!selectedProject) return;

    try {
      // ✅ Update Status → Completed
      if (
        selectedProject.projectStatus === true &&
        selectedStatus === "Completed"
      ) {
        await axiosInstance.put(
          `/project/toggle-status/${selectedProject.id}`
        );
        showToast("Project marked as completed ✅", "success");
      }

      // ✅ Update Project Activity
      if (
        selectedActivity &&
        selectedActivity !== selectedProject.projectActivityStatus
      ) {
        await axiosInstance.put(
          `/project/update-activity/${selectedProject.id}`,
          null,
          {
            params: { activity: selectedActivity },
          }
        );
        showToast("Project activity updated ✅", "success");
      }

      fetchProjects();
      resetFields();
    } catch (err) {

      showToast("Failed to update project", "error");
    }
  };

  const resetFields = () => {
    setSelectedProject(null);
    setRequestType("");
    setReason("");
    setExtraHours("");
    setNewCompletionDate("");
    setSelectedStatus("");
    setSelectedActivity("");
  };


  useEffect(() => {
    fetchProjects();
  }, [employee]);

  const handleSendRequest = async () => {
    if (!selectedProject) {
      showToast("Select a project", "warning");
      return;
    }

    if (!requestType) {
      showToast("Select request type", "warning");
      return;
    }

    const agmId = Number(1004);
    const projectName = selectedProject.projectName;// make sure this exists
    const projectId = selectedProject.id;

    let title = "";
    let message = "";

    if (requestType === "EXTRA_HOURS") {
      if (!extraHours || extraHours <= 0) {
        showToast("Enter valid extra hours", "warning");
        return;
      }
      title = "Extra Hours Request";
      message = `Project: ${projectName} | projectId=${projectId} | Requesting ${extraHours} extra hours. Reason: ${reason}`;
    }

    if (requestType === "COMPLETION_EXTENSION") {
      if (!newCompletionDate) {
        showToast("Select new completion date", "warning");
        return;
      }
      title = "Completion Date Extension";
      message = `Project: ${projectName} | projectId=${projectId} | Request to extend completion date to ${newCompletionDate}. Reason: ${reason}`;
    }

    const url =
      `/notifications/create` +
      `?senderId=${employee.empId}` +
      `&receiverId=${agmId}` +
      `&title=${encodeURIComponent(title)}` +
      `&message=${encodeURIComponent(message)}` +
      `&type=${requestType}`;

    try {
      await axiosInstance.post(url);
      showToast("Request sent ✅", "success");

      // Clear the form
      setRequestType("");
      setExtraHours("");
      resetFields();
      setNewCompletionDate("");
      setReason("");
    } catch (err) {
      showToast("Failed to send request ❌", "error");
    }
  };

  const openAddResourceModal = async () => {
    if (!selectedProject) {
      showToast("Select a project first", "warning");
      return;
    }

    try {
      setLoadingEmployees(true);
      
      const res = await axiosInstance.get(
        "/project-assignment/employees/not-in-project",
        {
          params: {
            projectId: selectedProject.id,
            reportingToId: selectedProject.managerId
          },
        }
      );

      setAvailableEmployees(res.data);
      setSelectedResources([]);
      setShowAddResourceModal(true);
    } catch (err) {
      showToast("Failed to load employees", "error");
    } finally {
      setLoadingEmployees(false);
    }
  };


  const toggleResourceSelection = (empId) => {
    setSelectedResources((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  };



  const handleProjectChange = (e) => {
    const p = projects.find((proj) => proj.id === parseInt(e.target.value));
    setSelectedProject(p || null);
    setSelectedStatus(p ? (p.projectStatus ? "Active" : "Completed") : "");
    setSelectedActivity(p?.projectActivityStatus || "");

    // 🔹 Reset request fields when project changes
    setRequestType("");
    setExtraHours("");
    setReason("");
    setNewCompletionDate("");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: "20px" }}>Project Management</h2>

      {/* Filter Tabs */}
      <div className={styles.filterButtons}>
        {["Send Request", "Project Completion"].map((item) => (
          <button
            key={item}
            onClick={() => {
              setTab(item);
              setSelectedProject(null);
              setExtraHours("");
              setSelectedStatus("");
              setSelectedActivity("");
              setRequestType("");
              setReason("");
              setNewCompletionDate("");
            }}
            className={`${styles.filterBtn} ${tab === item ? styles.active : ""
              }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* TAB 1 - Send Request */}
      {tab === "Send Request" && (
        <>
          <div className={styles.fld}>
            <label>Select Project</label>
            <select value={selectedProject?.id || ""} onChange={handleProjectChange}>
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.projectName} ({proj.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Only show request type if project selected */}
          {selectedProject && (
            <div className={styles.fld}>
              <label>Request Type</label>
              <select
                value={requestType}
                onChange={(e) => {
                  setRequestType(e.target.value);
                  setExtraHours("");
                  setReason("");
                  setNewCompletionDate("");

                  if (e.target.value === "RESOURCE_ADDITION") {
                    openAddResourceModal();
                  }
                }}
              >
                <option value="">Select Request Type</option>
                <option value="EXTRA_HOURS">Extra Hours Request</option>
                <option value="COMPLETION_EXTENSION">Completion Date Extension</option>
                <option value="RESOURCE_ADDITION">Add Resources</option>
              </select>
            </div>
          )}

          {/* ✅ Show form ONLY if project selected + request type selected */}
          {selectedProject && requestType === "EXTRA_HOURS" && (
            <>
              <div className={styles.fld}>
                <label>Extra Hours Needed</label>
                <input
                  type="number"
                  value={extraHours}
                  onChange={(e) => setExtraHours(e.target.value)}
                />
              </div>

              <div className={styles.fld}>
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for extra hours"
                />
              </div>

              <button className={styles.submitBtn} onClick={handleSendRequest}>
                Send Request
              </button>
            </>
          )}

          {selectedProject && requestType === "COMPLETION_EXTENSION" && (
            <>
              <div className={styles.fld}>
                <label>New Completion Date</label>
                <input
                  type="date"
                  value={newCompletionDate}
                  onChange={(e) => setNewCompletionDate(e.target.value)}
                />
              </div>

              <div className={styles.fld}>
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for extension"
                />
              </div>

              <button className={styles.submitBtn} onClick={handleSendRequest}>
                Send Request
              </button>
            </>
          )}
        </>
      )}
      {tab === "Project Completion" && (
        <>
          <div className={styles.fld}>
            <label>Select Project</label>
            <select
              value={selectedProject?.id || ""}
              onChange={handleProjectChange}
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.projectName} ({proj.clientName})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <>
              <div className={styles.fld}>
                <label>Current Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className={styles.fld}>
                <label>Project Activity</label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                >
                  <option value="">Select Activity</option>
                  <option value="IFA">IFA</option>
                  <option value="REIFA">REIFA</option>
                  <option value="IFC">IFC</option>
                  <option value="REIFC">REIFC</option>
                  <option value="BFA">BFA</option>
                  <option value="Field Measurement">Field Measurement</option>
                  <option value="Client Rework">Client Rework</option>
                  <option value="Internal Rework">Internal Rework</option>
                </select>
              </div>

              <button
                className={styles.submitBtn}
                onClick={handleSubmitProjectUpdate}
              >
                Submit
              </button>
            </>
          )}
        </>
      )}

      {showAddResourceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Add Resources to {selectedProject?.projectName}</h3>

            {loadingEmployees ? (
              <p>Loading employees...</p>
            ) : availableEmployees.length === 0 ? (
              <p>No employees available</p>
            ) : (
              <div className={styles.modalContent}>
                {availableEmployees.map((emp) => (
                  <label key={emp.empId} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={selectedResources.includes(emp.empId)}
                      onChange={() => toggleResourceSelection(emp.empId)}
                    />

                    <div className={styles.empInfo}>
                      <div className={styles.empName}>{emp.name}</div>
                      <div className={styles.empDesignation}>
                        {emp.designation}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.doneBtn}
                disabled={selectedResources.length === 0}
                onClick={handleAddResources}
              >
                Add ({selectedResources.length})
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => setShowAddResourceModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );


};

export default ManagerProjectActions;
