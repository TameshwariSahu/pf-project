import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ViewData() {
  const [records, setRecords] = useState([]);
  const [pfNo, setPfNo] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/pf/get-pf");
      const data = await res.json();
      setRecords(data);
    } catch {
      alert("Error fetching ❌");
    }
  };

  useEffect(() => {
    fetchData();

    
  }, []);

  const handleBack = () => {
      sessionStorage.removeItem("pfNo"); 
    navigate("/form");
  };

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
          {records.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.month}</td>
              <td>{r.year}</td>
              <td>{r.basic}</td>
              <td>{r.da}</td>
              <td>{r.employee_share}</td>
              <td>{r.employer_share}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleBack}
        className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
      >
        ⬅ Back
      </button>
    </div>
  );
}

export default ViewData;