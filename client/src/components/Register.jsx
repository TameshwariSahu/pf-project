import React, { useState } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function Register() {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleRegister = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userid,
          password,
          role
        })
      });

      const msg = await res.text();
      alert(msg);

    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  return (
 <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4">

  <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
    
    {/* Heading */}
    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
      Create Account
    </h2>

    {/* UserId */}
<input
  placeholder="User ID"
  value={userid}
  onChange={(e) => setUserid(e.target.value)}
  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
/>
<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
/>

    {/* Role */}
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <option value="admin">Admin</option>
      <option value="finance">Finance</option>
    </select>

    {/* Button */}
    <button
      onClick={handleRegister}
      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg transition duration-200 shadow-md"
    >
      Register
    </button>

  </div>
</div>
  );
}

export default Register;