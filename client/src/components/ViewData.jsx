import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function ViewData() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("API:", `${BASE_URL}/pf/get-pf`);

      const res = await fetch(`${BASE_URL}/pf/get-pf`);

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      console.log("DATA:", data);

      setRecords(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data ❌");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2 className="text-center mt-10">Loading... ⏳</h2>;
  if (error) return <h2 className="text-center mt-10 text-red-500">{error}</h2>;

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4 text-center">PF Records</h2>

      <table className="border w-full text-center">
        <thead className="bg-black text-white">
          <tr>
            <th>Name</th>
            <th>Month</th>
            <th>Year</th>
            <th>Basic</th>
            <th>DA</th>
            <th>Emp Share</th>
            <th>Employer Share</th>
          </tr>
        </thead>

        <tbody>
          {records && records.length > 0 ? (
            records.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.month}</td>
                <td>{r.year}</td>
                <td>{Number(r.basic).toLocaleString()}</td>
                <td>{Number(r.da).toLocaleString()}</td>
                <td>{Number(r.employee_share).toLocaleString()}</td>
                <td>{Number(r.employer_share).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No data found ❌</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ViewData;