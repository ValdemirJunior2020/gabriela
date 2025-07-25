import React, { useState, useEffect } from 'react';
import SearchTable from './components/SearchTable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CSVLink } from 'react-csv';

const SPREADSHEET_ID = '1MEQy5QU1lUKyJBj8BvJh3a_VXLojPObKNDOCMCMoDw0';
const RANGE = 'Página1!A:H';
const API_KEY = 'AIzaSyDxtFsynX7MLaTCJD64tzIqSk8XDm3s9l8';

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // NEW: rows per page and theme
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [darkMode, setDarkMode] = useState(false);

  // NEW: columns to export
  const allColumns = [
    'Name',
    'Contract Signed',
    'DOA',
    'BI Limits',
    'UM',
    'Status',
    'Settlement',
    'Attorney’s Fee'
  ];
  const [selectedColumns, setSelectedColumns] = useState(allColumns);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
            RANGE
          )}?key=${API_KEY}`
        );
        const json = await res.json();
        if (json.values) {
          setData(json.values.slice(1)); // skip header
        }
      } catch (error) {
        console.error('Error fetching sheet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = data.filter((row) =>
    row[0]?.toLowerCase().includes(search.toLowerCase())
  );

  // Build export data with selected columns
  const indices = selectedColumns.map(col => allColumns.indexOf(col));
  const headers = selectedColumns;
  const filteredExport = filtered.map(row => indices.map(i => row[i] || ''));

  const csvData = [headers, ...filteredExport];
  const today = new Date().toISOString().split('T')[0];

  // Export to Excel
  const handleExportExcel = () => {
    const worksheetData = [headers, ...filteredExport];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `export-${today}.xlsx`);
  };

  const toggleColumn = (col) => {
    setSelectedColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className={darkMode ? 'bg-dark text-light min-vh-100' : 'bg-light min-vh-100'}>
      <div className="container pt-4">
        <h1 className="mb-4 text-center fw-bold">
          🔎 Gabi Name Search 
        </h1>

        {/* Search box */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Type a name to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Controls row */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          {/* Rows per page */}
          <div>
            <label className="me-2">Rows per page:</label>
            <select
              className="form-select d-inline-block w-auto"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Theme toggle */}
          <button
            className={`btn ${darkMode ? 'btn-light' : 'btn-dark'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Column checkboxes */}
        <div className="mb-3">
          <label className="fw-bold me-2">Columns to export:</label>
          {allColumns.map((col) => (
            <div key={col} className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id={col}
                checked={selectedColumns.includes(col)}
                onChange={() => toggleColumn(col)}
              />
              <label className="form-check-label" htmlFor={col}>{col}</label>
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="d-flex justify-content-end mb-3 gap-2">
          <button className="btn btn-success" onClick={handleExportExcel}>
            📥 Download Excel
          </button>
          <CSVLink
            data={csvData}
            filename={`export-${today}.csv`}
            className="btn btn-primary"
          >
            📄 Download CSV
          </CSVLink>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center">Loading data…</p>
        ) : (
          <SearchTable data={filtered} search={search} rowsPerPage={rowsPerPage} />
        )}
      </div>
    </div>
  );
}

export default App;
