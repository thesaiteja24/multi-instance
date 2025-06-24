import React, { useState } from 'react';
import './ExamsDetailsManager.css'; // Optional: For custom scrollbar

const AppliedJobsManager = ({ data, gender }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const getPronounMessage = g => {
    const lower = g?.toLowerCase();
    if (lower === 'male') return "He hasn't applied to any jobs yet.";
    if (lower === 'female') return "She hasn't applied to any jobs yet.";
    return "They haven't applied to any jobs yet.";
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-3">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No Jobs"
          className="w-28 h-28 mb-4 opacity-70"
        />
        <p className="text-xl font-semibold text-gray-600 mb-1">
          {gender ? getPronounMessage(gender) : 'No Applied Jobs Yet'}
        </p>
        {!gender && (
          <p className="text-gray-500 text-sm">
            Search for a student to view their applied job details.
          </p>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = data.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = pageNumber => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="w-full flex flex-col items-center font-[inter] max-h-[70vh] py-5 px-3 md:px-4 ">
      <div className="w-full max-w-[1580px] bg-white shadow-[0px_4px_20px_#B3BAF7]  overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:flex bg-[var(--color-secondary)] text-white font-semibold text-[16px] justify-between px-6 py-3">
          <p className="flex-1 min-w-[120px]">Company Name</p>
          <p className="flex-1 min-w-[120px]">Job Role</p>
          <p className="flex-1 min-w-[120px]">Salary</p>
          <p className="flex-1 min-w-[120px]">Location</p>
          <p className="flex-1 min-w-[120px]">Deadline</p>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[515px] overflow-y-auto custom-scrollbar">
          {currentJobs.map((job, index) => (
            <div
              key={job._id}
              className={`text-black text-[16px] px-6 py-3 flex-wrap md:flex-nowrap md:flex justify-between ${
                index % 2 === 0 ? 'bg-[#EFF0F7]' : 'bg-white'
              }`}
            >
              {/* Mobile View */}
              <div className="block md:hidden space-y-2 w-full p-2">
                <div>
                  <span className="font-semibold">Company:</span>{' '}
                  {job.companyName}
                </div>
                <div>
                  <span className="font-semibold">Role:</span> {job.jobRole}
                </div>
                <div>
                  <span className="font-semibold">Salary:</span> {job.salary}{' '}
                  LPA
                </div>
                <div>
                  <span className="font-semibold">Location:</span>{' '}
                  {job.jobLocation}
                </div>
                <div>
                  <span className="font-semibold">Deadline:</span>{' '}
                  {new Date(job.deadLine).toLocaleString()}
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:flex flex-1 min-w-[120px] break-words">
                {job.companyName}
              </div>
              <div className="hidden md:flex flex-1 min-w-[120px] break-words">
                {job.jobRole}
              </div>
              <div className="hidden md:flex flex-1 min-w-[120px]">
                {job.salary} LPA
              </div>
              <div className="hidden md:flex flex-1 min-w-[120px] break-words">
                {job.jobLocation}
              </div>
              <div className="hidden md:flex flex-1 min-w-[120px]">
                {new Date(job.deadLine).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="w-full flex justify-end max-w-full mt-1 px-4">
          <div className="text-black font-medium text-[16px] font-['Inter'] tracking-[4px] leading-[70px] space-x-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${
                currentPage === 1
                  ? 'text-black font-semibold cursor-not-allowed'
                  : 'hover:text-[#0C1BAA]'
              }`}
            >
              {'< '}Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`${
                  currentPage === page
                    ? 'text-black font-semibold'
                    : 'hover:text-[#0C1BAA]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'hover:text-[#0C1BAA]'
              }`}
            >
              Next {'>'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppliedJobsManager;
