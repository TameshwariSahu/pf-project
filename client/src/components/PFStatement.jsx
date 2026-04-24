import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "./nmdc.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function PFStatement({ user = {}, setUser }) {
  const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  const years = [];
  for (let i = 2008; i <= 2015; i++) years.push(i);

  const [year, setYear] = useState(2008);
  const [basic, setBasic] = useState({});
  const [da, setDa] = useState({});
  const [vpf, setVpf] = useState({});
  const [eps, setEps] = useState({});
  const [empName, setEmpName] = useState("");
  const [department, setDepartment] = useState("");
  const [pfNo, setPfNo] = useState(() => sessionStorage.getItem("empId") || "");
  const [daPercent, setDaPercent] = useState("");
  const [daStartMonth, setDaStartMonth] = useState("Apr");
  const [originalBasic, setOriginalBasic] = useState({});
  const [originalDA, setOriginalDA] = useState({});
  const [originalVPF, setOriginalVPF] = useState({});
  const [originalEPS, setOriginalEPS] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const userid = localStorage.getItem("userid");
    const role = localStorage.getItem("role");
    if (!userid || !role) navigate("/login", { replace: true });
  }, []);

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
      if (result[0].year) setYear(result[0].year);
      setPfNo(parsed.pfNo || "");
    }
  }, []);

  const clean = (val) => (!val || Number(val) === 0 ? "" : Math.round(val));
  const safeNum = (val) => { const n = Number(val); return isNaN(n) ? 0 : n; };

  const basicDA = (m) => Math.max(0, basic[m] ?? originalBasic[m] ?? 0) + Math.max(0, da[m] ?? originalDA[m] ?? 0);
  const employeeShare = (m) => Math.round((basicDA(m) * 0.12) / 10) * 10;
  const getFiscalYear = (month) => { const idx = months.indexOf(month); return idx <= 8 ? year : year + 1; };
  const initializeEPS = (m) => { const mYear = getFiscalYear(m); if (eps[m] !== undefined) return eps[m]; return mYear <= 2012 ? 541 : 1250; };
  const epsValue = (m) => (basicDA(m) === 0 ? 0 : initializeEPS(m));
  const employerShare = (m) => Math.max(0, employeeShare(m) - epsValue(m));

  const totalBasic = months.reduce((s, m) => s + Math.max(0, basic[m] ?? originalBasic[m] ?? 0), 0);
  const totalDA = months.reduce((s, m) => s + Math.max(0, da[m] ?? originalDA[m] ?? 0), 0);
  const totalVPF = months.reduce((s, m) => s + safeNum(vpf[m] ?? originalVPF[m]), 0);
  const totalEmpShare = months.reduce((s, m) => s + employeeShare(m), 0);
  const totalEPS = months.reduce((s, m) => s + epsValue(m), 0);
  const totalEmployerShare = months.reduce((s, m) => s + employerShare(m), 0);

  const fetchPFData = async (id = pfNo) => {
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/pf/get-pf-by-emp/${id}`);
      if (!res.ok) {
        setEmpName(""); setDepartment("");
        setBasic({}); setDa({}); setVpf({}); setEps({});
        setOriginalBasic({}); setOriginalDA({}); setOriginalVPF({}); setOriginalEPS({});
        toast.error("No data found ❌"); return;
      }
      const result = await res.json();
      if (!result || result.length === 0) {
        setEmpName(""); setDepartment("");
        setBasic({}); setDa({}); setVpf({}); setEps({});
        setOriginalBasic({}); setOriginalDA({}); setOriginalVPF({}); setOriginalEPS({});
        toast.error("No data found ❌"); return;
      }
      setEmpName(result[0].name || "");
      setDepartment(result[0].department || "");
       if (result[0].year) setYear(result[0].year);
      let nb = {}, nd = {}, nv = {}, ne = {};
      result.forEach(row => { nb[row.month] = row.basic; nd[row.month] = row.da; nv[row.month] = row.vpf; ne[row.month] = row.eps; });
      setOriginalBasic(nb); setOriginalDA(nd); setOriginalVPF(nv); setOriginalEPS(ne);
      setBasic(nb); setDa(nd); setVpf(nv); setEps(ne);
      toast.success("Data fetched ✅");
    } catch {
      setEmpName(""); setDepartment("");
      setBasic({}); setDa({}); setVpf({}); setEps({});
      setOriginalBasic({}); setOriginalDA({}); setOriginalVPF({}); setOriginalEPS({});
      toast.error("No data found ❌");
    }
  };

  const saveSessionData = () => {
    sessionStorage.setItem("pfData", JSON.stringify({ basic, da, vpf, eps, empName, department, pfNo }));
  };

  const saveToDB = async () => {
    if (!empName.trim() || !department.trim() || !pfNo.trim()) { toast.error("Fill all Employee Details ❌"); return; }
    const hasData = months.some(m => Number(basic[m] ?? 0) > 0);
    if (!hasData) { toast.error("Enter at least one month Basic ❌"); return; }
    const data = months.map((m, index) => ({
      month: m, month_order: index + 1, year: getFiscalYear(m),
      basic: basic[m] ?? 0, da: da[m] ?? 0, vpf: vpf[m] ?? 0,
      employee_share: employeeShare(m), employer_share: employerShare(m), eps: epsValue(m)
    }));
    try {
      const res = await fetch(`${BASE_URL}/auth/save-pf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empName, department, pfNo, created_by: user?.userid, data })
      });
      const msg = await res.text();
      toast.success(msg);
    } catch { toast.error("Error saving ❌"); }
  };

  const downloadPDF = () => {
    if (!empName || !department || !pfNo) { toast.error("Fill all Employee Details ❌"); return; }
    const pdf = new jsPDF();
    pdf.addImage(logo, "PNG", 10, 10, 20, 15);
    pdf.setFontSize(13); pdf.setFont("helvetica", "bold");
    pdf.text("NMDC EMPLOYEES PROVIDENT FUND TRUST", 105, 15, { align: "center" });
    pdf.text("Unit : KIRANDUL COMPLEX", 105, 21, { align: "center" });
    pdf.text(`PF STATEMENT FOR THE PERIOD APRIL ${year} TO MARCH ${year + 1}`, 105, 27, { align: "center" });
    pdf.setFontSize(11); pdf.setFont("helvetica", "normal");
    pdf.text(`Employee Name : ${empName}`, 15, 40);
    pdf.text(`Department : ${department}`, 90, 40);
    pdf.text(`PF Number : ${pfNo}`, 15, 50);
    const tableData = months.map(m => [m, basic[m] ?? 0, da[m] ?? 0, basicDA(m), vpf[m] ?? 0, employeeShare(m), epsValue(m), employerShare(m)]);
    tableData.push(["Total", totalBasic, totalDA, totalBasic + totalDA, totalVPF, totalEmpShare, totalEPS, totalEmployerShare]);
    autoTable(pdf, {
      head: [["Month","Basic","DA","Basic+DA","VPF","Employee Share","EPS","Employer Share"]],
      body: tableData, startY: 65, theme: "grid",
      headStyles: { fillColor: [0,0,0], textColor: [255,255,255], fontStyle: "bold", halign: "center" },
      didParseCell: (data) => { if (data.row.index === tableData.length - 1) { data.cell.styles.fillColor = [173,216,230]; data.cell.styles.fontStyle = "bold"; } }
    });
    pdf.save("pf-statement.pdf");
  };

  const isFinance = localStorage.getItem("role") === "admin";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
 {/* HEADER */}
