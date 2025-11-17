import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  // Use sessionStorage instead of sessionStorage
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // Optional: Clear session on browser/tab close (sessionStorage already does this automatically)
    const handleBeforeUnload = () => {
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (!token) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children; // If logged in, render the child component
}