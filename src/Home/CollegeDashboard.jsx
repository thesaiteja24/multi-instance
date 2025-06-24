import React, { useState } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import './CollegeDashboard.css';

export default function CollegeDashboard({ collegesList }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const collegesPerPage = 5;

  const handleChange = (event, value) => {
    setPage(value);
  };

  const filterColleges = query => {
    return Object.entries(collegesList).filter(([college]) =>
      college.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSearchChange = event => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page to 1 when search query changes
  };

  const indexOfLastCollege = page * collegesPerPage;
  const indexOfFirstCollege = indexOfLastCollege - collegesPerPage;
  const currentColleges = filterColleges(searchQuery).slice(
    indexOfFirstCollege,
    indexOfLastCollege
  );
  const totalColleges = filterColleges(searchQuery).length;
  const totalPages = Math.ceil(totalColleges / collegesPerPage);

  return (
    <div className="college-dashboard">
      <h2 className="success">College List Dashboard</h2>
      {/* Search bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search colleges..."
        className="company-search-bar"
      />
      {/* College list */}
      <table cellSpacing="4px">
        <thead>
          <tr>
            <th>College Name</th>
            <th className="students-placed">Students Placed</th>
          </tr>
        </thead>
        <tbody>
          {currentColleges.map(([college, count]) => (
            <tr key={college} className="college-item">
              <td className="college-name">{college}</td>
              <td className="college-count">{count}</td>
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