<div className="bg-gray-900 text-white px-6 py-4">
  <div className="max-w-6xl mx-auto flex justify-between items-center">
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-widest">NMDC Employees Provident Fund Trust</p>
      <h1 className="text-lg font-bold mt-0.5">Unit : Kirandul Complex</h1>
    </div>
    <div className="flex items-center gap-3">
      {isFinance && (
        <button
          onClick={() => navigate("/view")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
        >
          View Data
        </button>
      )}
      <button
        onClick={() => navigate("/da_m")}
        className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
      >
        DA Page →
      </button>
     <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 active:scale-95 transition-all duration-150"
        >
          <span className="text-base leading-none">+</span>
          New Register
        </button>
      <button
        onClick={() => {
          setUser(null);
          localStorage.clear();
          sessionStorage.clear();
          navigate("/login");
        }}
        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  </div>
</div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* YEAR + TITLE */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-700">
            PF Statement — April {year} to March {year + 1}
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Year</label>
            <select
              className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}-{String(y + 1).slice(2)}</option>)}
            </select>
          </div>
        </div>

        {/* EMPLOYEE DETAILS CARD */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Employee Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Employee Name</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={empName}
                placeholder="Enter name"
                onChange={e => setEmpName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Department</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={department}
                placeholder="Enter department"
                onChange={e => setDepartment(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">PF Number</label>
              <div className="flex gap-2">
                <input
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  value={pfNo}
                  placeholder="Enter PF No."
                  onChange={e => setPfNo(e.target.value)}
                />
                <button
                  onClick={() => fetchPFData()}
                  className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition whitespace-nowrap"
                >
                  Fetch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PF TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-3 py-3">Month</th>
                  <th className="px-3 py-3">Basic</th>
                  <th className="px-3 py-3">DA</th>
                  <th className="px-3 py-3">Basic+DA</th>
                  <th className="px-3 py-3">VPF</th>
                  <th className="px-3 py-3">Employee Share</th>
                  <th className="px-3 py-3">EPS</th>
                  <th className="px-3 py-3">Employer Share</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m, i) => (
                  <tr key={m} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 font-medium text-gray-700">{m}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={basic[m] ?? ""}
                        onChange={e => setBasic({ ...basic, [m]: Number(e.target.value) })}
                        className="w-24 border border-gray-200 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-600">{clean(da[m])}</td>
                    <td className="px-3 py-2 font-medium">{basicDA(m) || ""}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={vpf[m] ?? ""}
                        onChange={e => setVpf({ ...vpf, [m]: safeNum(e.target.value) })}
                        className="w-20 border border-gray-200 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2">{employeeShare(m) || ""}</td>
                    <td className="px-3 py-2">{epsValue(m) || ""}</td>
                    <td className="px-3 py-2">{employerShare(m) || ""}</td>
                  </tr>
                ))}
                {/* TOTAL ROW */}
                <tr className="bg-blue-50 font-bold text-gray-800 border-t-2 border-blue-200">
                  <td className="px-3 py-3">Total</td>
                  <td className="px-3 py-3">{clean(totalBasic)}</td>
                  <td className="px-3 py-3">{clean(totalDA)}</td>
                  <td className="px-3 py-3">{totalBasic + totalDA || ""}</td>
                  <td className="px-3 py-3">{clean(totalVPF)}</td>
                  <td className="px-3 py-3">{totalEmpShare || ""}</td>
                  <td className="px-3 py-3">{totalEPS || ""}</td>
                  <td className="px-3 py-3">{totalEmployerShare || ""}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 justify-end">
          {isFinance && (
            <button
              onClick={saveToDB}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              Save
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            Download PDF
          </button>
        </div>

      </div>

      <ToastContainer />
    </div>
  );
}

export default PFStatement;