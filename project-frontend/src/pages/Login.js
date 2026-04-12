import React, { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const employee = JSON.parse(sessionStorage.getItem("employee"));

    if (!employee) return;

    const authority = employee?.authority?.trim();
    const role = employee?.role?.trim();

    const isAdmin = authority === "ROLE_ADMIN";
    const isManager = authority === "ROLE_MANAGER";
    const isAccounts = role === "Accounts";

    if (isAdmin) {
      navigate("/manager/view-approved-request", { replace: true });
    } 
    else if (isManager || employee?.manager) {
      navigate("/manager/work", { replace: true });
    } 
    else if (isAccounts) {
      navigate("/employee/leave", { replace: true });
    } 
    else {
      navigate("/employee/work", { replace: true });
    }

  }, [navigate]);

  return <LoginForm />;
};

export default Login;