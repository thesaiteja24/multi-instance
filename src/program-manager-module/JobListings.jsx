import { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaSearch,
  FaChevronDown,
  FaSadTear,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../reducers/Jobsslice.js';

const JobListings = () => {
  const dispatch = useDispatch();
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
  } = useSelector(state => state.jobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    if (!jobs.length) {
      dispatch(fetchJobs());
    }
  }, [dispatch]);

  useEffect(() => {
    if (jobs.length > 0) {
      setFilteredJobs(jobs);
    }
  }, [jobs]);

  const uniqueLocations = [...new Set(jobs.map(job => job.jobLocation))];

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    let filtered = jobs;

    if (query) {
      filtered = filtered.filter(job => {
        const searchableFields = [
          job.jobRole,
          job.companyName,
          job.jobLocation,
          job.salary,
          job.educationQualification,
          ...(job.technologies || []),
          ...(job.department || []),
          ...(job.graduates || []),
          job.specialNote,
          String(job.percentage),
          String(job.bond),
        ].map(field => (field ? String(field).toLowerCase() : ''));

        return searchableFields.some(field => field.includes(query));
      });
    }

    if (selectedLocation) {
      filtered = filtered.filter(job => job.jobLocation === selectedLocation);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewJob = jobId => {
    navigate(`/program-manager/job-listings/${jobId}`);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = pageNumber => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (jobsLoading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-gray-100 font-['Inter']">
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
            Loading Job Openings...
          </p>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-gray-100 font-['Inter']">
        <p className="text-lg font-semibold text-red-600 font-['Inter']">
          Error: {jobsError}
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
    <div className="relative w-full flex flex-col items-center pt-2 px-4 mt-0 font-['Inter']">
      {/* Heading */}
      <h1 className="text-[20px] sm:text-[24px] leading-[70px] font-semibold text-[#19216F] font-['Inter'] text-center">
        Job Openings
      </h1>

      {/* Line Break */}
      <hr className="w-full max-w-full border-t border-[#9E9A9A] mt-2" />

      {/* Search + Location + Button */}
      <div className="w-full max-w-full flex flex-col gap-3 sm:gap-0 lg:flex-row items-stretch mt-6 px-4">
        {/* Search Input */}
        <div className="flex-grow w-full bg-[#EFF0F7] shadow-md rounded-l-xl px-4 py-2 h-[46px] flex items-center">
          <input
            type="text"
            placeholder="Search by role, skills, company, etc."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent outline-none text-gray-600 text-[16px] font-['Inter'] placeholder:text-[#000000]"
          />
        </div>

        {/* Location Dropdown */}
        <div className="relative w-full lg:w-[379px] h-[46px] bg-[#FFDCC9] shadow-md rounded-sm px-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer w-full"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          >
            <FaMapMarkerAlt className="text-black" />
            <span className="text-black font-semibold text-[16px] font-['Inter']">
              {selectedLocation || 'Location'}
            </span>
          </div>
          <FaChevronDown className="text-black text-sm" />
          {isLocationDropdownOpen && (
            <div className="absolute top-[46px] left-0 w-full bg-white shadow-lg z-10 max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedLocation('');
                  setIsLocationDropdownOpen(false);
                }}
              >
                All Locations
              </div>
              {uniqueLocations.map(location => (
                <div
                  key={location}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsLocationDropdownOpen(false);
                  }}
                >
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Button with text on mobile */}
        <button
          onClick={handleSearch}
          className="w-full lg:w-[60px] h-[46px] bg-[#19216F] rounded-r-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#0f1a5b]"
        >
          <FaSearch className="text-white text-[16px]" />
          <span className="text-white text-[16px] font-medium block lg:hidden">
            Search
          </span>
        </button>
      </div>

      {/* No Results Found */}
      {filteredJobs.length === 0 ? (
        <div className="w-full flex justify-center mt-10">
          <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-6 max-w-[600px] text-center">
            <FaSadTear className="text-[#19216F] text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#19216F] font-['Inter'] mb-2">
              No Jobs Found
            </h2>
            <p className="text-gray-600 text-[16px] font-['Inter']">
              Sorry, we couldn’t find any jobs matching your search. Try
              adjusting your search terms or location!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('');
                setFilteredJobs(jobs);
                setCurrentPage(1);
              }}
              className="mt-4 bg-[#19216F] text-white px-4 py-2 rounded-md font-semibold font-['Inter'] hover:bg-[#0f1a5b]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="w-full flex justify-center mt-6 p-4">
            <div className="w-full hidden md:block max-w-full bg-white shadow-[0px_4px_20px_#B3BAF7] overflow-x-auto rounded-xl">
              <table className="min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-[#19216F] text-white font-semibold text-[16px] font-['Inter']">
                    <th
                      className="px-4 py-3 text-left"
                      scope="col"
                      style={{ width: '30%' }}
                    >
                      Job Title
                    </th>
                    <th
                      className="px-4 py-3 text-left"
                      scope="col"
                      style={{ width: '25%' }}
                    >
                      Primary Skills
                    </th>
                    <th
                      className="px-4 py-3 text-left"
                      scope="col"
                      style={{ width: '10%' }}
                    >
                      Deadline
                    </th>
                    <th
                      className="px-4 py-3 text-left"
                      scope="col"
                      style={{ width: '12%' }}
                    >
                      Location
                    </th>
                    <th
                      className="px-4 py-3 text-left"
                      scope="col"
                      style={{ width: '10%' }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-3 text-center"
                      scope="col"
                      style={{ width: '13%' }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map((job, index) => {
                    const status = job.isActive ? 'Active' : 'Timeout';
                    return (
                      <tr
                        key={job.job_id}
                        className={`${
                          index % 2 === 0 ? 'bg-[#EFF0F7]' : 'bg-white'
                        } text-black text-[16px] font-['Inter'] border-b`}
                      >
                        <td className="px-4 py-3 text-left">
                          {job.jobRole || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-left">
                          {job.technologies?.join(', ') || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-left">
                          {new Date(job.deadLine).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          }) || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-left">
                          {job.jobLocation || 'N/A'}
                        </td>
                        <td
                          className="px-4 py-3 text-left font-semibold"
                          style={{
                            color: status === 'Active' ? '#129E00' : '#FF0000',
                          }}
                        >
                          {status}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleViewJob(job.job_id)}
                            className="bg-[#EC5300] text-white px-4 py-1 text-sm font-semibold hover:bg-[#d94a00]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden mt-6 w-full flex flex-col items-center space-y-6 px-1">
            {currentJobs.map(job => {
              const status = job.isActive ? 'Active' : 'Timeout';
              return (
                <div
                  key={job.job_id}
                  className="w-[100%] bg-white shadow-xl p-6 rounded-xl border border-gray-200 transition-all duration-300"
                >
                  <h3 className="text-[20px] font-bold text-[#19216F] font-['Inter'] mb-3">
                    {job.jobRole || 'N/A'}
                  </h3>
                  <div className="text-[15px] font-['Inter'] text-gray-800 space-y-2">
                    <p>
                      <span className="text-gray-500 font-medium">Skills:</span>{' '}
                      {job.technologies?.join(', ') || 'N/A'}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">
                        Deadline:
                      </span>{' '}
                      {new Date(job.deadLine).toLocaleDateString() || 'N/A'}
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">
                        Location:
                      </span>{' '}
                      {job.jobLocation || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Status:</span>
                      <span
                        className={`font-semibold px-3 py-1 text-xs rounded-full ${
                          status === 'Active'
                            ? 'text-green-600 bg-green-100'
                            : 'text-red-600 bg-red-100'
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                  </div>
                  <div className="flex justify-end mt-5">
                    <button
                      onClick={() => handleViewJob(job.job_id)}
                      className="bg-[#EC5300] hover:bg-[#d94a00] transition-colors duration-200 text-white px-6 py-2 rounded-md text-sm font-semibold shadow-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="w-full flex justify-end max-w-full px-4">
              <div className="text-black font-medium text-[16px] font-['Inter'] leading-[70px] space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:text-[#0C1BAA]'
                  }`}
                >
                  {'< '}Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`${
                        currentPage === page
                          ? 'text-[#0C1BAA] font-semibold'
                          : 'hover:text-[#0C1BAA]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
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
        </>
      )}
    </div>
  );
};

export default JobListings;
