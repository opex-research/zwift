import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAccount } from "../context/AccountContext";

/**
 * ProtectedRoute Component
 *
 * This component acts as a wrapper for routes that require authentication.
 * It checks if the user is logged in and either allows access to the child routes
 * or redirects to the home page.
 *
 * @returns {React.Element} Either the child routes (Outlet) if authenticated,
 *                          or a redirect (Navigate) to the home page if not.
 */
const ProtectedRoute = () => {
  const { logged } = useAccount();

  return logged ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
