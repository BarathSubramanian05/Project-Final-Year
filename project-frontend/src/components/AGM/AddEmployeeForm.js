import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import styles from "../../styles/AGM/AddActivity.module.css"; // reuse same CSS
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const AddEmployeeForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    designation: "",
    reportingTo: "",
    username: "",
    password: "",
  });


  const [managers, setManagers] = useState([]);
  const { showToast } = useToast();
  

  const designations = [
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
];


  // Fetch manager list from backend
  useEffect(() => {
    axiosInstance
      .get("/employee/getallmanagers")
      .then((res) => setManagers(res.data))
      .catch(() => setManagers([]));
  }, []);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mapDesignationToRole = (designation) => {
  
  // IT & Admin Roles
  if (designation.toLowerCase().includes("admin")) return "IT Admin";
  
  // Engineering Roles
  if (designation.toLowerCase().includes("engineer")) return "Engineer";
  
  // Modeler Roles
  if (designation.toLowerCase().includes("modeler")) return "Modeler";
  
  // Checker Roles
  if (designation.toLowerCase().includes("checker")) return "Checker";
  
  // Detailer Roles
  if (designation.toLowerCase().includes("detailer")) return "Detailer";
  
  // Sales Roles
  if (designation.toLowerCase().includes("sales")) return "Sales";
  
  // Developer Roles (API, IT, etc.)
  if (designation.toLowerCase().includes("developer")) return "Developer";
  
  // Estimator Roles
  if (designation.toLowerCase().includes("estimator")) return "Estimator";
  
  // Accountant Roles
  if (designation.toLowerCase().includes("accounts")) return "Accounts";
  
  // Trainee Roles
  if (designation.toLowerCase().includes("trainee")) return "Trainee";
  
  // Fallback to return the designation if no match is found
  return designation; 
};



  const handleSubmit = async () => {
    // Basic validation
    if (!formData.empId.trim()) return showToast("⚠️ Enter Employee ID","warning");
    if (!formData.name.trim()) return showToast("⚠️ Enter Employee Name","warning");
    if (!formData.designation.trim()) return showToast("⚠️ Select Designation","warning");
    if (!formData.reportingTo && !["Assistant General Manager"].includes(formData.designation.trim())) {
      return showToast("⚠️ Select Reporting Manager","warning");
    }
    if (!formData.username.trim()) return showToast("⚠️ Enter Username","warning");
    if (!formData.password.trim()) return showToast("⚠️ Enter Password","warning");
    if (formData.designation.trim() === "Project Manager" || formData.designation.trim() === "Assistant General Manager") formData.isManager = true;
    if (formData.designation.trim() === "Project Coordinator") formData.isTL = true;
    try {
      const payload = {
        empId: Number(formData.empId),
        name: formData.name,
        designation: formData.designation.trim(),
        designationCategory: mapDesignationToRole(formData.designation.trim()),
        reportingTo:
          formData.reportingTo === ""
            ? null
            : { empId: Number(formData.reportingTo) },
        tl: formData.designation.trim() === "Project Coordinator",
        manager: ["Project Manager", "Assistant General Manager"].includes(formData.designation.trim()),
        username: formData.username,
        password: formData.password
      };



      console.log(payload); // check
      await axiosInstance.post("/employee/addemployee", payload);
      showToast("✅ Employee added successfully!","success");
      setFormData({
        empId: "",
        name: "",
        designation: "",
        reportingTo: "",
        username: "",
        password: "",
      });
    } catch (error) {
    
      showToast("❌ Failed to add employee","error");
    }
  };

  return (
    <div className={styles.container}>

      <h2>Add New Employee</h2>

      <div className={styles.fld}>
        <label>Employee ID</label>
        <input
          type="text"
          name="empId"
          value={formData.empId}
          onChange={handleChange}
        />
      </div>

      <div className={styles.fld}>
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className={styles.fld}>
        <label>Designation</label>
        <select
          name="designation"
          value={formData.designation.trim()}
          onChange={handleChange}
        >
          <option value="">Select Designation</option>
          {designations.map((d, i) => (
            <option key={i} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fld}>
        <label>Reporting Manager</label>
        <select
          name="reportingTo"
          value={formData.reportingTo}
          onChange={handleChange}
        >
          <option value="">Select Manager</option>
          {managers.map((m) => (
            <option key={m.id} value={m.empId}>
              {m.name} ({m.designation.trim()})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fld}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className={styles.fld}>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        Add Employee
      </button>
    </div>
  );
};

export default AddEmployeeForm;
