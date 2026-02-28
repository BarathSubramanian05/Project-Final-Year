import React, { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useEmployee } from "../context/EmployeeContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { employee } = useEmployee();
  const navigate = useNavigate();

  useEffect(() => {
  if (!employee) return;

  if (employee.manager) {
    navigate("/manager/work", { replace: true });
  } else if (
    employee.designation.trim() === "Assistant IT Manager" ||
    employee.designation.trim() === "Assistant General Manager"
  ) {
    navigate("/manager/work", { replace: true });
  } 
  else if(employee.designation.trim() === "HR Manager")
  {
    navigate("/manager/view-approved-request", { replace: true });
  }

  else if(employee.role.trim() === "IT Admin " || employee.role.trim() === "Accounts")
  {
    navigate("/employee/leave", { replace: true })
  }
  
  else {
    navigate("/employee/work", { replace: true });
  }
}, [employee, navigate]);

  return <LoginForm />;
};

export default Login;