import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import styles from "../../styles/AGM/EditProject.module.css";
import { useEmployee } from "../../context/EmployeeContext";
import { useNavigate } from "react-router-dom";
import AddEmployeeForm from './AddEmployeeForm';
import { useToast } from "../../context/ToastContext";

const designationToRole = {
  "Senior Engineer": "Connection Engineer",
  "Junior Engineer": "Connection Engineer",
  "Junior Engineer Grade 1": "Connection Engineer",
  "Engineer": "Connection Engineer",

  // Modeler Roles
  "Senior Modeler": "Modeler",
  "Junior Modeler": "Modeler",
  "Modeler": "Modeler",
  "Trainee Modeler": "Modeler",

  // Checker Roles
  "Senior Checker": "Checker",
  "Junior Checker": "Checker",
  "Checker": "Checker",
  "Trainee Checker": "Checker",

  // Detailer Roles
  "Senior Detailer": "Detailer",
  "Junior Detailer": "Detailer",
  "Detailer": "Detailer",
  "Trainee Detailer": "Detailer",

  // Sales Roles
  "Senior Sales Executive": "Sales",
  "Junior Sales Executive": "Sales",
  "Sales Executive": "Sales",

  // API Developer Roles
  "Junior API Developer": "Developer",
  "Senior API Developer": "Developer",
  "API Developer": "Developer",

  // Estimator Roles
  "Estimator": "Estimator",
  "Trainee Estimator": "Estimator",
  "Senior Estimator": "Estimator",
  "Junior Estimator": "Estimator",
};



