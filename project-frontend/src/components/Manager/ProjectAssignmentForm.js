import React, { useState, useEffect } from "react";
import styles from "../../styles/Employee/LeavePermissionForm.module.css"; // reuse same CSS
import { useEmployee } from "../../context/EmployeeContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import axiosInstance from "../axiosConfig";


const ProjectAssignmentForm = () => {
  const { employee, loading } = useEmployee();
  const navigate = useNavigate(); // 👈 added

  useEffect(() => {
    if (!loading && !employee) {
      navigate("/"); // 👈 redirect to login page
    }
  }, [employee, loading, navigate]);



  const managerIdToUse = employee?.manager ? employee.empId : employee?.reportingToId;
  const [projects, setProjects] = useState([]);
  const [resourceProjects, setResourceProjects] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [teamLeads, setTeamLeads] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [activeTab, setActiveTab] = useState("distribution");
  const [projectResources, setProjectResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const [removeMode, setRemoveMode] = useState(false); // 👈 checkbox mode
  const [selectedToRemove, setSelectedToRemove] = useState([]);

  const [resourceProjectId, setResourceProjectId] = useState("");
  const [resourceProject, setResourceProject] = useState(null);

  const [employeesByRole, setEmployeesByRole] = useState({
    Modeler: [],
    Checker: [],
    Designer: []
  });

  const [showResourceModal, setShowResourceModal] = useState(false); // ✅ NEW
  const [selectedRole, setSelectedRole] = useState("Modeler"); // ✅ NEW
  const [selectedResources, setSelectedResources] = useState([]); // ✅ NEW4
  const { showToast } = useToast();

  useEffect(() => {
    if (!resourceProjectId) return;

    setLoadingResources(true);

    axiosInstance
      .get(`/project-assignment/employees/${resourceProjectId}`)
      .then(res => {
        
        setProjectResources(res.data);
        setSelectedToRemove([]);
        setRemoveMode(false);
      })
      .finally(() => setLoadingResources(false));

  }, [resourceProjectId]);


  useEffect(() => {
    if (!managerIdToUse) return;

    const proj = axiosInstance
      .get(`/project/manager/${managerIdToUse}/active`) // Dummy backend endpoint
      .then((proj) => {
        const inProgress = proj.data.filter((p) => p.workingHours === 0 && p.tlId === null);
        setProjects(inProgress);
        setResourceProjects(proj.data)
      })

  }, [managerIdToUse]);


  useEffect(() => {
    if (!managerIdToUse) return;


    const res = axiosInstance
      .get(`/employee/gettls?mgrid=${managerIdToUse}`) // Dummy backend endpoint
      .then((res) => {

        setTeamLeads(res.data);
      })

  }, [managerIdToUse]);

  useEffect(() => {
    if (!managerIdToUse) return;

    axiosInstance
      .get(`/employee/getbymgr`, {
        params: { mgrid: managerIdToUse },
      })
      .then((res) => {
        const allEmployees = res.data;


        // ✅ Categorize employees by their role
        const grouped = {
          Modeler: allEmployees.filter(emp =>
            emp.role?.toLowerCase().includes("modeler")
          ),
          Checker: allEmployees.filter(emp =>
            emp.role?.toLowerCase().includes("checker")
          ),
          Detailer: allEmployees.filter(emp =>
            emp.role?.toLowerCase().includes("detailer")
          ),
        };

        setEmployeesByRole(grouped);
      })
      .catch((err) => {

      });
  }, [managerIdToUse]);

  const [formData, setFormData] = useState({
    projectId: "",
    tl1: "",
    modellingHours: "",
    checkingHours: "",
    detailingHours: "",
    studyHours: "",
    startDate: "",
    projectActivity: ""
  });

  const toggleRemoveSelection = (empId) => {
    setSelectedToRemove(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const enableRemoveMode = () => {
    setRemoveMode(true);
    setOpenMenuId(null);
  };




  // ✅ updated toggle so we store role, name & designation in selectedResources
  const toggleResourceSelection = (emp) => {
    setSelectedResources((prev) => {
      const exists = prev.find((r) => r.empId === emp.empId && r.role === selectedRole);
      if (exists) {
        return prev.filter((r) => !(r.empId === emp.empId && r.role === selectedRole));
      }
      return [...prev, { empId: emp.empId, name: emp.name, designation: emp.designation.trim(), role: selectedRole }];

    });
  };

  const handleDeallocateResources = async () => {
  if (selectedToRemove.length === 0) {
    showToast("⚠️ Select at least one resource", "warning");
    return;
  }

  if (!window.confirm("Are you sure you want to deallocate selected resources?")) {
    return;
  }

  try {
    await axiosInstance.delete("/project-assignment/resource-delete", {
      data: { ids: selectedToRemove }
    });

    showToast("✅ Resources deallocated successfully", "success");

    // Refresh list
    const res = await axiosInstance.get(
      `/project-assignment/employees/${resourceProjectId}`
    );
    setProjectResources(res.data);

    setRemoveMode(false);
    setSelectedToRemove([]);

  } catch (err) {
    showToast("❌ Failed to deallocate resources", "error");
  }
};



  const handleResourceProjectChange = (e) => {
    const selected = resourceProjects.find(
      (p) => p.id === parseInt(e.target.value)
    );
    setResourceProjectId(e.target.value);
    setResourceProject(selected || null);
  };


  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectChange = (e) => {
    const selected = projects.find(
      (p) => p.id === parseInt(e.target.value)
    );
    setSelectedProject(selected);
    setFormData({
      projectId: selected?.id || "",
      tl1: "",
      modellingHours: "",
      checkingHours: "",
      detailingHours: "",
      studyHours: "",
      startDate: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = async () => {
    if (!formData.projectId) {
      showToast("⚠️ Please select a project.", "warning");
      return false;
    }

    if (!formData.tl1) {
      showToast("⚠️ Please select Team Lead.", "warning");
      return false;
    }


    if (!formData.projectActivity) {
      showToast("⚠️ Please select Project Activity", "warning");
      return false;
    }




    if (
      !formData.modellingHours ||
      !formData.checkingHours ||
      !formData.detailingHours ||
      !formData.studyHours
    ) {
      showToast("⚠️ Please fill all hour fields (Modelling, Checking, Detailing,Study).", "warning");
      return false;
    }

    if (
      Number(formData.modellingHours) <= 0 ||
      Number(formData.checkingHours) <= 0 ||
      Number(formData.detailingHours) <= 0 ||
      Number(formData.studyHours) <= 0
    ) {
      showToast("⚠️ Hours must be greater than 0.", "warning");
      return false;
    }

    const total =
      Number(formData.modellingHours) +
      Number(formData.checkingHours) +
      Number(formData.detailingHours) +
      Number(formData.studyHours);

    if (selectedProject && total !== selectedProject.assignedHours) {
      showToast(
        `❌ Total assigned hours (${total}) must match project total (${selectedProject.assignedHours}).`
        , "error");
      return false;
    }

    try {

      // ✅ STEP 1: Add project hours
      const hoursResponse = await axiosInstance.put(
        `/project/${formData.projectId}/add-hours`,
        null,
        {
          params: {
            tlId: formData.tl1,
            modellingHours: formData.modellingHours,
            checkingHours: formData.checkingHours,
            detailingHours: formData.detailingHours,
            studyHours: formData.studyHours,
            projectActivity: formData.projectActivity
          },
        }
      );



      // ✅ STEP 2: Assign resources (separate endpoint)


      const payload = {
        project_id: formData.projectId,
        employeeIds: selectedResources.map(emp => emp.empId),
      };

      const resourceResponse = await axiosInstance.post(
        `/project-assignment/assign`,
        payload
      );



      showToast("✅ Project and resources assigned successfully!", "success");

      // ✅ Reset everything
      setFormData({
        projectId: "",
        tl1: "",
        modellingHours: "",
        checkingHours: "",
        detailingHours: "",
        startDate: "",
        projectActivity: ""
      });
      setSelectedResources([]);
      setSelectedProject(null);

      // ✅ Refresh updated projects
      const updatedProjectsRes = await axiosInstance.get(
        `/project/manager/${managerIdToUse}/active`
      );

      const inProgress = updatedProjectsRes.data.filter((p) => p.workingHours === 0 && p.tlId === null);

      setProjects(inProgress);


    } catch (error) {

      showToast("❌ Failed to assign project or resources", "error");
    }
  };



  return (
    <div className={styles.container}>
      <h2>Project Distribution</h2>

      <div className={styles.filterButtons}>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`${styles.filterBtn} ${activeTab === "distribution" ? styles.active : ""
            }`}
        >
          Project Distribution
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`${styles.filterBtn} ${activeTab === "resources" ? styles.active : ""
            }`}
        >
          Manage Resources
        </button>
      </div>


      {/* Project Dropdown */}
      {activeTab === "distribution" && (
        <>
          <div className={styles.fld}>
            <label>Choose Project</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleProjectChange}
            >
              <option value="">Select Project</option>
              {projects
                .filter((p) => p.projectStatus)
                .map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectName} ({proj.clientName})
                  </option>
                ))}
            </select>
          </div>
        </>
      )}


      {activeTab === "resources" && (
        <>

          {/* Project dropdown */}
          <div className={styles.fld}>
            <label>Choose Project</label>
            <select
              value={resourceProjectId}
              onChange={handleResourceProjectChange}
            >
              <option value="">Select Project</option>
              {resourceProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.projectName} ({proj.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Show button only after project selection */}

          {resourceProject && (
            <>
              {loadingResources ? (
                <p>Loading resources...</p>
              ) : projectResources.length === 0 ? (
                <p>No resources assigned to this project.</p>
              ) : (
                <table className={styles.resourceTable}>
                  <thead>
                    <tr>
                      {removeMode && <th></th>}
                      <th>Name</th>
                      <th>Designation</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectResources.map(emp => (
                      <tr key={emp.empId}>
                        {removeMode && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedToRemove.includes(emp.assignmentId)}
                              onChange={() => toggleRemoveSelection(emp.assignmentId)}
                              disabled={!emp.assignmentId} // prevents TL deletion

                            />
                          </td>
                        )}

                        <td>{emp.name}</td>
                        <td>{emp.designation}</td>
                        <td>{emp.role}</td>

                        <td className={styles.actionsCol}>
                          {!removeMode && (
                            <div className={styles.menuWrapper}>
                              <div className={styles.menuWrapper}>
                                <button
                                  className={styles.menuBtn}
                                  onClick={() =>
                                    setOpenMenuId(openMenuId === emp.empId ? null : emp.empId)
                                  }
                                >
                                  ⋮
                                </button>

                                {openMenuId === emp.empId && (
                                  <div className={styles.menuDropdown}>
                                    <button
                                      onClick={() => {
                                        enableRemoveMode();
                                        setOpenMenuId(null);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Remove action bar */}
              {removeMode && (
                <div className={styles.removeBar}>
                  <span>{selectedToRemove.length} selected</span>

                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setRemoveMode(false);
                      setSelectedToRemove([]);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className={styles.doneBtn}
                    disabled={selectedToRemove.length === 0}
                    onClick={handleDeallocateResources}
                  >
                    Deallocate Selected
                  </button>

                </div>
              )}
            </>
          )}

        </>
      )}




      {/* Show next fields only after project selection */}
      {selectedProject && activeTab === "distribution" && (
        <>

          <div className={styles.fld}>
            <label>Project Activity</label>
            <select
              name="projectActivity"
              value={selectedActivity}
              onChange={(e) => {
                setSelectedActivity(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  projectActivity: e.target.value
                }));
              }}

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

          <div className={styles.fld}>
            <label style={{ "marginBottom": "8px" }}>Assigned Hours (Total)</label>
            <input
              type="text"
              value={selectedProject.assignedHours}
              readOnly
            />
          </div>

          <div className={styles.fld}>
            <label>Choose TL</label>
            <select
              name="tl1"
              value={formData.tl1}
              onChange={handleChange}
            >
              <option value="">Select Team Lead 1</option>
              {teamLeads.map((tl) => (
                <option key={tl.empId} value={tl.empId}>
                  {tl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Hours Inputs */}
          <div className={styles.fld}>
            <label>Modelling Hours</label>
            <input
              type="number"
              name="modellingHours"
              value={formData.modellingHours}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fld}>
            <label>Checking Hours</label>
            <input
              type="number"
              name="checkingHours"
              value={formData.checkingHours}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fld}>
            <label>Detailing Hours</label>
            <input
              type="number"
              name="detailingHours"
              value={formData.detailingHours}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fld}>
            <label>Study Hours</label>
            <input
              type="number"
              name="studyHours"
              value={formData.studyHours}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            className={styles.ResourceBtn}
            onClick={() => setShowResourceModal(true)}
          >
            Assign Resources ({selectedResources.length} Selected)
          </button>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={validateForm}
          >
            Assign
          </button>
        </>
      )}
      {/* ✅ Keep Modal Outside So form doesn't hide */}
      {showResourceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 style={{ marginBottom: "10px" }}>Select Resources</h3>

            <div className={styles.filterRow}>
              {["Modeler", "Checker", "Detailer"].map((role) => (
                <button
                  key={role}
                  className={`${styles.roleBtn} ${selectedRole === role ? styles.activeRole : ""}`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className={styles.modalContent}>
              {employeesByRole[selectedRole].map((emp) => {
                const checked = selectedResources.some((r) => r.empId === emp.empId && r.role === selectedRole);
                
                return (
                  <label key={emp.empId} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleResourceSelection(emp)}
                    />

                    <div className={styles.empInfo}>
                      <div className={styles.empName}>{emp.name}</div>
                      <div className={styles.empDesignation}>{emp.designation.trim()}</div>
                    </div>

                    {/* optional: show role tag on the far right */}
                    <div className={styles.empRoleTag}>{selectedRole}</div>
                  </label>
                );
              })}
            </div>


            <div className={styles.modalActions}>
              <button
                className={styles.doneBtn}
                onClick={() => setShowResourceModal(false)}
              >
                Done
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowResourceModal(false)}
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

export default ProjectAssignmentForm;
