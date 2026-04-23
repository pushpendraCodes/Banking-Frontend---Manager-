import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  // Use sessionStorage instead of sessionStorage
  const token = sessionStorage.getItem("token");

  if (!token) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children; // If logged in, render the child component
}