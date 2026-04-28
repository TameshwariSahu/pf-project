import { useNavigate } from "react-router-dom";

function NotFound({ user }) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "finance") {
      navigate("/form");
    } else {
      navigate("/userView");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 text-lg mb-6">This page doesn't exist.</p>
      <button
        onClick={handleRedirect}
        className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
      >
        {!user ? "Go to Login" : "Go to Dashboard"}
      </button>
    </div>
  );
}

export default NotFound;