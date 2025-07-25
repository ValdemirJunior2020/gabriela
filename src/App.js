import React, { useState, useEffect } from 'react';
import SearchTable from './components/SearchTable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CSVLink } from 'react-csv';

const SPREADSHEET_ID = '1MEQy5QU1lUKyJBj8BvJh3a_VXLojPObKNDOCMCMoDw0';
const RANGE = 'Página1!A:H';
const API_KEY = 'AIzaSyDxtFsynX7MLaTCJD64tzIqSk8XDm3s9l8';

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [darkMode, setDarkMode] = useState(false);

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

  // 👉 CSV data
  const csvData = [allColumns, ...filtered];
  const today = new Date().toISOString().split('T')[0];

  // 👉 Export to Excel with styles
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add header row
    const headerRow = worksheet.addRow(allColumns);

    // Style the header row
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB6D7A8' } // light green background
      };
    });

    // Add data rows (using ALL data, not filtered)
    data.forEach((row) => {
      const dataRow = worksheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Set column widths
    worksheet.columns.forEach((col) => {
      col.width = 20;
      col.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Set view to left-to-right
    worksheet.views = [{ rightToLeft: false }];

    // Generate Excel and save
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      `export-${today}.xlsx`
    );
  };

  return (
    <div className={darkMode ? 'bg-dark text-light min-vh-100' : 'bg-light min-vh-100'}>
      <div className="container pt-4">
        <h1 className="mb-4 text-center fw-bold">
          🔎 Google Sheet Search
        </h1>

        {/* Search box */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Type a name to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Controls */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
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
          <button
            className={`btn ${darkMode ? 'btn-light' : 'btn-dark'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Download buttons */}
        <div className="d-flex justify-content-end mb-3 gap-2">
          <button className="btn btn-success" onClick={handleExportExcel}>
            📥 Download Excel (All Data)
          </button>
          <CSVLink
            data={csvData}
            filename={`export-${today}.csv`}
            className="btn btn-primary"
          >
            📄 Download CSV (Filtered)
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
