import React, { useState, useMemo } from "react";

// 🔦 Highlight search matches
function highlight(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={idx}>{part}</mark>
    ) : (
      part
    )
  );
}

export default function SearchTable({ data, search, rowsPerPage }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  // 🔀 Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key && sortConfig.key !== 0) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  const handleSort = (colIndex) => {
    let direction = "asc";
    if (sortConfig.key === colIndex && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: colIndex, direction });
  };

  // 📄 Pagination logic
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  if (!data || data.length === 0) {
    return <p className="text-center text-muted">No results found.</p>;
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle shadow">
          <thead className="table-dark">
            <tr>
              {[
                "Name",
                "Contract Signed",
                "DOA",
                "BI Limits",
                "UM",
                "Status",
                "Settlement",
                "Attorney’s Fee",
              ].map((header, idx) => (
                <th
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort(idx)}
                >
                  {header}{" "}
                  {sortConfig.key === idx &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>
                    {highlight(cell?.toString() || "", search)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ◀ Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
