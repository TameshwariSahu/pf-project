import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Login({ setUser, isFinance, setLoginType, loginType }) {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem("pfNo");
    sessionStorage.removeItem("empId");
    sessionStorage.removeItem("financeUser");
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("userid");
    const storedRole = localStorage.getItem("role");
    if (storedUser && storedRole) {
      setUser({ userid: storedUser, role: storedRole });
    }
  }, [setUser]);

  const validate = () => {
    const newErrors = {};
    if (!userid.trim()) newErrors.userid = "User ID required";
    if (!password.trim()) newErrors.password = "Password required";
    else if (password.length < 4) newErrors.password = "Min 4 characters required";
    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const url = isFinance
        ? `${BASE_URL}/auth/finance-login`
        : `${BASE_URL}/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ server: data.message || "Login failed ❌" });
        return;
      }

      if (data.userid) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("userid", data.userid);
        localStorage.setItem("token", data.token); // ✅ token save

        if (isFinance) {
          sessionStorage.setItem("financeUser", data.userid);
          sessionStorage.removeItem("empId");
        } else {
          sessionStorage.setItem("empId", data.employeeId || "");
          sessionStorage.removeItem("financeUser");
        }

        setUser(data);
        if (data.role === "admin") navigate("/form");
        else navigate("/userView");
      } else {
        setErrors({ server: data.message || "Login failed ❌" });
      }
    } catch {
      setErrors({ server: "Server error — please try again ❌" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-lg">
        <div className="flex">

          {/* LEFT - Branding */}
          <div className="bg-gray-900 w-2/5 flex flex-col items-center justify-center px-4 py-10 gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold tracking-wide">
              NMDC
            </div>
            <div className="text-center">
              <p className="text-white text-xs font-semibold leading-snug">PF Trust</p>
              <p className="text-gray-500 text-xs mt-1 leading-snug">Kirandul<br />Complex</p>
            </div>
          </div>

          {/* RIGHT - Form */}
          <div className="flex-1 px-5 py-8 flex flex-col justify-center">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Welcome back</h2>

            {/* Tab Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setLoginType("normal"); setErrors({}); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                  loginType === "normal"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-400 border-gray-200 bg-white"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => { setLoginType("finance"); setErrors({}); }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                  loginType === "finance"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-400 border-gray-200 bg-white"
                }`}
              >
                Finance
              </button>
            </div>

            {/* Server Error */}
            {errors.server && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-500 text-xs">{errors.server}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">User ID</label>
                <input
                  type="text"
                  placeholder="Enter user ID"
                  value={userid}
                  autoComplete="off"
                  onChange={(e) => {
                    setUserid(e.target.value);
                    if (errors.userid) setErrors(prev => ({ ...prev, userid: "" }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    errors.userid ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.userid && <p className="text-red-500 text-xs mt-1">{errors.userid}</p>}
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  autoComplete="off"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  }}
                  className={`w-full border rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white rounded-lg py-2 text-xs font-semibold hover:bg-gray-700 transition active:scale-95 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;