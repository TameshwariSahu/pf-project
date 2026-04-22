import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function CreateDAM() {
  const [pfData, setPfData] = useState([]);
  const [daValues, setDaValues] = useState({});
  const [category, setCategory] = useState("Worker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const user = localStorage.getItem("userid");

  // 🔹 FETCH ALL MONTHS
  const fetchPF = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/da_m/get-all`);
      const data = await res.json();
      setPfData(data);
    } catch (err) {
      console.log(err);
      setError("Error fetching ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPF();
  }, []);

  // 🔹 DA INPUT
  const handleDAChange = (month, year, value) => {
    const key = `${month}-${year}`;
    setDaValues((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 APPLY DA
  const handleApplyDA = async (month, year) => {
    const key = `${month}-${year}`;
    const daPercent = daValues[key];

    if (!daPercent) { alert("Enter DA % ❌"); return; }

    try {
      const res = await fetch(`${BASE_URL}/da_m/apply-da`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": user
        },
        body: JSON.stringify({
          month,
          year,
          da_percent: Number(daPercent),
          category
        })
      });

      if (!res.ok) throw new Error("Bad Request");
      alert(`DA Applied for ALL ${category}s ✅`);
      fetchPF();
    } catch (err) {
      console.log(err);
      alert("Server Error ❌");
    }
  };

  return (
    <div className="p-5">
      <button
        onClick={() => navigate("/form", { replace: true })}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
      >
        ⬅ Back
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">DA Management</h2>

      {/* CATEGORY SELECT */}
      <div className="mb-4 flex justify-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-2 rounded shadow"
        >
          <option value="Worker">Worker</option>
          <option value="Executive">Executive</option>
        </select>
      </div>

      {loading ? (
        <p className="text-blue-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="border w-full text-center">
          <thead>
            <tr className="bg-black text-white">
              <th className="border p-2">Year</th>
              <th className="border p-2">Month</th>
              <th className="border p-2">DA %</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {pfData.map((d, i) => {
              const key = `${d.month}-${d.year}`;
              return (
                <tr key={i}>
                  <td className="border p-2">{d.year}</td>
                  <td className="border p-2">{d.month}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={daValues[key] || ""}
                      onChange={(e) => handleDAChange(d.month, d.year, e.target.value)}
                      className="border px-2 py-1 w-20"
                    />
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleApplyDA(d.month, d.year)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CreateDAM;