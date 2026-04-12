import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import axiosInstance from "./axiosConfig";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        { username, password },
        { withCredentials: true }
      );

      const employeeData = response.data;
      console.log(employeeData)
      if (!employeeData) {
        setError("Invalid username or password");
        return;
      }

      // 💾 Store in sessionStorage
      sessionStorage.setItem("employee", JSON.stringify(employeeData));

      // 🔄 Force re-render/navigation trigger
      window.location.href = "/";

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div>
      <div className={styles.companyHeader}>
        <div className={styles.companyName}>
          <span>Project Governance System</span>
        </div>
      </div>

      <div className={styles.loginContainer}>
        <div className={styles.loginWrapper}>
          <div className={styles.loginBox}>
            <h2 className={styles.loginTitle}>Login</h2>

            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <label className={styles.loginLabel}>Username</label>
                <input
                  type="text"
                  className={styles.loginInput}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.loginLabel}>Password</label>
                <input
                  type="password"
                  className={styles.loginInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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