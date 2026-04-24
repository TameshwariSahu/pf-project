import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !user ? (
              <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <Login setUser={setUser} isFinance={loginType === "finance"} setLoginType={setLoginType} loginType={loginType} />
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* HOME REDIRECT */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? <Navigate to="/form" /> : <Navigate to="/userView" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* PF FORM */}
        <Route
          path="/form"
          element={
            <RequireAuth>
              <PFStatement user={user} setUser={setUser} />
            </RequireAuth>
          }
        />

        {/* VIEW DATA */}
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

        {/* USER VIEW */}
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

        {/* DA PAGE */}
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

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />

      </Routes>
    </Router>
  );
}

export default App;