const EditEmployee = () => {
  const { employee, loading } = useEmployee();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  const [designations] = useState([
  "Assistant General Manager",
  "Senior Project Manager",
  "Project Manager",
  "Project Coordinator",
  "IT Manager",
  "Assistant IT Manager",
  "HR Manager",
  "IT Admin",
  "Senior IT Admin",
  "Junior IT Admin",
  "Senior Engineer",
  "Junior Engineer",
  "Junior Engineer Grade 1",
  "Engineer",
  "Senior Modeler",
  "Junior Modeler",
  "Modeler",
  "Trainee Modeler",
  "Senior Checker",
  "Junior Checker",
  "Checker",
  "Trainee Checker",
  "Senior Detailer",
  "Junior Detailer",
  "Detailer",
  "Trainee Detailer",
  "Senior Sales Executive",
  "Junior Sales Executive",
  "Sales Executive",
  "Junior API Developer",
  "Senior API Developer",
  "API Developer",
  "Assistant Accounts Manager",
  "Accountant",
  "Estimator",
  "Trainee Estimator",
  "Senior Estimator",
  "Junior Estimator",
  "Trainee"
]);

  const [managerList, setManagerList] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    empId: "",
    name: "",
    designation: "",
    reportingTo: "",
    isManager: false,
    isTL: false,
    username: "",
    password: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !employee) navigate("/");
  }, [employee, loading, navigate]);

  // Fetch employees + managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await axiosInstance.get("/employee/getallemployees");
        setEmployees(empRes.data);
        setFilteredEmployees(empRes.data);

        const mgrRes = await axiosInstance.get("/employee/getallmanagers");
        setManagerList(mgrRes.data);
      } catch (err) {

      }
    };
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let data = [...employees];

    if (selectedDesignation !== "All") {
      data = data.filter((emp) => emp.designation.trim().trim().trim() === selectedDesignation);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (e) =>
          e.name?.toLowerCase().includes(term) ||
          String(e.empId).toLowerCase().includes(term)
          ||
          e.designation.trim().trim().trim()?.toLowerCase().includes(term)
      );
    }

    data.sort((a, b) => a.id - b.id);
    setFilteredEmployees(data);
  }, [searchTerm, selectedDesignation, employees]);

  // Clear filters
  const clearFilters = () => {
    setSelectedDesignation("All");
    setSearchTerm("");
    setFilteredEmployees(employees);
  };

  const handleDelete = async (empId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axiosInstance.put(`/employee/soft-delete/${empId}`);
        showToast("🗑️ Employee deleted successfully!", "success");

        // Remove deleted employee from the table
        const updated = employees.filter((e) => e.empId !== empId);
        setEmployees(updated);
        setFilteredEmployees(updated);
      } catch (error) {
        showToast("Error deleting employee!", "error");
      }
    }
  };


  // Handle edit click
  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      id: emp.id,
      empId: emp.empId,
      name: emp.name,
      designation: emp.designation.trim().trim().trim(),
      reportingTo: emp.reportingTo?.empId || "",
      isManager: emp.manager,
      isTL: emp.tl,
      username: emp.username || "",
      password: emp.password || "",
    });
    setIsViewing(false);  // ✅ make sure View is closed
    setIsEditing(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeClick = (empId) => {
    axiosInstance
      .get(`/project-assignment/projects/${empId}`)
      .then((res) => {
        setSelectedProjects(res.data);
        setShowModal(true);
      })

  };

  // Save employee changes
  const handleSave = async () => {
    try {
      const role = designationToRole[formData.designation.trim().trim().trim()] || "Employee";
      const payload = {
        empId: Number(formData.empId),
        name: formData.name,
        designation: formData.designation.trim().trim().trim(),
        designationCategory: role,
        isManager: ["Project Manager", "Assistant General Manager"].includes(formData.designation.trim().trim().trim()),
        isTL: formData.designation.trim().trim().trim() === "Project Coordinator",
        username: formData.username.trim(),
        password: formData.password.trim(),
        reportingTo:
          formData.reportingTo === ""
            ? null
            : { empId: Number(formData.reportingTo) },
      };



      await axiosInstance.put("/employee/editemployee", payload);
      showToast("✅ Employee updated successfully!", "success");
      setSelectedEmployee(null);

      // Refresh list
      const refreshed = await axiosInstance.get("/employee/getallemployees");
      setEmployees(refreshed.data);
      setFilteredEmployees(refreshed.data);
    } catch (error) {

      showToast("Error updating employee!", "error");
    }
  };



  return (
    <div className={styles.tableContainer}>
      {<h2 className={styles.title}>Employee Management</h2>}

      {!selectedEmployee && (
        <>
          {/* Filters */}
          <div className={styles.filterBar}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search employee name, ID, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Designations</option>
              {designations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>
            <button
              className={styles.addBtn}
              onClick={() => navigate("/manager/add-employee")}
            >
              + Add Employee
            </button>
          </div>

          {/* Employees Table */}
          <table className={styles.detailsTable}>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Reporting To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.noData}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} >
                    <td onClick={() => handleEmployeeClick(emp.empId)}>{emp.empId}</td>
                    <td onClick={() => handleEmployeeClick(emp.empId)}>{emp.name}</td>
                    <td onClick={() => handleEmployeeClick(emp.empId)}>{emp.designation.trim().trim().trim()}</td>
                    <td onClick={() => handleEmployeeClick(emp.empId)}>{emp.reportingTo?.name || "--"}</td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleEdit(emp)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDelete(emp.empId)}
                      >
                        🗑️
                      </button>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {selectedEmployee && (
        <div className={styles.formContainer}>
          <button
            className={styles.backbtn}
            onClick={() => { setSelectedEmployee(null); setIsEditing(false); }}
          >
            Back
          </button>
          <h3 className={styles.formTitle}>Edit Employee Details</h3>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Employee ID</label>
              <input
                type="text"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className={styles.formField}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Designation</label>
              <select
                name="designation"
                value={formData.designation.trim().trim().trim()}
                onChange={handleChange}
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label>Reporting Manager</label>
              <select
                name="reportingTo"
                value={formData.reportingTo}
                onChange={handleChange}
              >
                <option value="">Select Manager</option>
                {managerList.map((m) => (
                  <option key={m.id} value={m.empId}>
                    {m.name} ({m.designation.trim().trim().trim()})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formField}>
              <label>Password</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>


          </div>

          <div className={styles.formActions}>
            <button className={styles.actionBtn} onClick={handleSave}>
              Save
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setSelectedEmployee(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Projects Working</h3>
            <table className={styles.memberTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project Name</th>
                </tr>
              </thead>
              <tbody>
                {selectedProjects.length === 0 ? (
                  <tr>
                    <td colSpan="13" className={styles.noData}>
                      No records found.
                    </td>
                  </tr>
                ) : (

                  selectedProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.id}</td>
                      <td>{project.projectName}</td>
                    </tr>
                  ))

                )}
              </tbody>
            </table>

            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>)}
    </div>
  );
};

export default EditEmployee;
