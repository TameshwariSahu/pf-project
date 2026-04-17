import React, { useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function Login({ setUser, isFinance }) {   // ❌ setPage hata diya
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Auto login (only setUser)
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

      const data = await res.json();

      if (data.userid) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("userid", data.userid);
        sessionStorage.setItem("employeeId", data.employeeId); 
        sessionStorage.setItem("financeUser", data.userid); 


        setUser(data);  
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log(err);
      alert("Backend not connected ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-r from-purple-400 to-blue-400 pt-20 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isFinance ? "Finance Login" : "User Login"}
        </h2>

        <input
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          placeholder="User ID"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 px-4 py-2 border rounded-lg"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-purple-500 text-white py-2 rounded-lg"
        >
          Login
        </button>
        <button
          onClick={() => window.location.href = "/register"}
          className="mt-3 text-blue-500"
        >
          New User? Register
        </button>
      </div>
    </div>
  );
}

export default Login;





