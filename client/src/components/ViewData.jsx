// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// function ViewData() {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const navigate = useNavigate(); 

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/pf/get-pf`);

//       if (!res.ok) throw new Error("Server error");

//       const data = await res.json();
//       setRecords(data);
//     } catch (err) {
//       console.log(err);
//       setError("Failed to fetch data ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <h2 className="text-center mt-10">Loading... ⏳</h2>;
//   if (error) return <h2 className="text-center mt-10 text-red-500">{error}</h2>;

//   return (
//     <div className="p-5">

//       {/* 🔙 BACK BUTTON */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">PF Records</h2>

//         <button
//           onClick={() => navigate("/form")}
//           className="bg-gray-800 text-white px-4 py-1 rounded hover:bg-gray-700"
//         >
//           ⬅ Back
//         </button>
//       </div>

//       <table className="border w-full text-center">
//         <thead className="bg-black text-white">
//           <tr>
//             <th>Name</th>
//             <th>Month</th>
//             <th>Year</th>
//             <th>Basic</th>
//             <th>DA</th>
//             <th>VPF</th>
//             <th>Emp Share</th>
//             <th>Employer Share</th>
//           </tr>
//         </thead>

//       <tbody>
//   {records.length > 0 ? (
//     records.map((r) => (
//       <tr key={r.id}> 
//         <td>{r.name}</td>
//         <td>{r.month}</td>
//         <td>{r.year}</td>
//         <td>{Number(r.basic).toLocaleString()}</td>
//         <td>{Number(r.da).toLocaleString()}</td>
//         <td>{Number(r.vpf).toLocaleString()}</td>
//         <td>{Number(r.employee_share).toLocaleString()}</td>
//         <td>{Number(r.employer_share).toLocaleString()}</td>
//       </tr>
//     ))
//   ) : (
//     <tr>
//       <td colSpan="8">No data found ❌</td>
//     </tr>
//   )}
// </tbody>
//       </table>
//     </div>
//   );
// }

// export default ViewData;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  // Name se group karo, order already backend se sahi aayega
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.name]) acc[r.name] = [];
    acc[r.name].push(r);
    return acc;
  }, {});
  
  Object.keys(grouped).forEach((name) => {
  grouped[name].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month_order - b.month_order;
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
      {Object.entries(
  records.reduce((acc, curr) => {
    if (!acc[curr.name]) acc[curr.name] = [];
    acc[curr.name].push(curr);
    return acc;
  }, {})
).map(([name, rows]) => (
  <>
    {rows.map((r, i) => (
      <tr key={i}>
        {/* 👇 Name sirf first row me dikhe */}
        {i === 0 ? <td rowSpan={rows.length}>{name}</td> : null}

        <td>{r.month}</td>
        <td>{r.year}</td>
        <td>{Number(r.basic).toLocaleString()}</td>
        <td>{Number(r.da).toLocaleString()}</td>
        <td>{Number(r.vpf).toLocaleString()}</td>
        <td>{Number(r.employee_share).toLocaleString()}</td>
        <td>{Number(r.employer_share).toLocaleString()}</td>
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