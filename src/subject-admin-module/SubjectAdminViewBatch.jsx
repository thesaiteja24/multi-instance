import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { getBatches } from '../reducers/batchesSlice.js';
import { COLLEGE_CODE } from '../constants/AppConstants.js';

const SubjectAdminViewBatch = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );
  const { userInfo } = useSelector(state => state.auth);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [editingBatch, setEditingBatch] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 batches per page

  const sessionStorageLocation = userInfo?.location || 'all';
  const locations = [COLLEGE_CODE];

  useEffect(() => {
    if (userType) {
      try {
        if (userType === 'Python' || userType === 'Java') {
          setUserType(userType);
          setLocationFilter('all'); // Reset location filter
          setCurrentPage(1); // Reset pagination
        } else {
          console.error('Invalid userType:', userType);
          setError('Invalid user type. Please log in again.');
        }
      } catch (err) {
        console.error('Error decrypting userType:', err);
        setError('Failed to decrypt user type. Please log in again.');
      }
    } else {
      console.error('No userType found in sessionStorage');
      setError('No user type found. Please log in again.');
    }
  }, []);

  // Fetch batches using Redux
  useEffect(() => {
    if (userType && batchesList.length === 0) {
      dispatch(getBatches(sessionStorageLocation));
    }
  }, [userType, sessionStorageLocation, batchesList.length, dispatch]);

  // Filter batches based on userType and location
  useEffect(() => {
    if (!userType) {
      setFilteredBatches([]);
      return;
    }

    const batchPrefix = userType === 'Python' ? 'PFS-' : 'JFS-';
    let filtered = batchesList.filter(batch => {
      if (!batch.Batch || typeof batch.Batch !== 'string') {
        console.warn(`Missing or invalid Batch for batch ID: ${batch.id}`);
        return false;
      }
      if (!batch.Batch.startsWith(batchPrefix)) {
        console.warn(
          `Invalid batch prefix for ${userType}: ${batch.Batch} (ID: ${batch.id})`
        );
        return false;
      }
      return true;
    });

    if (locationFilter !== 'all') {
      filtered = filtered.filter(
        batch => batch.location.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    const updatedBatches = filtered.map(batch => ({
      ...batch,
      Status: determineStatus(batch.StartDate, batch.EndDate),
    }));

    setFilteredBatches(updatedBatches);
  }, [batchesList, locationFilter, userType]);

  // Reset page when filteredBatches changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBatches]);

  const determineStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) return 'Upcoming';
    if (today >= start && today <= end) return 'Active';
    return 'Completed';
  };

  const handleEdit = batch => {
    setEditingBatch(batch.id);
    setEditedData({
      ...batch,
      StartDate: batch.StartDate,
      EndDate: batch.EndDate,
      Duration: batch.Duration,
      Status: determineStatus(batch.StartDate, batch.EndDate),
    });
  };

  const handleDateChange = (e, field) => {
    const value = e.target.value;
    const newEditedData = { ...editedData, [field]: value };

    if (field === 'StartDate' || field === 'EndDate') {
      const startDate = new Date(
        field === 'StartDate' ? value : newEditedData.StartDate
      );
      const endDate = new Date(
        field === 'EndDate' ? value : newEditedData.EndDate
      );

      if (startDate && endDate && endDate >= startDate) {
        const diffTime = Math.abs(endDate - startDate);
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newEditedData.Duration = `${durationDays} Days`;
      } else {
        newEditedData.Duration = 'Invalid Dates';
      }
    }

    newEditedData.Status = determineStatus(
      newEditedData.StartDate,
      newEditedData.EndDate
    );
    setEditedData(newEditedData);
  };

  const handleCancel = () => {
    setEditingBatch(null);
    setEditedData({});
  };

  const handleSave = async batchId => {
    setIsSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/batches`, {
        id: batchId,
        StartDate: editedData.StartDate,
        EndDate: editedData.EndDate,
        Duration: editedData.Duration,
      });

      // Update local state
      setFilteredBatches(prevBatches =>
        prevBatches.map(batch =>
          batch.id === batchId
            ? {
                ...batch,
                ...editedData,
                Status: determineStatus(
                  editedData.StartDate,
                  editedData.EndDate
                ),
              }
            : batch
        )
      );

      setEditingBatch(null);
    } catch (error) {
      console.error('Error updating batch:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewMore = batch => {
    navigate('/batch-schedule', { state: { batch } });
  };

  if (error || batchesListError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-lg font-semibold text-red-500">
          {error || batchesListError}
        </p>
      </div>
    );
  }

  if (batchesListLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <p className="text-lg font-semibold text-gray-600">
          Loading batches...
        </p>
      </div>
    );
  }

  // Calculate pagination variables
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const displayedBatches = filteredBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full p-4 font-[poppins] h-full">
      <div>
        <h3 className="text-[var(--color-secondary)] font-semibold text-[30px] text-center">
          {userType
            ? `${
                userType === 'Python'
                  ? 'Python Full Stack (PFS)'
                  : 'Java Full Stack (JFS)'
              } Batches`
            : 'View & Edit Batches'}
        </h3>
      </div>

      {/* Location Filter */}
      {sessionStorageLocation === 'all' && (
        <div className="text-center mb-8">
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm sm:text-base"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>
                {loc === 'all' ? 'All Locations' : loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredBatches.length === 0 ? (
        <p className="text-center text-gray-600">
          {userType
            ? `No ${userType === 'Python' ? 'PFS' : 'JFS'} batches found.`
            : 'No batches found.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-6">
            {displayedBatches.map(batch => (
              <div
                key={batch.id}
                className="w-full h-fit border bg-white rounded-[13px] leading-[36px] font-[inter]"
              >
                {!editingBatch && (
                  <button
                    onClick={() => handleEdit(batch)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-blue-500 transition duration-300 ease-in-out"
                    title="Edit Batch"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                )}

                <div className="relative w-fit">
                  <img src="/Top.png" alt="Top Icon" className="w-full h-fit" />
                  <h3 className="absolute inset-0 flex items-center justify-start p-3 text-[23px] font-semibold text-white">
                    {batch.Batch}
                  </h3>
                </div>

                <div className="p-4">
                  <div>
                    <span className="font-semibold text-[24px] text-[#414651]">
                      {batch.Course}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr]">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.7099 15.1798L12.6099 13.3298C12.0699 13.0098 11.6299 12.2398 11.6299 11.6098V7.50977"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        Duration
                      </h2>
                    </div>
                    <h2 className="font-medium text-[18px] text-[#717680]">
                      :{' '}
                      {editingBatch === batch.id
                        ? editedData.Duration
                        : batch.Duration}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr]">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 2V5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 2V5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.5 9.08984H20.5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.6947 13.6992H15.7037"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.6947 16.6992H15.7037"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.9955 13.6992H12.0045"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.9955 16.6992H12.0045"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.29431 13.6992H8.30329"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.29431 16.6992H8.30329"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        Start Date
                      </h2>
                    </div>
                    {editingBatch === batch.id ? (
                      <input
                        type="date"
                        value={editedData.StartDate}
                        onChange={e => handleDateChange(e, 'StartDate')}
                        className="border rounded px-2 py-1 font-medium text-[18px] text-[#717680]"
                      />
                    ) : (
                      <h2 className="font-medium text-[18px] text-[#717680] inline-block text-nowrap">
                        : {batch.StartDate}
                      </h2>
                    )}
                  </div>
                  <div className="grid grid-cols-[160px_1fr]">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 2V5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 2V5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.5 9.08984H20.5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.6947 13.6992H15.7037"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.6947 16.6992H15.7037"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.9955 13.6992H12.0045"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.9955 16.6992H12.0045"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.29431 13.6992H8.30329"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.29431 16.6992H8.30329"
                          stroke="#414651"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        End Date
                      </h2>
                    </div>
                    {editingBatch === batch.id ? (
                      <input
                        type="date"
                        value={editedData.EndDate}
                        onChange={e => handleDateChange(e, 'EndDate')}
                        min={editedData.StartDate}
                        className="border rounded px-2 py-1 font-medium text-[18px] text-[#717680]"
                      />
                    ) : (
                      <h2 className="font-medium text-[18px] text-[#717680] inline-block text-nowrap">
                        : {batch.EndDate}
                      </h2>
                    )}
                  </div>
                  <div className="grid grid-cols-[160px_1fr]">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.4902 2.23055L5.50016 4.11055C4.35016 4.54055 3.41016 5.90055 3.41016 7.12055V14.5505C3.41016 15.7305 4.19016 17.2805 5.14016 17.9905L9.44016 21.2005C10.8502 22.2605 13.1702 22.2605 14.5802 21.2005L18.8802 17.9905C19.8302 17.2805 20.6102 15.7305 20.6102 14.5505V7.12055C20.6102 5.89055 19.6702 4.53055 18.5202 4.10055L13.5302 2.23055C12.6802 1.92055 11.3202 1.92055 10.4902 2.23055Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12.5V15.5"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        Status
                      </h2>
                    </div>
                    <h2
                      className={`font-medium text-[18px] ${
                        batch.Status === 'Active'
                          ? 'text-[#34C759]'
                          : batch.Status === 'Upcoming'
                            ? 'text-[#FFC107]'
                            : 'text-[#6B7280]'
                      }`}
                    >
                      : {batch.Status}
                    </h2>
                  </div>
                  {editingBatch === batch.id ? (
                    <div className="w-full grid gap-4 mt-3 grid-cols-2">
                      <button
                        onClick={() => handleSave(batch.id)}
                        disabled={isSaving}
                        className={`text-white rounded-[10px] font-[poppins] p-2 font-semibold ${
                          isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[var(--color-secondary)]'
                        }`}
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-white"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                            Saving...
                          </div>
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-white bg-red-500 rounded-[10px] font-[poppins] p-2 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="w-full grid gap-4 mt-3 grid-cols-2">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="text-white bg-[var(--color-secondary)] rounded-[10px] font-[poppins] p-2 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewMore(batch)}
                        className="text-white bg-[var(--color-secondary)] rounded-[10px] font-[poppins] p-2 font-semibold"
                      >
                        View More
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </Stack>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubjectAdminViewBatch;
