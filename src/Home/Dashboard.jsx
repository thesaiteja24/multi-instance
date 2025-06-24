import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Dashboard.css';

export default function Dashboard() {
  const { dashboardData, loading, error } = useSelector(
    state => state.dashboard
  );
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [companyPage, setCompanyPage] = useState(1);
  const [collegePage, setCollegePage] = useState(1);

  const companiesPerPage = 5;
  const collegesPerPage = 5;

  if (loading) return null;
  if (error) return null;

  const { companiesList = {}, collegesList = {} } = dashboardData || {};

  const filterCompanies = query =>
    Object.entries(companiesList).filter(([company]) =>
      company.toLowerCase().includes(query.toLowerCase())
    );

  const filterColleges = query =>
    Object.entries(collegesList).filter(([college]) =>
      college.toLowerCase().includes(query.toLowerCase())
    );

  const currentCompanies = filterCompanies(companySearchQuery).slice(
    (companyPage - 1) * companiesPerPage,
    companyPage * companiesPerPage
  );

  const currentColleges = filterColleges(collegeSearchQuery).slice(
    (collegePage - 1) * collegesPerPage,
    collegePage * collegesPerPage
  );

  const renderPagination = (currentPage, totalPages, setPage) => {
    const visiblePages = [];
    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      visiblePages.push(i);
    }

    return (
      <div className="custom-pagination">
        <button
          className={`prev-next ${currentPage === 1 ? 'disabled' : ''}`}
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          &lt; <span className="prev-next_1">Prev</span>
        </button>

        <button
          className={`page-number ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setPage(1)}
        >
          1
        </button>

        {visiblePages[0] > 2 && <span className="dots">.....</span>}

        {visiblePages.map(
          page =>
            page !== 1 &&
            page !== totalPages && (
              <button
                key={page}
                className={`page-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => setPage(page)}
              >
                {page}
              </button>
            )
        )}

        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
          <span className="dots">.....</span>
        )}

        <button
          className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </button>

        <button
          className={`prev-next ${currentPage === totalPages ? 'disabled' : ''}`}
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          <span className="prev-next_1">Next</span> &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard bg-white">
      <h1 className="dashboard-title">
        Our Students <span>Success Stories</span>
      </h1>

      <div className="dashboard-content">
        {/* Companies Section */}
        <div className="card-wrapper">
          <input
            className="search-bar"
            type="text"
            placeholder="Search Company Name..."
            value={companySearchQuery}
            onChange={e => setCompanySearchQuery(e.target.value)}
          />
          <div className="section">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Students Placed</th>
                </tr>
              </thead>
              <tbody>
                {currentCompanies.map(([company, count]) => (
                  <tr key={company}>
                    <td>{company}</td>
                    <td className="dashboard-count">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(
            companyPage,
            Math.ceil(
              filterCompanies(companySearchQuery).length / companiesPerPage
            ),
            setCompanyPage
          )}
        </div>

        {/* Colleges Section */}
        <div className="card-wrapper">
          <input
            className="search-bar"
            type="text"
            placeholder="Search College Name..."
            value={collegeSearchQuery}
            onChange={e => setCollegeSearchQuery(e.target.value)}
          />
          <div className="section">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>Students Placed</th>
                </tr>
              </thead>
              <tbody>
                {currentColleges.map(([college, count]) => (
                  <tr key={college}>
                    <td>{college}</td>
                    <td className="dashboard-count">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(
            collegePage,
            Math.ceil(
              filterColleges(collegeSearchQuery).length / collegesPerPage
            ),
            setCollegePage
          )}
        </div>
      </div>
    </div>
  );
}
