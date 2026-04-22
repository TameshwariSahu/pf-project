import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const monthOrderMap = {
  Apr:1, May:2, Jun:3, Jul:4, Aug:5, Sep:6,
  Oct:7, Nov:8, Dec:9, Jan:10, Feb:11, Mar:12
};

function ViewData() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pf/get-pf`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch data ❌");
    } finally {
      setLoading(false);
    }
  };

  const grouped = records.reduce((acc, r) => {
    if (!acc[r.name]) acc[r.name] = [];
    acc[r.name].push(r);
    return acc;
  }, {});

  Object.keys(grouped).forEach((name) => {
    grouped[name].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrderMap[a.month] - monthOrderMap[b.month];
    });
  });

  if (loading) return <h2 className="text-center mt-10">Loading... ⏳</h2>;
  if (error) return <h2 className="text-center mt-10 text-red-500">{error}</h2>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">PF Records</h2>
        <button
          onClick={() => navigate("/form")}
          className="bg-gray-800 text-white px-4 py-1 rounded hover:bg-gray-700"
        >
          ⬅ Back
        </button>
      </div>

      <table className="border w-full text-center text-sm">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Month</th>
            <th className="p-2 border">Year</th>
            <th className="p-2 border">Basic</th>
            <th className="p-2 border">DA</th>
            <th className="p-2 border">VPF</th>
            <th className="p-2 border">Emp Share</th>
            <th className="p-2 border">Employer Share</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([name, rows]) => (
            <>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  {i === 0 ? <td rowSpan={rows.length} className="font-bold border bg-blue-50 align-middle">{name}</td> : null}
                  <td className="border p-1">{r.month}</td>
                  <td className="border p-1">{r.year}</td>
                  <td className="border p-1">{Number(r.basic).toLocaleString()}</td>
                  <td className="border p-1">{Number(r.da).toLocaleString()}</td>
                  <td className="border p-1">{Number(r.vpf).toLocaleString()}</td>
                  <td className="border p-1">{Number(r.employee_share).toLocaleString()}</td>
                  <td className="border p-1">{Number(r.employer_share).toLocaleString()}</td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewData;