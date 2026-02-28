import React, { useState } from "react";
import styles from "../../styles/Manager/ManagerDashboard.module.css"; // same style as ManagerDashboard
import AddEmployeeForm from "./AddEmployeeForm";
import AssignProjectForm from "./AssignProjectForm";// Create later
import AddActivityForm from "./AddActivityForm";

const EmployeeManagementPage = () => {
  const [activeTab, setActiveTab] = useState("Assign Project");

  const renderComponent = () => {
    switch (activeTab) {
      
      case "Assign Project":
        return <AssignProjectForm />;
      case "Add Employee":
        return <AddEmployeeForm />;
      case "Add Activity":
        return <AddActivityForm />;
      default:
        return <AssignProjectForm />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Employee Management</h2>

      {/* Filter Tabs */}
      <div className={styles.filterButtons}>
        {["Assign Project", "Add Employee", "Add Activity"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.filterBtn} ${
              activeTab === tab ? styles.active : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Component Render */}
      <div>{renderComponent()}</div>
    </div>
  );
};

export default EmployeeManagementPage;