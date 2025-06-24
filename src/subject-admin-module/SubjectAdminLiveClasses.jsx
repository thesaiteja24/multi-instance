import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useSelector } from 'react-redux';

const SubjectAdminLiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 6; // Match AdminViewBatch
  const { userInfo } = useSelector(state => state.auth);
  const { location, userType } = userInfo;

  useEffect(() => {
    if (userType) {
      if (userType !== 'Python' || userType !== 'Java') {
        console.error('Invalid userType:', userType);
        setError('Invalid user type. Please log in again.');
      }
    } else {
      console.error('No userType found');
      setError('No user type found. Please log in again.');
    }
  }, []);

  // Fetch live classes
  const fetchLiveClasses = useCallback(async () => {
    if (!userType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`;
      const response = await axios.get(url, {
        params: { location: location },
      });

      const courseFilter =
        userType === 'Python'
          ? 'Python Full Stack (PFS)'
          : 'Java Full Stack (JFS)';

      const classes = response.data.schedule_data
        .filter(classItem => {
          const isValid = classItem.course === courseFilter;
          if (
            isValid &&
            classItem.batchNo.some(
              batch => !batch.startsWith(courseFilter.split(' ')[0])
            )
          ) {
            console.warn(
              `Mixed batch numbers in ${classItem.id}: ${classItem.batchNo}`
            );
          }
          return isValid;
        })
        .map(classItem => {
          const classStartDateTime = moment(
            `${classItem.StartDate} ${classItem.StartTime}`,
            'YYYY-MM-DD h:mm A'
          );
          const classEndDateTime = moment(
            `${classItem.EndDate} ${classItem.EndTime}`,
            'YYYY-MM-DD h:mm A'
          );
          const now = moment();

          let status;
          if (now.isBefore(classStartDateTime)) {
            status = 'Upcoming';
          } else if (
            now.isBetween(classStartDateTime, classEndDateTime, null, '[]')
          ) {
            status = 'Ongoing';
          } else {
            status = 'Completed';
          }

          return {
            id: classItem.id,
            subject: classItem.subject,
            instructor: classItem.MentorName,
            time: `${classItem.StartTime} - ${classItem.EndTime}`,
            batch: classItem.batchNo.join(', '),
            startDate: classItem.StartDate,
            endDate: classItem.EndDate,
            location: classItem.location,
            roomNo: classItem.RoomNo,
            status,
          };
        });

      setLiveClasses(classes);
    } catch (error) {
      console.error(`Error fetching ${userType} live classes:`, error);
      setError('Failed to fetch live classes. Please try again later.');
      setLiveClasses([]);
    } finally {
      setLoading(false);
    }
  }, [userType]);

  // Fetch data when userType is set
  useEffect(() => {
    if (userType) {
      fetchLiveClasses();
    }
  }, [userType, fetchLiveClasses]);

  // Memoized filtering logic
  const filteredClasses = useMemo(() => {
    if (!locationFilter) return liveClasses;
    return liveClasses.filter(
      liveClass =>
        liveClass.location.toLowerCase() === locationFilter.toLowerCase()
    );
  }, [liveClasses, locationFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
  const displayedClasses = filteredClasses.slice(
    (currentPage - 1) * classesPerPage,
    currentPage * classesPerPage
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <p className="text-lg font-semibold text-red-500 font-[poppins]">
          {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-600 font-[poppins]">
          Loading live classes...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 font-[poppins] min-h-screen ">
      <div>
        <h3 className="text-[var(--color-secondary)] font-semibold text-[30px] text-center">
          {userType
            ? `${
                userType === 'Python'
                  ? 'Python Full Stack (PFS)'
                  : 'Java Full Stack (JFS)'
              } Live Classes`
            : 'Live Classes Dashboard'}
        </h3>
      </div>

      {/* Location Filter */}
      {location === 'all' && (
        <div className="text-center mb-8">
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm sm:text-base font-[poppins]"
          >
            <option value="">All Locations</option>
            {[...new Set(liveClasses.map(item => item.location))].map(
              (location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              )
            )}
          </select>
        </div>
      )}

      {filteredClasses.length === 0 ? (
        <p className="text-center text-gray-600 font-[poppins]">
          {userType
            ? `No ${userType === 'Python' ? 'PFS' : 'JFS'} live classes found.`
            : 'No live classes found.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 pt-6">
            {displayedClasses.map(liveClass => (
              <div
                key={liveClass.id}
                className="w-full min-h-[360px] border bg-white rounded-[13px] font-[inter] flex flex-col"
              >
                <div className="relative w-full">
                  <img src="/Top.png" alt="Top Icon" className="w-full h-fit" />
                  <h3 className="absolute inset-0 flex items-center justify-start p-3 text-[23px] font-semibold text-white truncate">
                    {liveClass.batch}
                  </h3>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-2">
                    <span className="font-semibold text-[24px] text-[#414651] truncate block">
                      {liveClass.subject}
                    </span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3.40991 22C3.40991 18.13 7.25991 15 11.9999 15C12.9599 15 13.8899 15.13 14.7599 15.37"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 18C22 18.75 21.79 19.46 21.42 20.06C21.21 20.42 20.94 20.74 20.63 21C19.93 21.63 19.01 22 18 22C16.54 22 15.27 21.22 14.58 20.06C14.21 19.46 14 18.75 14 18C14 16.74 14.58 15.61 15.5 14.88C16.19 14.33 17.06 14 18 14C20.21 14 22 15.79 22 18Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16.4399 17.9995L17.4299 18.9895L19.5599 17.0195"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        Instructor
                      </h2>
                    </div>
                    <h2 className="font-medium text-[18px] text-[#717680] truncate">
                      : {liveClass.instructor}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
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
                        Time
                      </h2>
                    </div>
                    <h2 className="font-medium text-[18px] text-[#717680] truncate">
                      : {liveClass.time}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
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
                    <h2 className="font-medium text-[18px] text-[#717680] truncate">
                      : {liveClass.startDate}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
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
                    <h2 className="font-medium text-[18px] text-[#717680] truncate">
                      : {liveClass.endDate}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.9999 13.4295C13.723 13.4295 15.1199 12.0326 15.1199 10.3095C15.1199 8.58633 13.723 7.18945 11.9999 7.18945C10.2768 7.18945 8.87988 8.58633 8.87988 10.3095C8.87988 12.0326 10.2768 13.4295 11.9999 13.4295Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3.61995 8.49C5.58995 -0.169998 18.42 -0.159997 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.38995 20.54C5.62995 17.88 2.46995 13.57 3.61995 8.49Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        Location
                      </h2>
                    </div>
                    <h2 className="font-medium text-[18px] text-[#717680] truncate">
                      : {liveClass.location}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 18V15"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.07 2.81985L3.14002 8.36985C2.36002 8.98985 1.86002 10.2998 2.03002 11.2798L3.36002 19.2398C3.60002 20.6598 4.96002 21.8098 6.40002 21.8098H17.6C19.03 21.8098 20.4 20.6498 20.64 19.2398L21.97 11.2798C22.13 10.2998 21.63 8.98985 20.86 8.36985L13.93 2.82985C12.86 1.96985 11.13 1.96985 10.07 2.81985Z"
                          stroke="#414651"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <h2 className="font-semibold text-[18px] text-[#414651]">
                        Room No
                      </h2>
                    </div>
                    <h2 className="font-medium text-[18px] text-[#717680] truncate">
                      : {liveClass.roomNo}
                    </h2>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] mb-2">
                    <div className="flex items-center gap-[6px]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.4899 2.23055L5.49991 4.11055C4.34991 4.54055 3.40991 5.90055 3.40991 7.12055V14.5505C3.40991 15.7305 4.18991 17.2805 5.13991 17.9905L9.43991 21.2005C10.8499 22.2605 13.1699 22.2605 14.5799 21.2005L18.8799 17.9905C19.8299 17.2805 20.6099 15.7305 20.6099 14.5505V7.12055C20.6099 5.89055 19.6699 4.53055 18.5199 4.10055L13.5299 2.23055C12.6799 1.92055 11.3199 1.92055 10.4899 2.23055Z"
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
                      className={`font-medium text-[18px] truncate ${
                        liveClass.status === 'Ongoing'
                          ? 'text-[#34C759]'
                          : liveClass.status === 'Upcoming'
                            ? 'text-[#FFC107]'
                            : 'text-[#6B7280]'
                      }`}
                    >
                      : {liveClass.status}
                    </h2>
                  </div>
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

export default SubjectAdminLiveClasses;
