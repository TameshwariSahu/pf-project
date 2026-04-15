import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../components/nmdc.png";
import { BASE_URL } from "../config";

function UserView() {
  const [pfNo, setPfNo] = useState("");
  const [records, setRecords] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pf/get-pf-by-emp/${pfNo}`);
      const data = await res.json();
      setRecords(data);
    } catch {
      alert("No data found ❌");
    }
  };
const downloadPDF = () => {
  const pdf = new jsPDF();

  if (records.length === 0) {
    alert("No data ❌");
    return;
  }

  const name = records[0].name;
  const pfNumber = pfNo;

  // 🧾 Logo + Heading
  pdf.addImage(logo, "PNG", 10, 10, 20, 15);

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text("NMDC EMPLOYEES PROVIDENT FUND TRUST", 105, 15, { align: "center" });
  pdf.text("Unit : KIRANDUL COMPLEX", 105, 21, { align: "center" });

  pdf.text(
    `PF STATEMENT`,
    105,
    27,
    { align: "center" }
  );

  // 👤 Employee Details
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Employee Name : ${name}`, 15, 40);
  pdf.text(`PF Number : ${pfNumber}`, 15, 48);

  //  Table Data
  const tableData = records.map((r) => [
    r.month,
    r.year,
    r.basic,
    r.da,
    r.vpf,
    r.employee_share,
    r.employer_share
  ]);

  //  Totals
  const totalBasic = records.reduce((s, r) => s + Number(r.basic || 0), 0);
  const totalDA = records.reduce((s, r) => s + Number(r.da || 0), 0);
  const totalVPF = records.reduce((s, r) => s + Number(r.vpf || 0), 0);
  const totalEmpShare = records.reduce((s, r) => s + Number(r.employee_share || 0), 0);
  const totalEmployerShare = records.reduce((s, r) => s + Number(r.employer_share || 0), 0);

  tableData.push([
    "Total",
    "",
    totalBasic,
    totalDA,
    totalVPF,
    totalEmpShare,
    totalEmployerShare
  ]);

  //  Table
  autoTable(pdf, {
    head: [["Month", "Year", "Basic", "DA","VPF", "Emp Share", "Employer Share"]],
    body: tableData,
    startY: 60,
    theme: "grid",

    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center"
    },

    didParseCell: function (data) {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fillColor = [173, 216, 230];
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  pdf.save(`PF_${pfNumber}.pdf`);
};

  const totalBasic = records.reduce((s, r) => s + Number(r.basic || 0), 0);
  const totalDA = records.reduce((s, r) => s + Number(r.da || 0), 0);
  const totalVPF = records.reduce(
  (s, r) => s + Number(r.vpf || 0),
  0
);
  const totalEmpShare = records.reduce(
    (s, r) => s + Number(r.employee_share || 0),
    0
  );
  const totalEmployerShare = records.reduce(
    (s, r) => s + Number(r.employer_share || 0),
    0
  );

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4 text-center">
        Employee PF View
      </h2>

      {/* 🔍 Input */}
      <div className="mb-4 text-center">
        <input
          type="text"
          placeholder="Enter Employee PF No"
          value={pfNo}
          onChange={(e) => setPfNo(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Fetch
        </button>
      </div>

      {/* Table */}
      {records.length > 0 && (
        <table className="border w-full text-center">
          <thead className="bg-black text-white">
            <tr>
              <th className="border p-2">Month</th>
              <th className="border p-2">Year</th>
              <th className="border p-2">Basic</th>
              <th className="border p-2">DA</th>
              <th className="border p-2">VPF</th>
              <th className="border p-2">Emp Share</th>
              <th className="border p-2">Employer Share</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td className="border p-1">{r.month}</td>
                <td className="border p-1">{r.year}</td>
                <td className="border p-1">{r.basic}</td>
                <td className="border p-1">{r.da}</td>
                <td className="border p-1">{r.vpf}</td>
                <td className="border p-1">{r.employee_share}</td>
                <td className="border p-1">{r.employer_share}</td>
              </tr>
            ))}

            {/* TOTAL ROW */}
            <tr className="bg-gray-200 font-bold">
              <td className="border p-2">Total</td>
              <td className="border p-2"></td>
              <td className="border p-2">{totalBasic}</td>
              <td className="border p-2">{totalDA}</td>
              <td className="border p-2">{totalVPF}</td>
              <td className="border p-2">{totalEmpShare}</td>
              <td className="border p-2">{totalEmployerShare}</td>
            </tr>
          </tbody>
          {records.length > 0 && (
            <>
          <button
                onClick={downloadPDF}
                className="bg-green-600 text-white px-4 py-2 mb-4">
        Download PDF
        </button>
            </>
          )}
        </table>
      )}
      
    </div>
  );
}

export default UserView;