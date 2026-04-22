import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import PFStatement from "./components/PFStatement";
import Login from "./components/Login";
import ViewData from "./components/ViewData";
import UserView from "./components/UserView";
import CreateDAM from "./components/CreateDAM";
import LogoutButton from "./components/LogoutButton";
import Register from "./components/Register";

function App() {
  const [user, setUser] = useState(null);
  const [loginType, setLoginType] = useState("normal");
  const [year, setYear] = useState(2008);

  const RequireAuth = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>

        {/* 🔴 LOGIN PAGE */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login
                setUser={setUser}
                isFinance={loginType === "finance"}
                loginType={loginType}
                setLoginType={setLoginType}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 🔴 HOME REDIRECT */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "finance" ? (
                <Navigate to="/form" />
              ) : (
                <Navigate to="/userView" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 🔴 PF FORM */}
        <Route
          path="/form"
          element={
            <RequireAuth>
              <div>
                <div className="flex justify-end p-4">
                  <LogoutButton setUser={setUser} />
                </div>
                {user?.role === "finance" && (
                  <div className="flex gap-3 p-4">
                    <Link to="/view" className="bg-blue-500 text-white px-4 py-2 rounded">
                      View Data
                    </Link>
                  </div>
                )}
                <PFStatement user={user} />
              </div>
            </RequireAuth>
          }
        />

        {/* 🔴 VIEW DATA */}
        <Route
          path="/view"
          element={
            <RequireAuth>
              <div>
                <LogoutButton setUser={setUser} />
                <ViewData />
              </div>
            </RequireAuth>
          }
        />

        {/* 🔴 USER VIEW */}
        <Route
          path="/userView"
          element={
            <RequireAuth>
              <div>
                <LogoutButton setUser={setUser} />
                <UserView />
              </div>
            </RequireAuth>
          }
        />

        {/* 🔴 CREATE DA */}
        <Route
          path="/da_m"
          element={
            <RequireAuth>
              <div>
                <LogoutButton setUser={setUser} />
                <CreateDAM year={year} financeUser={user?.userid} />
              </div>
            </RequireAuth>
          }
        />

        {/* 🔴 REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* 🔴 FALLBACK */}
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} />}
        />

      </Routes>
    </Router>
  );
}

export default App;