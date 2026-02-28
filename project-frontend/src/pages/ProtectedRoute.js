import React from "react";
import { Navigate } from "react-router-dom";
import { useEmployee } from "../context/EmployeeContext";

const ProtectedRoute = ({ children , allowedRoles ,excludedRoles }) => {
  const { employee } = useEmployee();

  if (!employee) {
    return <Navigate to="/" replace />; // redirect to login
  }

  if (allowedRoles && !allowedRoles.includes(employee.designation.trim())) {
    // Unauthorized access → redirect to "unauthorized" or home page
    return <Navigate to="/unauthorized" replace />;
  }

  if (excludedRoles && excludedRoles.includes(employee.designation.trim())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
