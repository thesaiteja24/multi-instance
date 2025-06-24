import React from 'react';
import './InfoBanner.css'; // Import the CSS file

const InfoBanner = () => {
  return (
    <div className="info-banner-container">
      <div className="info-card">
        <h2 className="info-heading">800+ Companies</h2>
        <p className="info-subtext">Hiring Codegnan Learners</p>
      </div>
      <div className="info-card">
        <h2 className="info-heading">₹ 27 LPA</h2>
        <p className="info-subtext">Highest Package</p>
      </div>
      <div className="info-card">
        <h2 className="info-heading">450+</h2>
        <p className="info-subtext"> Colleges Across India</p>
      </div>
    </div>
  );
};

export default InfoBanner;
