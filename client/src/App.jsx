// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import PFStatement from "./components/PFStatement";
// import Login from "./components/Login";
// import ViewData from "./components/ViewData";
// import UserView from "./components/UserView";
// import CreateDAM from "./components/CreateDAM";
// import LogoutButton from "./components/LogoutButton";
// import Register from "./components/Register";
// import NotFound from "./components/NotFound";

// function App() {
//   const [user, setUser] = useState(null);
//   const [loginType, setLoginType] = useState("normal");
//   const [year, setYear] = useState(2008);

//   const RequireAuth = ({ children }) => {
//     return user ? children : <Navigate to="/login" />;
//   };

//   return (
//     <Router>
//       <Routes>

//         {/* LOGIN */}
//               <Route
//             path="/login"
//             element={
//               !user ? (
//                 <Login setUser={setUser} isFinance={loginType === "finance"} setLoginType={setLoginType} loginType={loginType} />
//               ) : (
//                 <Navigate to="/" />
//               )
//             }
//           />

//         {/* HOME REDIRECT */}
//         <Route
//           path="/"
//           element={
//             user ? (
//               user.role === "admin" ? <Navigate to="/form" /> : <Navigate to="/userView" />
//             ) : (
//               <Navigate to="/login" />
//             )
//           }
//         />

//         {/* PF FORM */}
//         <Route
//           path="/form"
//           element={
//             <RequireAuth>
//               <PFStatement user={user} setUser={setUser} />
//             </RequireAuth>
//           }
//         />

//         {/* VIEW DATA */}
//         <Route
//           path="/view"
//           element={
//             <RequireAuth>
//               <div>
//                 <LogoutButton setUser={setUser} />
//                 <ViewData />
//               </div>
//             </RequireAuth>
//           }
//         />

//         {/* USER VIEW */}
//         <Route
//           path="/userView"
//           element={
//             <RequireAuth>
//               <div>
//                 <LogoutButton setUser={setUser} />
//                 <UserView />
//               </div>
//             </RequireAuth>
//           }
//         />

//         {/* DA PAGE */}
//         <Route
//           path="/da_m"
//           element={
//             <RequireAuth>
//               <div>
//                 <LogoutButton setUser={setUser} />
//                 <CreateDAM year={year} financeUser={user?.userid} />
//               </div>
//             </RequireAuth>
//           }
//         />

//         {/* REGISTER */}
//         <Route path="/register" element={<Register />} />

//         {/* FALLBACK */}
//        <Route path="*" element={<NotFound user={user} />} />

//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // npm i react-hot-toast
import PFStatement from "./components/PFStatement";
import Login from "./components/Login";
import ViewData from "./components/ViewData";
import UserView from "./components/UserView";
import CreateDAM from "./components/CreateDAM";
import LogoutButton from "./components/LogoutButton";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import LoadingSpinner from "./components/LoadingSpinner"; // Optional

function App() {
  const [user, setUser] = useState(null);
  const [loginType, setLoginType] = useState("normal");
  const [year, setYear] = useState(2008);
  const [loading, setLoading] = useState(true);

  // Simulate user persistence check (localStorage/sessionStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("pf_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("❌ User data corrupted:", error);
        localStorage.removeItem("pf_user");
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("pf_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pf_user");
    }
  }, [user]);

  const RequireAuth = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return null;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* LOGIN */}
            <Route
              path="/login"
              element={
                !user ? (
                  <Login 
                    setUser={setUser} 
                    isFinance={loginType === "finance"} 
                    setLoginType={setLoginType} 
                    loginType={loginType} 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* HOME REDIRECT */}
            <Route
              path="/"
              element={
                user ? (
                  user.role === "admin" ? <Navigate to="/form" replace /> : <Navigate to="/userView" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* PF FORM */}
            <Route
              path="/form"
              element={
                <RequireAuth>
                  <div className="max-w-7xl mx-auto p-6">
                    <PFStatement user={user} setUser={setUser} />
                  </div>
                </RequireAuth>
              }
            />

            {/* VIEW DATA */}
            <Route
              path="/view"
              element={
                <RequireAuth>
                  <div className="max-w-7xl mx-auto p-6">
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
                  <div className="max-w-7xl mx-auto p-6">
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
                  <div className="max-w-7xl mx-auto p-6">
                    <LogoutButton setUser={setUser} />
                    <CreateDAM year={year} financeUser={user?.userid} />
                  </div>
                </RequireAuth>
              }
            />

            {/* REGISTER */}
            <Route path="/register" element={<Register />} />

            {/* 404 FALLBACK */}
            <Route path="*" element={<NotFound user={user} setUser={setUser} />} />
          </Routes>
        </div>
      </Router>
      
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}

// Simple Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export default App;