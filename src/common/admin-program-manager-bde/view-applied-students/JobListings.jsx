import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../../../reducers/Jobsslice.js';
import { ADMIN, BDE, SUPER_ADMIN } from '../../../constants/AppConstants.js';

const JobListings = () => {
  const { userInfo } = useSelector(state => state.auth);
  const { userType } = userInfo;
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector(state => state.jobs);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const jobsPerPage = 8; // Display 8 jobs per page for a 4x2 grid on large screens

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when jobs data changes
  }, [jobs]);

  const handleView = jobId => {
    if (userType === SUPER_ADMIN || userType === ADMIN) {
      navigate(`/admin/job-listings/${jobId}`);
    } else if (userType === BDE) {
      navigate(`/bde/job-listings/${jobId}`);
    }
  };

  // Pagination logic
  const indexOfLastJob = page * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageChange = pageNumber => {
    setPage(pageNumber);
  };

  const getPaginationItems = () => {
    const items = [];
    const isMobile = window.innerWidth < 640;
    const maxPagesToShow = isMobile ? 2 : 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const offset = isMobile ? 1 : 2;
      const leftBound = Math.max(1, page - offset);
      const rightBound = Math.min(totalPages, page + offset);

      if (leftBound > 1) {
        items.push(1);
        if (leftBound > 2) items.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        items.push(i);
      }

      if (rightBound < totalPages) {
        if (rightBound < totalPages - 1) items.push('...');
        items.push(totalPages);
      }
    }
    return items;
  };

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center font-['Inter']">
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-4 border-[#19216F] border-solid rounded-full animate-[spin_1s_linear_infinite]"></div>
          <p className="text-lg font-semibold text-[#19216F] font-['Inter']">
            Loading Jobs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center font-['Inter']">
        <p className="text-lg font-semibold text-red-600 font-['Inter']">
          Error: {error}
        </p>
        <button
          onClick={() => dispatch(fetchJobs())}
          className="mt-4 bg-[#19216F] text-white px-4 py-2 rounded-md font-semibold font-['Inter'] hover:bg-[#0f1a5b]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 font-['Inter'] max-w-[1280px] mx-auto">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#19216F] text-center">
        Manage Jobs Dashboard
      </h2>

      {jobs.length === 0 ? (
        <div className="w-full flex justify-center mt-10">
          <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-6 max-w-[600px] text-center font-['Inter']">
            <h2 className="text-xl font-semibold text-[#19216F] mb-2">
              No Jobs Found
            </h2>
            <p className="text-gray-600 text-[16px]">
              Sorry, there are no jobs available at the moment.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 pt-6 justify-items-center">
            {currentJobs.map(job => (
              <div
                key={job.job_id}
                className="w-full max-w-[360px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="p-2">
                    <h2 className="text-[1.5rem] font-semibold text-[#252B37] truncate">
                      {job.jobRole || 'N/A'}
                    </h2>
                    <span className="text-base text-[#535862] font-medium">
                      {job.companyName || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[1.25rem] text-[#414651] my-2">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M10.8398 17.9133C10.8398 19.5258 12.0773 20.8258 13.6148 20.8258H16.7523C18.0898 20.8258 19.1773 19.6883 19.1773 18.2883C19.1773 16.7633 18.5148 16.2258 17.5273 15.8758L12.4898 14.1258C11.665 13.6458 10.8398 13.2383 10.8398 11.7133C10.8398 10.3133 11.9273 9.17578 13.2648 9.17578H16.4023C17.9447 9.17578 19.1773 10.4758H16"
                        stroke="#414651"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 7.5V22.5"
                        stroke="#414651"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.75 27.5H11.25C5 27.5 2.5 25 2.5 18.75V11.25C2.5 5 5 2.5 11.25 2.5H18.75C25 2.5 27.5 5 27.5 11.25V18.75C27.5 25 25 27.5 18.75 27.5Z"
                        stroke="#414651"
                        strokeWidth="1.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>
                      {job.salary?.includes('LPA')
                        ? job.salary
                        : `${job.salary} LPA` || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[1.25rem] text-[#414651] my-2">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M15.0016 16.7863C17.1555 16.7863 18.9016 15.0402 18.9016 12.8863C18.9016 10.7324 17.1555 8.98633 15.0016 8.98633C12.8477 8.98633 11.1016 10.7324 11.1016 12.8863C11.1016 15.0402 12.8477 16.7863 15.0016 16.7863Z"
                        stroke="#414651"
                        strokeWidth="1.875"
                      />
                      <path
                        d="M4.52415 10.6125C6.98665 -0.212497 23.0241 -0.199997 25.4741 10.625C26.9116 16.975 22.9616 22.35 19.4991 25.675C16.9866 28.1 13.0116 28.1 10.4866 25.675C7.03665 22.35 3.08665 16.9625 4.52415 10.6125Z"
                        stroke="#414651"
                        strokeWidth="1.875"
                      />
                    </svg>
                    <span className="truncate">{job.jobLocation || 'N/A'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 p-2 max-h-24 overflow-y-auto">
                    {job.technologies?.slice(0, 3).map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-[#E7E9FE] text-[#19216F] font-medium text-base rounded-full"
                      >
                        <span className="text-sm">•</span>
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => handleView(job.job_id)}
                    className="w-full bg-[#19216F] text-white px-4 py-3 rounded-lg text-base font-medium text-center hover:bg-[#0f1a5b] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalJobs > jobsPerPage && (
            <div className="mt-6 w-full overflow-x-auto py-3">
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 max-w-[95%] mx-auto sm:max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={handlePrevPage}
                  className={`min-w-[64px] px-3 py-2 text-base font-medium rounded-md shadow-sm transition-all ${page === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-[#0C1BAA] bg-white hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5'}`}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  Prev
                </button>
                {getPaginationItems().map((item, index) => (
                  <button
                    key={`page-${index}`}
                    onClick={() =>
                      typeof item === 'number' && handlePageChange(item)
                    }
                    className={`min-w-[40px] px-3 py-2 text-base font-medium rounded-md shadow-sm transition-all ${typeof item === 'number' && page === item ? 'text-white bg-[#0C1BAA] shadow-md' : typeof item === 'number' ? 'text-[#0C1BAA] bg-white hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5' : 'text-gray-400 cursor-default bg-white'}`}
                    disabled={typeof item !== 'number'}
                    aria-label={
                      typeof item === 'number' ? `Page ${item}` : 'Ellipsis'
                    }
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  className={`min-w-[64px] px-3 py-2 text-base font-medium rounded-md shadow-sm transition-all ${page === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-[#0C1BAA] bg-white hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5'}`}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobListings;
