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
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchData = async (page = 1, searchVal = search) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/pf/get-pf?page=${page}&limit=10&search=${searchVal}`
      );
      if (!res.ok) throw new Error("Server error");
      const json = await res.json();
      setRecords(json.data);
      setTotalPages(json.totalPages);
      setCurrentPage(json.currentPage);
      setTotal(json.total);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch data ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  // ✅ Debounce — 500ms baad search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const grouped = records.reduce((acc, r) => {
    const key = `${r.name}__${r.pf_no}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthOrderMap[a.month] - monthOrderMap[b.month];
    });
  });

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTotals = (rows) => ({
    basic: rows.reduce((s, r) => s + Number(r.basic || 0), 0),
    da: rows.reduce((s, r) => s + Number(r.da || 0), 0),
    vpf: rows.reduce((s, r) => s + Number(r.vpf || 0), 0),
    emp: rows.reduce((s, r) => s + Number(r.employee_share || 0), 0),
    employer: rows.reduce((s, r) => s + Number(r.employer_share || 0), 0),
  });

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-red-500 font-semibold">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PF Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total employee{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => navigate("/form")}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
        >
          ⬅ Back
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍  Search by name or PF No..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium">Loading records...</p>
          </div>
        </div>
      ) : (
        <>
          {/* EMPLOYEE CARDS */}
          <div className="space-y-4">
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium">No employees found</p>
              </div>
            ) : (
              Object.entries(grouped).map(([key, rows]) => {
                const [name] = key.split("__");
                const totals = getTotals(rows);
                const isOpen = expanded[key];

                return (
                  <div key={key} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                    {/* CARD HEADER */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => toggleExpand(key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {name} <span className="text-gray-400 font-normal text-sm">({rows[0]?.pf_no || "—"})</span>
                          </p>
                          <p className="text-xs text-gray-400">{rows.length} months · Dept: {rows[0]?.department || "—"}</p>

                         <span className="text-xs text-gray-600 mt-1">
                          {rows[0]?.category || "Worker"}
                        </span>
                      </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex gap-6 text-xs">
                          <div className="text-right">
                            <p className="text-gray-400">Total Basic</p>
                            <p className="font-semibold text-gray-800">{totals.basic.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400">Total DA</p>
                            <p className="font-semibold text-gray-800">{totals.da.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400">Emp Share</p>
                            <p className="font-semibold text-gray-800">{totals.emp.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-lg">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* EXPANDABLE TABLE */}
                    {isOpen && (
                      <div className="overflow-x-auto border-t border-gray-100">
                        <table className="w-full text-sm text-center">
                          <thead className="bg-gray-900 text-white">
                            <tr>
                              <th className="px-3 py-2">Month</th>
                              <th className="px-3 py-2">Year</th>
                              <th className="px-3 py-2">Basic</th>
                              <th className="px-3 py-2">DA</th>
                              <th className="px-3 py-2">VPF</th>
                              <th className="px-3 py-2">Emp Share</th>
                              <th className="px-3 py-2">Employer Share</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r, i) => (
                              <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-3 py-2 font-medium">{r.month}</td>
                                <td className="px-3 py-2 text-gray-500">{r.year}</td>
                                <td className="px-3 py-2">{Number(r.basic).toLocaleString()}</td>
                                <td className="px-3 py-2">{Number(r.da).toLocaleString()}</td>
                                <td className="px-3 py-2">{Number(r.vpf).toLocaleString()}</td>
                                <td className="px-3 py-2">{Number(r.employee_share).toLocaleString()}</td>
                                <td className="px-3 py-2">{Number(r.employer_share).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="bg-blue-50 font-bold text-gray-800 border-t border-blue-200">
                              <td className="px-3 py-2" colSpan={2}>Total</td>
                              <td className="px-3 py-2">{totals.basic.toLocaleString()}</td>
                              <td className="px-3 py-2">{totals.da.toLocaleString()}</td>
                              <td className="px-3 py-2">{totals.vpf.toLocaleString()}</td>
                              <td className="px-3 py-2">{totals.emp.toLocaleString()}</td>
                              <td className="px-3 py-2">{totals.employer.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => fetchData(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 transition"
              >
                ← Prev
              </button>
              <span className="text-gray-600 font-medium text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchData(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ViewData;