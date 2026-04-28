// import { useNavigate } from "react-router-dom";

// function NotFound({ user }) {
//   const navigate = useNavigate();

//   const handleRedirect = () => {
//     if (!user) {
//       navigate("/login");
//     } else if (user.role === "finance") {
//       navigate("/form");
//     } else {
//       navigate("/userView");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//       <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
//       <p className="text-gray-500 text-lg mb-6">This page doesn't exist.</p>
//       <button
//         onClick={handleRedirect}
//         className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
//       >
//         {!user ? "Go to Login" : "Go to Dashboard"}
//       </button>
//     </div>
//   );
// }

// export default NotFound;


// components/NotFound.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useState } from "react";

function NotFound({ user, setUser }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleRedirect();
    }
  }, [countdown]);

  const handleRedirect = () => {
    try {
      if (!user) {
        toast("🔐 Redirecting to Login...", { id: "redirect" });
        navigate("/login", { replace: true });
      } else if (user.role === "admin") {
        toast("📊 Redirecting to Dashboard...", { id: "redirect" });
        navigate("/form", { replace: true });
      } else {
        toast("👤 Redirecting to User View...", { id: "redirect" });
        navigate("/userView", { replace: true });
      }
    } catch (error) {
      console.error("❌ Navigation Error:", error);
      toast.error("Navigation failed. Please refresh.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
          <span className="text-3xl font-black text-white">404</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-indigo-900 bg-clip-text text-transparent mb-4">
          Oops! Lost?
        </h1>
        <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 mb-8">
          <p className="text-lg text-gray-700 mb-2">
            Redirecting in <span className="font-mono text-2xl text-indigo-600 font-bold">{countdown}</span>s
          </p>
          <p className="text-sm text-gray-500">
            {user ? `Welcome ${user.role} user!` : "Please login to continue"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRedirect}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            {user?.role === "admin" 
              ? "📊 Go to Dashboard" 
              : !user 
                ? "🔐 Go to Login" 
                : "👤 Go to UserView"
            }
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="border-2 border-gray-300 hover:border-indigo-400 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;