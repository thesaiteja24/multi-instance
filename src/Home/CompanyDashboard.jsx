import React, { useState } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import './CompanyDashboard.css';
export default function CompanyDashboard({ companiesData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const companiesPerPage = 5;

  const handleChange = (event, value) => {
    setPage(value);
  };

  const filterCompanies = query => {
    return Object.entries(companiesData).filter(([company]) =>
      company.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  const indexOfLastCompany = page * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filterCompanies(searchQuery).slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );
  const totalCompanies = filterCompanies(searchQuery).length;
  const totalPages = Math.ceil(totalCompanies / companiesPerPage);

  return (
    <div className="company-dashbaord">
      {/* Search field */}
      <h2 className="success">Corporate Success Stories</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search companies..."
        className="company-search-bar"
      />
      {/* Display table */}
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th className="students-placed">Students Placed</th>
          </tr>
        </thead>
        <tbody>
          {currentCompanies.map(([company, studentsPlaced]) => (
            <tr key={company}>
              <td>{company}</td>
              <td>{studentsPlaced}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="pagination">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChange}
            variant="outlined"
            shape="rounded"
          />
        </Stack>
      </div>
    </div>
  );
}
