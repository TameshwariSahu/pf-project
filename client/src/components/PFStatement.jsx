import React, { useState,useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./nmdc.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function PFStatement({ user = {} }) {
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const years = [];
  for(let i = 2008; i <= 2015; i++) years.push(i);

  const [year, setYear] = useState(2008); 

  const [basic, setBasic] = useState({});
  const [da, setDa] = useState({});
  const [vpf, setVpf] = useState({});
  const [eps, setEps] = useState({});

  const [empName, setEmpName] = useState("");
  const [department, setDepartment] = useState("");
  // const [pfNo, setPfNo] = useState(() => sessionStorage.getItem("pfNo") || "");
  const [pfNo, setPfNo] = useState(() => sessionStorage.getItem("empId") || "");
const navigate = useNavigate();

const storedUser = JSON.parse(localStorage.getItem("user") || "null");

useEffect(() => {
  const userid = localStorage.getItem("userid");
  const role = localStorage.getItem("role");

  if (!userid || !role) {
    navigate("/login", { replace: true });
  }
}, []);


// useEffect(() => {
//   const saved = sessionStorage.getItem("pfData");
//   if (saved) {
//     const parsed = JSON.parse(saved);
//     setBasic(parsed.basic || {});
//     setDa(parsed.da || {});
//     setVpf(parsed.vpf || {});
//     setEps(parsed.eps || {});
//     setEmpName(parsed.empName || "");
//     setDepartment(parsed.department || "");
//     setPfNo(parsed.pfNo || "");
//   }
// }, []);

  const clean = (val) => {
  if (!val || Number(val) === 0) return "";
  return Math.round(val);
};
  
 const safeNum = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

  const [daPercent, setDaPercent] = useState("");
  const [daStartMonth, setDaStartMonth] = useState("Apr");

  const [originalBasic, setOriginalBasic] = useState({});
  const [originalDA, setOriginalDA] = useState({});
  const [originalVPF, setOriginalVPF] = useState({});
  const [originalEPS, setOriginalEPS] = useState({});

  // Calculations
  const basicDA = (m) => Math.max(0, basic[m] ?? originalBasic[m] ?? 0) + Math.max(0, da[m] ?? originalDA[m] ?? 0);
  const employeeShare = (m) => Math.round((basicDA(m) * 0.12) / 10) * 10;

  const getFiscalYear = (month) => {
    const monthIndex = months.indexOf(month);
    return monthIndex <= 8 ? year : year + 1;
  };

  const initializeEPS = (m) => {
    const mYear = getFiscalYear(m);
    if (eps[m] !== undefined) return eps[m];
    if (mYear <= 2012) return 541;
    return 1250;
  };

  const epsValue = (m) => (basicDA(m) === 0 ? 0 : initializeEPS(m));
  const employerShare = (m) => Math.max(0, employeeShare(m) - epsValue(m));

  const totalBasic = months.reduce((s, m) => s + Math.max(0, basic[m] ?? originalBasic[m] ?? 0), 0);
  const totalDA = months.reduce((s, m) => s + Math.max(0, da[m] ?? originalDA[m] ?? 0), 0);
  const totalVPF = months.reduce(
  (s, m) => s + safeNum(vpf[m] ?? originalVPF[m]),
  0
);
  const totalEmpShare = months.reduce((s, m) => s + employeeShare(m), 0);
  const totalEPS = months.reduce((s, m) => s + epsValue(m), 0);
  const totalEmployerShare = months.reduce((s, m) => s + employerShare(m), 0);

  // Apply DA for 3 months
  const applyDA = async () => {
    if (!daPercent) { toast.error("Enter DA % ❌"); return; }
    const startIndex = months.indexOf(daStartMonth);
    const percent = Number(daPercent);
    let newDA = { ...da };

    for (let i = startIndex; i < startIndex + 3; i++) {
      if (i >= months.length) break;
      const m = months[i];
      const basicVal = basic[m] ?? originalBasic[m] ?? 0;
      newDA[m] = Math.round((basicVal * percent) / 100);
    }

    setDa(newDA);

    try {
      await fetch(`${BASE_URL}/auth/save-da`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, startMonth: daStartMonth, percent: daPercent, pfNo })
      });
      toast.success("DA Applied ✅");
    } catch {
      toast.error("Error saving DA ❌");
    }
  };

  // Fetch PF data
 const fetchPFData = async (id = pfNo) => {
  if (!id) { return; }
  try {
    const res = await fetch(`${BASE_URL}/pf/get-pf-by-emp/${id}`);
    if (!res.ok) {
      // ✅ Reset sab
      setEmpName("");
      setDepartment("");
      setBasic({});
      setDa({});
      setVpf({});
      setEps({});
      setOriginalBasic({});
      setOriginalDA({});
      setOriginalVPF({});
      setOriginalEPS({});
      toast.error("No data found ❌");
      return;
    }
    const result = await res.json();

    if (!result || result.length === 0) {
      // ✅ Empty array aaye tab bhi reset
      setEmpName("");
      setDepartment("");
      setBasic({});
      setDa({});
      setVpf({});
      setEps({});
      setOriginalBasic({});
      setOriginalDA({});
      setOriginalVPF({});
      setOriginalEPS({});
      toast.error("No data found ❌");
      return;
    }

    setEmpName(result[0].name || "");
    setDepartment(result[0].department || "");

    let newBasic = {};
    let newDA = {};
    let newVPF = {};
    let newEPS = {};

    result.forEach(row => {
      newBasic[row.month] = row.basic;
      newDA[row.month] = row.da;
      newVPF[row.month] = row.vpf;
      newEPS[row.month] = row.eps;
    });

    setOriginalBasic(newBasic);
    setOriginalDA(newDA);
    setOriginalVPF(newVPF);
    setOriginalEPS(newEPS);
    setBasic(newBasic);
    setDa(newDA);
    setVpf(newVPF);
    setEps(newEPS);

    toast.success("Data fetched ✅");
  } catch (err) {
    // ✅ Error pe bhi reset
    setEmpName("");
    setDepartment("");
    setBasic({});
    setDa({});
    setVpf({});
    setEps({});
    setOriginalBasic({});
    setOriginalDA({});
    setOriginalVPF({});
    setOriginalEPS({});
    toast.error("No data found ❌");
  }
};

  const saveSessionData = () => {
  sessionStorage.setItem("pfData", JSON.stringify({
    basic,
    da,
    vpf,
    eps,
    empName,
    department,
    pfNo
  }));
};
useEffect(() => {
  const saved = sessionStorage.getItem("pfData");
  if (saved) {
    const parsed = JSON.parse(saved);
    setBasic(parsed.basic || {});
    setDa(parsed.da || {});
    setVpf(parsed.vpf || {});
    setEps(parsed.eps || {});
    setEmpName(parsed.empName || "");
    setDepartment(parsed.department || "");
    setPfNo(parsed.pfNo || "");
  }
}, []);

  // Save PF data
  const saveToDB = async () => {
    if (!empName.trim() || !department.trim() || !pfNo.trim()) {
      toast.error("Fill all Employee Details ❌");
      return;
    }

    const hasData = months.some(m => Number(basic[m] ?? 0) > 0 && Number(da[m] ?? 0) > 0);
    if (!hasData) { toast.error("Enter at least one month Basic + DA ❌"); return; }

    const data = months.map((m, index) => ({
      month: m,
      month_order: index + 1,
      year: getFiscalYear(m),
      basic: basic[m] ?? 0,
      da: da[m] ?? 0,
      vpf: vpf[m] ?? 0,
      employee_share: employeeShare(m),
      employer_share: employerShare(m),
      eps: epsValue(m)
    }));

    try {
      const res = await fetch(`${BASE_URL}/auth/save-pf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empName, department, pfNo, created_by: user?.userid, data })
      });
      const msg = await res.text();
      toast.success(msg);
    } catch {
      toast.error("Error saving ❌");
    }
  };
  
  // Download PDF
  const downloadPDF = () => {
    if (!empName || !department || !pfNo) { toast.error("Fill all Employee Details ❌"); return; }

    const pdf = new jsPDF();
    pdf.addImage(logo, "PNG", 10, 10, 20, 15);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text("NMDC EMPLOYEES PROVIDENT FUND TRUST", 105, 15, { align: "center" });
    pdf.text("Unit : KIRANDUL COMPLEX", 105, 21, { align: "center" });
    pdf.text(`PF STATEMENT FOR THE PERIOD APRIL ${year} TO MARCH ${year+1}`, 105, 27, { align: "center" });

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Employee Name : ${empName}`, 15, 40);
    pdf.text(`Department : ${department}`, 90, 40);
    pdf.text(`PF Number : ${pfNo}`, 15, 50);

    const tableData = months.map(m => [
      m,
      basic[m] ?? 0,
      da[m] ?? 0,
      basicDA(m),
      vpf[m] ?? 0,
      employeeShare(m),
      epsValue(m),
      employerShare(m)
    ]);

    tableData.push([
      "Total",
      totalBasic,
      totalDA,
      totalBasic + totalDA,
      totalVPF,
      totalEmpShare,
      totalEPS,
      totalEmployerShare
    ]);

    autoTable(pdf, {
      head: [["Month","Basic","DA","Basic+DA","VPF","Employee Share","EPS","Employer Share"]],
      body: tableData,
      startY: 65,
      theme: "grid",
      headStyles: { fillColor: [0,0,0], textColor: [255,255,255], fontStyle: "bold", halign: "center" },
      didParseCell: function(data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [173,216,230];
          data.cell.styles.fontStyle = "bold";
        }
      }
    });

    pdf.save("pf-statement.pdf");
  };

  return (
    
    <div className="p-5">
      <h2 className="text-center font-bold text-lg mb-4">
        NMDC EMPLOYEES PROVIDENT FUND TRUST <br/>
        Unit : KIRANDUL COMPLEX <br/>
        PF STATEMENT FOR APRIL {year} TO MARCH {year+1}
      </h2>

      <label className="font-bold mr-2"> Year </label>
      <select className="border px-2 py-1 rounded" value={year} onChange={e => setYear(Number(e.target.value))}>
        {years.map(y => <option key={y} value={y}>{y}-{String(y+1).slice(2)}</option>)}
      </select>

      <h3 className="mt-4 font-semibold">Employee Details</h3>
      <div className="flex flex-wrap gap-2 mt-2">
        <input className="border px-2 py-1 rounded" value={empName} placeholder="Employee Name" onChange={e => setEmpName(e.target.value)} />
        <input className="border px-2 py-1 rounded" value={department} placeholder="Department" onChange={e => setDepartment(e.target.value)} />

        <div className="flex gap-2">
        <input
          className="border px-2 py-1 rounded"
          value={pfNo}
          placeholder="PF Number"
                onChange={e => {
          const val = e.target.value;
          setPfNo(val);
          if (val.trim().length >= 5) { 
            fetchPFData(val.trim());
          }
        }}
        />
          <button onClick={fetchPFData} className="bg-blue-500 text-white px-3 py-1 rounded">Fetch</button>
          {/* <button
          onClick={() => {

            saveSessionData(); // ✅ SAVE ONCE ONLY

            sessionStorage.setItem("empId", pfNo);

            navigate("/da_m", { state: { employeeId: pfNo, user: localStorage.getItem("userid") } });
          }}
          className="bg-purple-600 text-white px-4 py-1 rounded"
        >
          Go to DA Page
        </button> */}
        <button
              onClick={() => {
                navigate("/da_m");
              }}
              className="bg-purple-600 text-white px-4 py-1 rounded"
            >
              Go to DA Page
            </button>
        </div>
      </div>

      {/* PF Table */}
      <table className="border border-black w-full text-center mt-4">
        <thead>
          <tr className="bg-black text-white font-bold">
            <th className="border p-1">Month</th>
            <th className="border p-1">Basic</th>
            <th className="border p-1">DA</th>
            <th className="border p-1">Basic+DA</th>
            <th className="border p-1">VPF</th>
            <th className="border p-1">Employee Share</th>
            <th className="border p-1">EPS</th>
            <th className="border p-1">Employer Share</th>
          </tr>
        </thead>
        <tbody>
          {months.map(m => (
            <tr key={m}>
              <td className="border p-1">{m}</td>
              <td className="border p-1">
               <input 
                  type="number" 
                  value={basic[m] ?? ""} 
                  onChange={e => setBasic({...basic, [m]: Number(e.target.value)})}
                />
              </td>
              <td className="border p-1">
               {clean(da[m])}
              </td>
              <td className="border p-1">{basicDA(m)}</td>
             <td className="border p-1">
              <input 
                type="number"
                value={vpf[m] ?? ""} 
                onChange={e => setVpf({ ...vpf, [m]: safeNum(e.target.value) })}
              />
             </td>
              <td className="border p-1">{employeeShare(m)}</td>
              <td className="border p-1">{epsValue(m)}</td>
              <td className="border p-1">{employerShare(m)}</td>
            </tr>
          ))}
          <tr className="bg-blue-100 font-bold">
            <td className="border p-1">Total</td>
            <td className="border p-1">{clean(totalBasic)}</td>
            <td className="border p-1">{clean(totalDA)}</td>
            <td className="border p-1">{totalBasic + totalDA}</td>
            <td className="border p-1">{clean(totalVPF)}</td>
            <td className="border p-1">{totalEmpShare}</td>
            <td className="border p-1">{totalEPS}</td>
            <td className="border p-1">{totalEmployerShare}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex gap-2 mt-4">
        {localStorage.getItem("role") === "finance" && (
          <button onClick={saveToDB} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
        )}
        <button onClick={downloadPDF} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Download PDF</button>
      </div>

      <ToastContainer />
    </div>
  );
}

export default PFStatement;