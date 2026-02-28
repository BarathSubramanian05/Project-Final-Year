import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css"; // your CSS file
import { useEmployee } from "../context/EmployeeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "./axiosConfig";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // error messages
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useEmployee();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // clear previous errors

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    console.log(username);
    console.log(password);
    try {
      const response = await axiosInstance.post(
        "/employee/login",
        { username, password }
      );

      const employeeData = response.data;
      console.log(employeeData);


      if (!employeeData) {
        setError("Invalid username or password");
        return;
      }

      login(employeeData);
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("Something went wrong. Please try again later.");

      }
    }
  };

  return (
    <div>
      
        <div className={styles.companyHeader}>
          <div className={styles.companyName}>
            <img src="/logo.png" alt="E2G Logo" className={styles.logo} />
            <span>E2G ENGINEERING SERVICES PRIVATE LIMITED</span>
          </div>
        </div>


      <div className={styles.loginContainer}>
        <div className={styles.loginWrapper}>
          <div className={styles.loginBox}>
            <h2 className={styles.loginTitle}>Employee Login</h2>

            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <label className={styles.loginLabel} htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className={styles.loginInput}
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.loginLabel} htmlFor="password">
                  Password
                </label>

                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={styles.loginInput}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {/* <FontAwesomeIcon
      //icon={showPassword ? faEyeSlash : faEye}
      //className={styles.eyeIcon}
      //onClick={() => setShowPassword((prev) => !prev)}
    /> */}
                </div>
              </div>


              {error && <p className={styles.errorMsg}>{error}</p>}

              <button type="submit" className={styles.loginBtn}>
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
