import React from 'react';

const CopyrightSections = () => {
  return (
    <div className="bg-[#f9f9f9] text-[#020031] text-center mt-24 -mb-2  py-2 px-5  font-bold text-[14px] lg:text-[20px]">
      <p className="mb-1 text-[14px] lg:text-[18px]">
        © Copyright 2018-{new Date().getFullYear()} | Codegnan IT Solutions PVT
        LTD
      </p>
      <p className="space-x-2">
        <a
          href="https://codegnan.com/privacy-policy/"
          className="hover:underline"
        >
          Privacy Policy
        </a>
        |
        <a
          href="https://codegnan.com/terms-conditions/"
          className="hover:underline"
        >
          Terms and Conditions
        </a>
        |
        <a
          href="https://codegnan.com/refund-policy/"
          className="hover:underline"
        >
          Refund Policy
        </a>
        |
        <a
          href="https://codegnan.com/cancellation-policy/"
          className="hover:underline"
        >
          Cancellation Policy
        </a>
      </p>
    </div>
  );
};

export default CopyrightSections;
