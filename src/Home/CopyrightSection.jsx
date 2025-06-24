import React from 'react';
import './CopyrightSection.css'; // Create a separate CSS file for styling

function CopyrightSection() {
  return (
    <div className="copyright-section">
      <p>
        © Copyright 2018-{new Date().getFullYear()} | Codegnan IT Solutions PVT
        LTD
      </p>
      <p>
        <a
          href="https://codegnan.com/privacy-policy/"
          className="copyright-link"
        >
          Privacy Policy
        </a>{' '}
        |
        <a
          href="https://codegnan.com/terms-conditions/"
          className="copyright-link"
        >
          Terms and Conditions
        </a>{' '}
        |
        <a
          href="https://codegnan.com/refund-policy/"
          className="copyright-link"
        >
          Refund Policy
        </a>{' '}
        |
        <a
          href="https://codegnan.com/cancellation-policy/"
          className="copyright-link"
        >
          Cancellation Policy
        </a>
      </p>
    </div>
  );
}

export default CopyrightSection;
