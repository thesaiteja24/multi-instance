import React from 'react';
import './BranchDashboard.css';

export default function BranchDashboard({ branchList }) {
  return (
    <div className="branch-dashboard">
      <h2 className="title">Branch Dashboard</h2>
      <ul className="branch-list">
        {Object.entries(branchList).map(([branch, count]) => (
          <li key={branch} className="branch-item">
            <p className="branch-name">{branch} </p>
            <p className="branch-count">{count}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
