import React, { useContext } from "react";
import { Link, useNavigate,useLocation  } from "react-router-dom";
import styles from "../../styles/Employee/EmployeeNavbar.module.css";
import Notifications from "../Notifications/Notifications";

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const employee = JSON.parse(sessionStorage.getItem("employee"));
  console.log(employee)
    if (!employee) return null; 
  const isHR = employee.authority === "ROLE_ADMIN" || employee.authority === "ROLE_HR"; 
  const handleBack = () => {
  // Don’t allow back on main work page
  if (window.location.pathname === "/employee/work") return;
  navigate(-1);
};


 const handleLogout = () => {
  sessionStorage.removeItem("employee");
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
          
          <h1>Project Governance System</h1>
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
