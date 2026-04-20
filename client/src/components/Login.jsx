
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Login({ setUser, isFinance }) {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔥 clear old session once
  useEffect(() => {
    sessionStorage.removeItem("pfNo");
    sessionStorage.removeItem("empId");
    sessionStorage.removeItem("financeUser");
  }, []);

  // ✅ restore login state (no redirect issue)
  useEffect(() => {
    const storedUser = localStorage.getItem("userid");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedRole) {
      setUser({ userid: storedUser, role: storedRole });
    }
  }, [setUser]);

  const handleLogin = async () => {
    try {
      const url = isFinance
        ? `${BASE_URL}/auth/finance-login`
        : `${BASE_URL}/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, password })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      if (data.userid) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("userid", data.userid);

        if (isFinance) {
          sessionStorage.setItem("financeUser", data.userid);
          sessionStorage.removeItem("empId");  
        } else {
          sessionStorage.setItem("empId", data.employeeId || "");
          sessionStorage.removeItem("financeUser");
        }

        setUser(data);

        // // ✅ redirect after login
        navigate("/form");

      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log(err);
      alert("Login error ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 px-4">
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isFinance ? "Finance Login" : "User Login"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-5"
        >
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Enter user ID"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none transition"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Register */}
        <div className="text-center mt-5">
          <button
            onClick={() => (window.location.href = "/register")}
            className="text-blue-600 hover:underline text-sm"
          >
            New User? Register
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
