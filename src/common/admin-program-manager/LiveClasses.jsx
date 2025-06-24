import { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import moment from 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { fetchScheduleData } from '../../reducers/scheduleSlice';
import { COLLEGE_CODE } from '../../constants/AppConstants';
import { AttendanceIcon } from '../../Icons/MentorIcons';

const LiveClasses = () => {
  const dispatch = useDispatch();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const classesPerPage = 6; // Number of classes per page

  const locations = [COLLEGE_CODE];
  const { userInfo } = useSelector(state => state.auth || {});
  const {
    schedule = [],
    status = 'idle',
    error = null,
  } = useSelector(state => state.schedule || {});
  const storedLocation = userInfo?.location || 'all';

  // Map schedule data to live classes
  const mapScheduleToLiveClasses = useCallback(() => {
    const classes = schedule.map(classItem => {
      const classStartDateTime = moment.tz(
        `${classItem.StartDate} ${classItem.StartTime}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Kolkata'
      );
      const classEndDateTime = moment.tz(
        `${classItem.EndDate} ${classItem.EndTime}`,
        'YYYY-MM-DD HH:mm',
        'Asia/Kolkata'
      );
      const now = moment.tz('Asia/Kolkata');

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
        id: classItem.id || Math.random().toString(36).substr(2, 9), // Fallback ID
        course: classItem.course || 'N/A',
        subject: classItem.subject || 'N/A',
        instructor: classItem.MentorName || 'Unknown',
        time: `${classItem.StartTime || 'N/A'} - ${classItem.EndTime || 'N/A'}`,
        batch: Array.isArray(classItem.batchNo)
          ? classItem.batchNo.join(', ')
          : classItem.batchNo || '-',
        startDate: classItem.StartDate || 'N/A',
        endDate: classItem.EndDate || 'N/A',
        location: classItem.location || 'N/A',
        roomNo: classItem.RoomNo || 'N/A',
        status,
      };
    });

    setLiveClasses(classes);
  }, [schedule]);

  // Fetch schedule data
  useEffect(() => {
    if (status === 'idle' || (status === 'succeeded' && !schedule.length)) {
      setLoading(true);
      dispatch(fetchScheduleData(storedLocation))
        .unwrap()
        .then(() => {
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          console.error('Error fetching live classes:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message || 'Failed to fetch schedule data.',
          });
        });
    } else if (status === 'succeeded') {
      mapScheduleToLiveClasses();
    }
  }, [
    dispatch,
    status,
    storedLocation,
    mapScheduleToLiveClasses,
    schedule.length,
  ]);

  // Memoized filtering logic
  const filteredClasses = useMemo(() => {
    if (locationFilter === 'all') return liveClasses;
    return liveClasses.filter(
      liveClass =>
        liveClass.location.toLowerCase() === locationFilter.toLowerCase()
    );
  }, [liveClasses, locationFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  const paginatedClasses = useMemo(() => {
    const startIndex = (page - 1) * classesPerPage;
    return filteredClasses.slice(startIndex, startIndex + classesPerPage);
  }, [filteredClasses, page]);

  const handleLocationFilterChange = e => {
    setLocationFilter(e.target.value);
    setPage(1);
  };

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
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        items.push(1);
        if (startPage > 2) items.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) items.push('...');
        items.push(totalPages);
      }
    }
    return items;
  };

  // SVG Icon Component
  const IconSVG = ({ id }) => (
    <svg
      className="w-[24px] h-[24px]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use href={`#${id}`} />
    </svg>
  );

  return (
    <div className="flex flex-col p-4 h-fit items-center justify-center">
      {/* SVG Definitions */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute' }}
        aria-hidden="true"
      >
        <defs>
          <symbol id="icon-instructor" viewBox="0 0 24 24">
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.41016 22C3.41016 18.13 7.26015 15 12.0002 15C12.9602 15 13.8902 15.13 14.7602 15.37"
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
          </symbol>
          <symbol id="icon-time" viewBox="0 0 24 24">
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
          </symbol>
          <symbol id="icon-start-date" viewBox="0 0 24 24">
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
          </symbol>
          <symbol id="icon-end-date" viewBox="0 0 24 24">
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
          </symbol>
          <symbol id="icon-location" viewBox="0 0 24 24">
            <path
              d="M11.9999 13.4295C13.723 13.4295 15.1199 12.0326 15.1199 10.3095C15.1199 8.58633 13.723 7.18945 11.9999 7.18945C10.2768 7.18945 8.87988 8.58633 8.87988 10.3095C8.87988 12.0326 10.2768 13.4295 11.9999 13.4295Z"
              stroke="#414651"
              strokeWidth="1.5"
            />
            <path
              d="M3.6202 8.49C5.5902 -0.169998 18.4202 -0.159997 20.3802 8.5C21.5302 13.58 18.3702 17.88 15.6002 20.54C13.5902 22.48 10.4102 22.48 8.3902 20.54C5.6302 17.88 2.4702 13.57 3.6202 8.49Z"
              stroke="#414651"
              strokeWidth="1.5"
            />
          </symbol>
          <symbol id="icon-room" viewBox="0 0 24 24">
            <path
              d="M12 18V15"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.0698 2.81985L3.13978 8.36985C2.35978 8.98985 1.85978 10.2998 2.02978 11.2798L3.35978 19.2398C3.59978 20.6598 4.95978 21.8098 6.39978 21.8098H17.5998C19.0298 21.8098 20.3998 20.6498 20.6398 19.2398L21.9698 11.2798C22.1298 10.2998 21.6298 8.98985 20.8598 8.36985L13.9298 2.82985C12.8598 1.96985 11.1298 1.96985 10.0698 2.81985Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="subject" viewBox="0 0 24 24">
            <path
              d="M16 4.00195C18.175 4.01395 19.353 4.11095 20.121 4.87895C21 5.75795 21 7.17195 21 9.99995V16C21 18.829 21 20.243 20.121 21.122C19.243 22 17.828 22 15 22H9C6.172 22 4.757 22 3.879 21.122C3 20.242 3 18.829 3 16V9.99995C3 7.17195 3 5.75795 3.879 4.87895C4.647 4.11095 5.825 4.01395 8 4.00195"
              stroke="#414651"
              strokeWidth="1.5"
            />
            <path
              d="M8 14H16M7 10.5H17M9 17.5H15"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M8 3.5C8 3.10218 8.15804 2.72064 8.43934 2.43934C8.72064 2.15804 9.10218 2 9.5 2H14.5C14.8978 2 15.2794 2.15804 15.5607 2.43934C15.842 2.72064 16 3.10218 16 3.5V4.5C16 4.89782 15.842 5.27936 15.5607 5.56066C15.2794 5.84196 14.8978 6 14.5 6H9.5C9.10218 6 8.72064 5.84196 8.43934 5.56066C8.15804 5.27936 8 4.89782 8 4.5V3.5Z"
              stroke="#414651"
              strokeWidth="1.5"
            />
          </symbol>
        </defs>
      </svg>

      {/* Title */}
      <h1 className="h-[45px] font-poppins font-semibold text-[30px] leading-[45px] text-[var(--color-secondary)] mb-2">
        Live Mentor Classes
      </h1>

      {/* Location Filter */}
      {storedLocation === 'all' && (
        <div className="text-center mb-8 w-full max-w-md">
          <select
            value={locationFilter}
            onChange={handleLocationFilterChange}
            className="w-full border border-gray-300 bg-white shadow-md rounded-lg px-4 py-2 text-sm sm:text-base text-gray-700 focus:ring focus:ring-blue-300 focus:border-blue-400 transition"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>
                {loc === 'all'
                  ? '🌍 All Locations'
                  : loc.charAt(0).toUpperCase() + loc.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Classes List */}
      {loading ? (
        <div className="text-center text-[var(--color-secondary)] text-lg font-semibold animate-pulse">
          Loading Mentor classes...
        </div>
      ) : error ? (
        <div className="text-center text-[#717680] text-lg">
          🚫 Error: {error.message || 'Failed to load classes.'}
        </div>
      ) : filteredClasses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {paginatedClasses.map(liveClass => (
              <div
                key={liveClass.id}
                className="flex flex-col p-6 gap-5 w-full bg-[#FDFDFD] shadow-[0_4px_20px_#B3BAF7,0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)] rounded-[13px]"
              >
                {/* Header */}
                <div className="flex items-center gap-3 w-full h-[38px]">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.2499 16.25C10.4249 16.6625 9.7374 17.275 9.2249 18.0375C8.9374 18.475 8.9374 19.025 9.2249 19.4625C9.7374 20.225 10.4249 20.8375 11.2499 21.25"
                      stroke="#00007F"
                      strokeWidth="1.875"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.0127 16.25C19.8377 16.6625 20.5252 17.275 21.0377 18.0375C21.3252 18.475 21.3252 19.025 21.0377 19.4625C20.5252 20.225 19.8377 20.8375 19.0127 21.25"
                      stroke="#00007F"
                      strokeWidth="1.875"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.25 27.5H18.75C25 27.5 27.5 25 27.5 18.75V11.25C27.5 5 25 2.5 18.75 2.5H11.25C5 2.5 2.5 5 2.5 11.25V18.75C2.5 25 5 27.5 11.25 27.5Z"
                      stroke="#00007F"
                      strokeWidth="1.875"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.7876 10.0125L26.8126 10"
                      stroke="#00007F"
                      strokeWidth="1.875"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h2 className="text-[var(--color-secondary)] font-inter font-semibold text-[28px] leading-[38px] truncate">
                    {liveClass.batch}
                  </h2>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4 w-full">
                  {[
                    {
                      label: 'Instructor',
                      value: liveClass.instructor,
                      icon: 'icon-instructor',
                    },
                    {
                      label: 'Subject.',
                      value: liveClass.subject,
                      icon: 'subject',
                    },
                    { label: 'Time', value: liveClass.time, icon: 'icon-time' },
                    {
                      label: 'Start Date',
                      value: liveClass.startDate,
                      icon: 'icon-start-date',
                    },
                    {
                      label: 'End Date',
                      value: liveClass.endDate,
                      icon: 'icon-end-date',
                    },
                    {
                      label: 'Location',
                      value: liveClass.location,
                      icon: 'icon-location',
                    },
                    {
                      label: 'Room No.',
                      value: liveClass.roomNo,
                      icon: 'icon-room',
                    },
                  ].map(({ label, value, icon }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 w-full h-[24px]"
                    >
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <IconSVG id={icon} />
                        <span className="text-[#414651] font-inter font-semibold text-[18px] leading-[24px]">
                          {label}
                        </span>
                      </div>
                      <div className="text-[#414651] font-inter font-semibold text-[18px] leading-[24px] w-4 flex justify-center">
                        :
                      </div>
                      <div className="flex-1 text-[#717680] font-inter font-medium text-[18px] leading-[24px] truncate">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 w-full mt-auto">
                  <button className="hidden w-1/2 h-[41px] bg-[var(--color-secondary)] text-white font-poppins font-medium text-[14px] leading-[21px] rounded-[10px]">
                    View
                  </button>
                  <button
                    className={`w-full h-[41px] text-white font-poppins font-semibold text-[14px] leading-[21px] rounded-[10px] ${
                      liveClass.status === 'Ongoing'
                        ? 'bg-[#F8AD43]'
                        : liveClass.status === 'Upcoming'
                          ? 'bg-[#FFD700]'
                          : 'bg-[#34C759]'
                    }`}
                  >
                    {liveClass.status}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="w-full flex justify-end max-w-full mt-6 px-4">
              <div className="text-black font-medium text-[16px] font-['Inter'] leading-[70px] space-x-2">
                <button
                  onClick={handlePrevPage}
                  className={`font-semibold ${
                    page === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#0C1BAA] hover:text-blue-800'
                  }`}
                  disabled={page === 1}
                >
                  &lt; PREV
                </button>
                {getPaginationItems().map((item, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof item === 'number' && handlePageChange(item)
                    }
                    className={
                      typeof item === 'number' && page === item
                        ? 'text-[#0C1BAA] font-semibold'
                        : 'hover:text-[#0C1BAA]'
                    }
                    disabled={typeof item !== 'number'}
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  className={`font-semibold ${
                    page === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#0C1BAA] hover:text-blue-800'
                  }`}
                  disabled={page === totalPages}
                >
                  NEXT &gt;
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-[#717680] text-lg">
          🚫 No live classes available.
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
