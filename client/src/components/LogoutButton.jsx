
import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear React state
    setUser(null);

    // Clear sessionStorage / localStorage
    sessionStorage.clear();
    localStorage.clear();

    // Redirect to login page
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
