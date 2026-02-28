import React, { useContext } from "react";
import { Link, useNavigate,useLocation  } from "react-router-dom";
import styles from "../../styles/Employee/EmployeeNavbar.module.css";
import { useEmployee } from "../../context/EmployeeContext";
import Notifications from "../Notifications/Notifications";

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const { employee, logout } = useEmployee();
  const isHR=employee.designation.trim()==="HR Manager" || employee.role.trim()==="IT Admin" || employee.role.trim()==="Accounts";
 const handleBack = () => {
  // Don’t allow back on main work page
  if (window.location.pathname === "/employee/work") return;
  navigate(-1);
};


  const handleLogout = () => {
    logout(); 
    navigate("/", { replace: true }); 
  };

  if (!employee) return null; 

  return (
    <div className={styles.header}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={handleBack}>
            Back
          </button>
        </div>

        <div className={styles.navCenter} style={{marginLeft:
      isHR
        ? "-1%": "11%"}}>
          <img src="/logo.png" alt="E2G Logo" className={styles.logo} />
          <h1>E2G ENGINEERING SERVICES PRIVATE LIMITED</h1>
        </div>

        {!isHR && <Notifications userId={employee.empId} userRole={employee.designation} />}

        <div className={styles.navRight}>
          {!isHR && <Link to="/employee/work" className={styles.navLink}>
            Work
          </Link>}


          <Link to="/employee/leave" className={styles.navLink}>
            Leave
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default EmployeeNavbar;
