import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, excludedRoles }) => {
  const employee = JSON.parse(sessionStorage.getItem("employee"));

  if (!employee) {
    return <Navigate to="/" replace />;
  }

  const authority = employee?.authority?.trim();

  if (allowedRoles && !allowedRoles.includes(authority)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (excludedRoles && excludedRoles.includes(authority)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;