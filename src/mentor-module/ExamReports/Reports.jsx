import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { getMentorStudentsThunk } from '../../reducers/mentorStudentsSlice.js';
import { COLLEGE_CODE } from '../../constants/AppConstants.js';

const Reports = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    scheduleData,
    mentorStudentsListLoading: contextLoading,
    mentorStudentsListError: contextError,
  } = useSelector(state => state.mentorStudents);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Ensure currentPage is defined

  const itemsPerPage = 24;
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);

  // Retrieve and decrypt location and mentorId from sessionStorage
  const { userInfo } = useSelector(state => state.auth);
  const { location, id } = userInfo;
  const sessionStorageLocation = location;
  const mentorId = id;

  const locations = [COLLEGE_CODE];

  // Validate location on mount
  useEffect(() => {
    if (!sessionStorageLocation) {
      setLocationError('No location found. Please log in again.');
      toast.error('No location found. Please log in again.', {
        autoClose: 5000,
        closeOnClick: true,
        closeButton: true,
      });
    } else if (!locations.includes(sessionStorageLocation)) {
      setLocationError('Invalid location. Please log in again.');
      toast.error('Invalid location. Please log in again.', {
        autoClose: 5000,
        closeOnClick: true,
        closeButton: true,
      });
    } else {
      setLocationError(null);
    }
  }, [sessionStorageLocation]);

  // Fetch mentor students data if scheduleData is empty
  useEffect(() => {
    if (
      !contextLoading &&
      !contextError &&
      (!scheduleData || scheduleData.length === 0)
    ) {
      if (!mentorId) {
        setLocationError('No mentor ID found. Please log in again.');
        toast.info('No mentor ID found. Please log in again.', {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: true,
        });
        return;
      }
      dispatch(
        getMentorStudentsThunk({
          location:
            sessionStorageLocation === 'all'
              ? COLLEGE_CODE
              : sessionStorageLocation,
          mentorId,
          selectedBatch: null,
        })
      );
    }
  }, [
    dispatch,
    scheduleData,
    contextLoading,
    contextError,
    sessionStorageLocation,
    mentorId,
  ]);

  // Compute unique batches from scheduleData
  const batches = useMemo(() => {
    if (!Array.isArray(scheduleData) || !scheduleData.length) {
      return [];
    }
    const uniqueBatches = [
      ...new Set(
        scheduleData.flatMap(entry => entry.batchNo || entry.batch || [])
      ),
    ].filter(Boolean);
    return uniqueBatches.map((batchNo, index) => ({
      id: index + 1,
      batch: batchNo,
      location:
        sessionStorageLocation === 'all'
          ? COLLEGE_CODE
          : sessionStorageLocation,
      name: batchNo,
    }));
  }, [scheduleData, sessionStorageLocation]);

  // Filter batches based on location and search query
  const filterBatches = useCallback(() => {
    let filtered = [...batches];

    if (locationFilter !== 'all' && sessionStorageLocation === 'all') {
      filtered = filtered.filter(
        batch => batch.location?.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(batch =>
        (batch.batch || batch.name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBatches(filtered);
    setCurrentPage(1);
  }, [batches, locationFilter, searchQuery, sessionStorageLocation]);

  useEffect(() => {
    filterBatches();
  }, [filterBatches]);

  // Handle batch click with navigation
  const handleDailyClick = useCallback(
    batch => {
      setLoadingId(batch.id);
      try {
        navigate(
          `/mentor/reports/${encodeURIComponent(batch.batch)}/${encodeURIComponent(sessionStorageLocation)}`
        );
      } catch (error) {
        console.error('Error navigating:', error);
        toast.error('Error navigating to exam mode', {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: true,
        });
      } finally {
        setLoadingId(null);
      }
    },
    [navigate, sessionStorageLocation]
  );

  // Pagination logic
  const goToPage = useCallback(
    page => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBatches = filteredBatches.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Loading state
  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <p className="text-lg font-semibold text-gray-600">
          Loading batches...
        </p>
      </div>
    );
  }

  // Error state with retry option
  if (locationError || contextError) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">
            {locationError || contextError}
          </p>
          {contextError && (
            <button
              onClick={() =>
                dispatch(
                  getMentorStudentsThunk({
                    location:
                      sessionStorageLocation === 'all'
                        ? COLLEGE_CODE
                        : sessionStorageLocation,
                    mentorId,
                    selectedBatch: null,
                  })
                )
              }
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="font-[Inter] w-full max-w-full overflow-x-hidden box-border px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-[var(--color-secondary)] font-semibold">
          Students Performance Dashboard
        </h2>
      </div>

      {/* Location Filter */}
      {sessionStorageLocation === 'all' && (
        <div className="text-center mb-8">
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select Location"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>
                {loc === 'all'
                  ? 'All Locations'
                  : loc.charAt(0).toUpperCase() + loc.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 mb-7 sm:mt-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[var(--color-secondary)]">
            Search Batch
          </h3>
          <div className="relative w-full sm:w-48 lg:w-56">
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12.6083 11.0953H11.8115L11.529 10.823C12.5518 9.63684 13.1138 8.12248 13.1126 6.55631C13.1126 5.2596 12.7281 3.992 12.0077 2.91382C11.2873 1.83564 10.2633 0.995304 9.06531 0.499072C7.8673 0.00284075 6.54904 -0.126996 5.27724 0.125981C4.00544 0.378957 2.83722 1.00339 1.9203 1.9203C1.00339 2.83722 0.378957 4.00544 0.125981 5.27724C-0.126996 6.54904 0.00284075 7.8673 0.499072 9.06531C0.995304 10.2633 1.83564 11.2873 2.91382 12.0077C3.992 12.7281 5.2596 13.1126 6.55631 13.1126C8.18026 13.1126 9.67308 12.5175 10.823 11.529L11.0953 11.8115V12.6083L16.1386 17.6415L17.6415 16.1386L12.6083 11.0953ZM6.55631 11.0953C4.04474 11.0953 2.01733 9.06789 2.01733 6.55631C2.01733 4.04474 4.04474 2.01733 6.55631 2.01733C9.06789 2.01733 11.0953 4.04474 11.0953 6.55631C11.0953 9.06789 9.06789 11.0953 6.55631 11.0953Z"
                fill="#00007F"
              />
            </svg>
            <input
              type="text"
              className="p-2 pr-10 rounded-lg bg-[#ffffff] text-black w-full text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter batch name..."
              style={{ boxShadow: '0px 3.77px 3.77px 0px #00000040' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search batches"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center mt-4 sm:mt-0">
          <svg
            width="19"
            height="24"
            viewBox="0 0 19 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4.6336 16.2176H0L6.9504 23.168V0H4.6336V16.2176ZM11.584 3.4752V23.168H13.9008V6.9504H18.5344L11.584 0V3.4752Z"
              fill="#00007F"
            />
          </svg>
          <h2 className="text-base text-[var(--color-secondary)] sm:text-lg lg:text-xl font-medium">
            Batch Wise
          </h2>
        </div>
      </div>

      {/* Divider */}
      <div className="border border-[#939393] my-4"></div>

      {/* Dynamic Cards */}
      {filteredBatches.length === 0 ? (
        <div className="text-center text-gray-600 font-semibold mt-6">
          No batches found for{' '}
          {locationFilter === 'all' ? 'all locations' : locationFilter}.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 p-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 justify-center">
          {currentBatches.map(batch => (
            <button
              key={batch.id}
              onClick={() => handleDailyClick(batch)}
              disabled={loadingId === batch.id}
              className={`border border-white bg-white flex flex-col justify-center items-center h-28 w-full max-w-[180px] rounded-xl mx-auto relative transition-opacity duration-200 ${
                loadingId === batch.id
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              }`}
              style={{ boxShadow: '0px 4.03px 17.15px 0px #132EE033' }}
              aria-label={`View batch ${batch.batch}`}
            >
              <h2 className="text-lg sm:text-xl lg:text-[18px] font-medium text-black">
                {batch.batch || batch.name}
              </h2>
              <div className="flex items-center mt-0">
                <div className="mr-1">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <g clipPath="url(#clip0_768_268)">
                      <g clipPath="url(#clip1_768_268)">
                        <path
                          d="M9.17874 9.1635C10.5404 9.1635 11.5995 8.05397 11.5995 6.69228C11.5995 5.33058 10.49 4.27148 9.12831 4.27148C7.76662 4.27148 6.70752 5.38101 6.70752 6.69228C6.70752 8.05397 7.81705 9.1635 9.17874 9.1635ZM9.12831 5.28015C9.17874 5.28015 9.17874 5.28015 9.12831 5.28015C9.93524 5.28015 10.5909 5.93578 10.5909 6.74271C10.5909 7.54964 9.93524 8.15484 9.12831 8.15484C8.32138 8.15484 7.71618 7.49921 7.71618 6.74271C7.71618 5.93578 8.37181 5.28015 9.12831 5.28015Z"
                          fill="#BFBFBF"
                        />
                        <path
                          d="M16.6431 8.8613C15.6848 8.00394 14.424 7.55004 13.1127 7.60047H12.7093C12.6084 8.00394 12.4571 8.35697 12.2554 8.65957C12.558 8.60914 12.8101 8.60914 13.1127 8.60914C14.071 8.55871 15.0292 8.8613 15.7857 9.41607V13.0473H16.7944V9.0126L16.6431 8.8613Z"
                          fill="#BFBFBF"
                        />
                        <path
                          d="M11.9526 4.37258C12.2048 3.76738 12.9109 3.46479 13.5665 3.71695C14.1717 3.96912 14.4743 4.67518 14.2221 5.33081C14.0204 5.78471 13.5665 6.08731 13.1126 6.08731C13.0117 6.08731 12.8604 6.08731 12.7596 6.03688C12.81 6.28904 12.81 6.54121 12.81 6.74294V7.04554C12.9109 7.04554 13.0117 7.09597 13.1126 7.09597C14.3734 7.09597 15.3821 6.08731 15.3821 4.87691C15.3821 3.61609 14.3734 2.60742 13.163 2.60742C12.3561 2.60742 11.65 3.01089 11.2466 3.71695C11.4987 3.86825 11.7509 4.06998 11.9526 4.37258Z"
                          fill="#BFBFBF"
                        />
                        <path
                          d="M6.20354 8.70938C6.0018 8.40678 5.8505 8.05375 5.74964 7.65029H5.34617C4.03491 7.59985 2.77408 8.05375 1.81585 8.86068L1.66455 9.01198V13.0466H2.67321V9.41545C3.48014 8.86068 4.38794 8.55808 5.34617 8.60852C5.64877 8.60852 5.95137 8.65895 6.20354 8.70938Z"
                          fill="#BFBFBF"
                        />
                        <path
                          d="M5.34594 7.04547C5.44681 7.04547 5.54768 7.04547 5.64854 6.99504V6.69244C5.64854 6.44027 5.64854 6.18811 5.69898 5.98638C5.59811 6.03681 5.44681 6.03681 5.34594 6.03681C4.69031 6.03681 4.13555 5.48204 4.13555 4.82641C4.13555 4.17078 4.69031 3.61602 5.34594 3.61602C5.85028 3.61602 6.30417 3.91862 6.50591 4.37251C6.70764 4.12035 7.01024 3.86818 7.2624 3.66645C6.60677 2.60735 5.24508 2.25432 4.18598 2.90995C3.12689 3.56558 2.77385 4.92728 3.42948 5.98638C3.83295 6.64201 4.53901 7.04547 5.34594 7.04547Z"
                          fill="#BFBFBF"
                        />
                        <path
                          d="M13.3146 11.8863L13.2137 11.735C12.205 10.6255 10.7929 9.96986 9.27991 10.0203C7.76692 9.96986 6.30435 10.6255 5.29569 11.735L5.19482 11.8863V15.7192C5.19482 16.1731 5.34612 16.627 5.64872 16.9296C5.95132 17.2322 6.35478 17.3835 6.75825 17.3835H11.8016C12.205 17.3835 12.6085 17.2322 12.9111 16.9296C13.2137 16.627 13.365 16.1731 13.365 15.7192V11.8863H13.3146Z"
                          fill="#BFBFBF"
                        />
                      </g>
                    </g>
                    <defs>
                      <clipPath id="clip0_768_268">
                        <rect
                          width="18.1559"
                          height="18.1559"
                          fill="white"
                          transform="translate(0.152344 0.438477)"
                        />
                      </clipPath>
                      <clipPath id="clip1_768_268">
                        <rect
                          width="18.1559"
                          height="18.1559"
                          fill="white"
                          transform="translate(0.151855 0.438477)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <p className="text-[#BBBBBB] font-medium text-sm sm:text-base">
                  Batch
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination UI */}
      {!contextLoading && totalPages > 1 && (
        <div className="w-full flex justify-end max-w-full mt-1 px-4">
          <div className="text-black font-medium text-[16px] font-['Inter'] tracking-[3px] leading-[70px] space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'hover:text-[#0C1BAA]'
              }`}
              aria-label="Previous page"
            >
              {'< '}Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`${
                  currentPage === page
                    ? 'text-[#0C1BAA] font-semibold'
                    : 'hover:text-[#0C1BAA]'
                }`}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'hover:text-[#0C1BAA]'
              }`}
              aria-label="Next page"
            >
              Next {'>'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
