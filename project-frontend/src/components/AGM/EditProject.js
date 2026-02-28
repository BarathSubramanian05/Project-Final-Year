import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import styles from "../../styles/AGM/EditProject.module.css"
import { useEmployee } from "../../context/EmployeeContext";
import AssignProjectForm from './AssignProjectForm';
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const EditProject = () => {
  const { employee, loading } = useEmployee();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [managerList, setManagerList] = useState([]);
  const [selectedManager, setSelectedManager] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    projectName: "",
    clientName: "",
    assignedHours: "",
    modellingHours: "",
    checkingHours: "",
    detailingHours: "",
    studyHours: "",
    managerId: "",
    projectStatus: ""
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !employee) navigate("/");
  }, [employee, loading, navigate]);

  // Fetch all projects initially
  // Fetch all projects & managers together
  useEffect(() => {
    const fetchProjectsAndManagers = async () => {
      try {
        const [projectsRes, managersRes] = await Promise.all([
          axiosInstance.get("/project/"),
          axiosInstance.get("/employee/getallmanagers")
        ]);

        const projects = projectsRes.data;
        const managers = managersRes.data;

        // Map managerId → managerName
        const projectsWithManagerNames = projects.map((project) => {
          const manager = managers.find((m) => m.empId === project.managerId);
          return {
            ...project,
            managerName: manager ? manager.name : "—",
          };
        });

        // Set project and filtered data
        setProjects(projectsWithManagerNames);
        setFilteredProjects(projectsWithManagerNames);

        // Populate manager dropdown list
        const managerNames = managers.map((m) => m.name);
        setManagerList(managerNames);

      } catch (err) {
      }
    };

    fetchProjectsAndManagers();
  }, []);




  // Filter projects based on selected filters
  useEffect(() => {
    let data = [...projects];

    // Filter by Manager
    if (selectedManager !== "All") {
      data = data.filter((p) => p.managerName === selectedManager);
    }

    // Filter by Search Term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter((p) =>
        p.projectName?.toLowerCase().includes(term) ||
        p.clientName?.toLowerCase().includes(term) ||
        p.id?.toString().includes(term) ||
        p.managerName?.toLowerCase().includes(term)
      );
    }

    // Sort by project ID
    data.sort((a, b) => a.id - b.id);

    setFilteredProjects(data);
  }, [selectedManager, searchTerm, projects]);

  // 🔹 Clear Filters
  const clearFilters = () => {
    setSelectedManager("All");
    setSearchTerm("");
    setFilteredProjects(projects);
  };

  // When clicking edit, populate form
  const handleEdit = (project) => {
    setSelectedProject(project);
    console.log(project);
    setFormData({
      id: project.id,
      projectName: project.projectName,
      clientName: project.clientName,
      assignedHours: project.assignedHours,
      modellingHours: project.modellingHours,
      checkingHours: project.checkingHours,
      studyHours:project.studyHours,
      detailingHours: project.detailingHours,
      managerId: project.managerId,
      projectStatus: project.projectStatus ? "Pending" : "Completed",
    });
  };

  // Delete Project
  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axiosInstance.put(`/project/soft-delete/${projectId}`);
        showToast("🗑️ Project deleted successfully!", "success");

        // Remove deleted project from state
        const updated = projects.filter((p) => p.id !== projectId);
        setProjects(updated);
        setFilteredProjects(updated);
      } catch (error) {
        showToast("Error deleting project!", "error");
      }
    }
  };


  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData };

    if (["assignedHours", "modellingHours", "checkingHours", "detailingHours", "studyHours"].includes(name)) {
      updatedData[name] = Number(value);

      if (["modellingHours", "checkingHours", "detailingHours", "studyHours"].includes(name)) {
        updatedData.assignedHours =
          Number(updatedData.modellingHours || 0) +
          Number(updatedData.checkingHours || 0) +
          Number(updatedData.detailingHours || 0) +
          Number(updatedData.studyHours || 0);
      }
    } else {
      updatedData[name] = value;
    }

    setFormData(updatedData);
  };

  // Save updated project
  const handleSave = async () => {
    try {
      const updatedPayload = {
        id: formData.id,
        projectName: formData.projectName,
        clientName: formData.clientName,
        assignedHours: Number(formData.assignedHours),
        modellingHours: Number(formData.modellingHours),
        checkingHours: Number(formData.checkingHours),
        detailingHours: Number(formData.detailingHours),
        studyHours: Number(formData.studyHours),
        managerId: Number(formData.managerId),
        projectStatus: formData.projectStatus === "Pending",
      };

      console.log(updatedPayload);
      await axiosInstance.put(`/project/editproject`, updatedPayload);

      showToast("✅ Project updated successfully!", "success");
      setSelectedProject(null);

      // Refresh list
      const refreshed = await axiosInstance.get("/project/");
      setProjects(refreshed.data);
      setFilteredProjects(refreshed.data);

      // Refresh manager list
      const managers = [...new Set(refreshed.data.map((p) => p.managerName).filter(Boolean))];
      setManagerList(managers);
    } catch (error) {

      showToast("Error updating project!", "error");
    }
  };

  return (
    <div className={styles.tableContainer}>
      {<h2 className={styles.title}>Project Management</h2>}

      {!selectedProject && (
        <>
          {/* Filters */}
          <div className={styles.filterBar}>
            {/* Search Filter */}
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search projects, clients, managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Manager Filter */}
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Managers</option>
              {managerList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Clear Button */}
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>

            <button
              className={styles.addBtn}
              onClick={() => navigate("/manager/add-project")}
            >
              + Assign Project
            </button>
          </div>

          {/* Projects Table */}
          <table className={styles.detailsTable}>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Manager</th>
                <th>Assigned Hours</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.noData}>
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr key={proj.id}>
                    <td>{proj.id}</td>
                    <td>{proj.projectName}</td>
                    <td>{proj.clientName}</td>
                    <td>{proj.managerName || "—"}</td>
                    <td>{proj.assignedHours}</td>
                    <td className={
                      proj.projectStatus
                        ? styles.statusInProgress
                        : styles.statusCompleted
                    }>{proj.projectStatus ? "In-Progress" : "Completed"}</td>
                    
                      <td>
                        <div style={{display:"flex"}}>
                      <button
                        className={`${styles.actionBtn}`}
                        onClick={() => handleEdit(proj)}
                      >
                        ✏️Edit
                      </button>

                      <button
                        className={`${styles.actionBtn}`}
                        onClick={() => handleDelete(proj.id)}  
                      >
                        🗑️
                      </button>
                    </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {selectedProject && (
        <div className={styles.formContainer}>
          <button
            className={styles.backbtn}
            onClick={() => setSelectedProject(null)}
          >
            Back
          </button>
          <h3 className={styles.formTitle}>Edit Project Details</h3>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Client Name</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Assigned Hours</label>
              <input
                type="number"
                name="assignedHours"
                value={formData.assignedHours}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className={styles.formField}>
              <label>Modeling Hours</label>
              <input
                type="number"
                name="modellingHours"
                value={formData.modellingHours}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Checking Hours</label>
              <input
                type="number"
                name="checkingHours"
                value={formData.checkingHours}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Detailing Hours</label>
              <input
                type="number"
                name="detailingHours"
                value={formData.detailingHours}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Study Hours</label>
              <input
                type="number"
                name="studyHours"
                value={formData.studyHours}
                onChange={handleChange}
              />
            </div>

            <br></br>

            <div className={styles.fld} >
              <label>Status :</label>
              <button
                type="button"
                className={`${styles.statusBtn} ${formData.projectStatus === "Completed" ? styles.completed : styles.pending}`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    projectStatus: formData.projectStatus === "Pending" ? "Completed" : "Pending"
                  })
                }
              >
                {formData.projectStatus}
              </button>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.actionBtn} onClick={handleSave}>
              Save
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setSelectedProject(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProject;