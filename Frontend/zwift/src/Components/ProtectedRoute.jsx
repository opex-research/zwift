import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAccount } from "../context/AccountContext"; // Adjust the import path as necessary

const ProtectedRoute = () => {
  const { logged } = useAccount();
  return logged ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute; // Make sure this line is present
