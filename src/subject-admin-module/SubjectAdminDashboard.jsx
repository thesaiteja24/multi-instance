import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useSelector } from 'react-redux';

// Default data array (for fallback)
const defaultMentorData = [];

const SubjectAdminDashboard = () => {
  const [mentorData, setMentorData] = useState(defaultMentorData);
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const mentorsPerPage = 6; // Number of mentors per page
  const { userInfo } = useSelector(state => state.auth);
  const usrType = userInfo?.userType;

  // Define subject sets for PFS and JFS
  const PFS = [
    'Python',
    'Flask',
    'Frontend',
    'SoftSkills',
    'MySQL',
    'Aptitude',
    'Verbal',
  ];
  const JFS = [
    'Java',
    'AdvancedJava',
    'Frontend',
    'SoftSkills',
    'MySQL',
    'Aptitude',
    'Verbal',
  ];

  useEffect(() => {
    if (usrType) {
      if (usrType === 'Python' || usrType === 'Java') {
        setUserType(usrType);
      } else {
        console.error('Invalid userType:', usrType);
        setUserType(null);
      }
    } else {
      console.error('No userType found');
      setUserType(null);
    }
  }, [usrType]);

  const fetchMentorData = async () => {
    if (!userType) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/adminsdata`
      );
      const mentors = response.data.Mentors || [];

      // Filter mentors based on any subject match in PFS or JFS, excluding opposite key subjects
      const updatedMentors = mentors.filter(mentor => {
        const designations = Array.isArray(mentor.Designation)
          ? mentor.Designation
          : [mentor.Designation];
        const subjectSet = userType === 'Python' ? PFS : JFS;
        const oppositeKeySubjects =
          userType === 'Python'
            ? ['Java', 'AdvancedJava']
            : ['Python', 'Flask'];

        const hasOwnSubject = designations.some(designation =>
          subjectSet.includes(designation)
        );
        const hasOppositeKeySubject = designations.some(designation =>
          oppositeKeySubjects.includes(designation)
        );
        return hasOwnSubject && !hasOppositeKeySubject;
      });

      setMentorData(updatedMentors);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching ${userType} mentor data:`, error);
      setMentorData(defaultMentorData);
      setLoading(false);
    }
  };

  // Fetch data when userType is set
  useEffect(() => {
    if (userType) {
      fetchMentorData();
    }
  }, [userType]);

  // Filtered data based on location
  const getFilteredData = data =>
    locationFilter
      ? data.filter(item => item.location === locationFilter)
      : data;

  const filteredMentors = getFilteredData(mentorData);

  // Pagination logic
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);
  const currentMentors = filteredMentors.slice(
    (currentPage - 1) * mentorsPerPage,
    currentPage * mentorsPerPage
  );

  // Handle page change
  const handlePageChange = (e, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full p-2 sm:p-4 font-[inter]">
      <h3 className="text-[var(--color-secondary)] font-semibold text-[24px] sm:text-[30px] text-center mb-4 sm:mb-6">
        {userType
          ? `${
              userType === 'Python'
                ? 'Python Full Stack (PFS)'
                : 'Java Full Stack (JFS)'
            } Mentors Dashboard (${filteredMentors.length})`
          : 'Mentors Dashboard'}
      </h3>

      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
          <p className="text-base sm:text-lg font-semibold text-gray-600">
            Loading mentors...
          </p>
        </div>
      ) : !userType ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
          <p className="text-base sm:text-lg font-semibold text-red-500">
            Invalid or missing user type. Please log in again.
          </p>
        </div>
      ) : (
        <>
          {/* Location Filter */}
          <div className="mb-6 sm:mb-8 flex flex-row items-center  gap-3 sm:gap-4 md:gap-5 flex-wrap">
            <label
              htmlFor="locationFilter"
              className="text-[16px] md:text-[17px] lg:text-[18px] font-medium text-[#414651] whitespace-nowrap"
              style={{ fontFamily: 'Inter', lineHeight: '28px' }}
            >
              Filter by Location:
            </label>
            <div className="relative w-[200px] md:w-[220px] lg:w-[240px] h-[50px]">
              <select
                id="locationFilter"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="bg-[#EFF0F7] text-[14px] md:text-[15px] lg:text-[16px] font-medium text-[#000000] focus:outline-none w-full h-full p-[10px_20px] md:p-[8px_16px] lg:p-[10px_20px] rounded-[5px] shadow-sm appearance-none pr-10"
                style={{
                  fontFamily: 'Inter',
                  lineHeight: '19px',
                }}
              >
                <option value="" className="font-inter">
                  All Locations
                </option>
                {[...new Set(mentorData.map(item => item.location))].map(
                  (location, index) => (
                    <option key={index} value={location} className="font-inter">
                      {location}
                    </option>
                  )
                )}
              </select>
              {/* Custom Dropdown Arrow */}
              <div className="pointer-events-none absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  width="8"
                  height="14"
                  viewBox="0 0 8 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rotate-[-90deg]"
                >
                  <path
                    d="M1 1L7 7L1 13"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {currentMentors.length === 0 ? (
            <p className="text-center text-gray-600 text-sm sm:text-base font-inter">
              {userType
                ? `No ${userType === 'Python' ? 'PFS' : 'JFS'} mentors found.`
                : 'No mentors found.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6">
                {currentMentors.map((mentor, index) => (
                  <div
                    key={index}
                    className="w-full h-fit border bg-white rounded-[13px] font-[inter] shadow-md"
                  >
                    <div className="relative w-full">
                      <img
                        src="/Top.png"
                        alt="Top Icon"
                        className="w-full h-auto object-cover"
                      />
                      <h3 className="absolute inset-0 flex items-center justify-start p-2 sm:p-3 text-[18px] sm:text-[23px] font-semibold text-white truncate">
                        {mentor.name}
                      </h3>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1 sm:space-y-3">
                      <div>
                        <span className="font-semibold text-[18px] sm:text-[24px] text-[#414651]">
                          {userType} Mentor
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 items-center">
                        <div className="flex items-center gap-[6px]">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 sm:w-6 sm:h-6"
                          >
                            <path
                              d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
                              stroke="#414651"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9"
                              stroke="#414651"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <h2 className="font-semibold text-[14px] sm:text-[18px] text-[#414651]">
                            Email
                          </h2>
                        </div>
                        <h2 className="font-medium text-[14px] sm:text-[18px] text-[#717680] truncate">
                          : {mentor.email}
                        </h2>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 items-center">
                        <div className="flex items-center gap-[6px]">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 sm:w-6 sm:h-6"
                          >
                            <path
                              d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z"
                              stroke="#414651"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                            />
                          </svg>
                          <h2 className="font-semibold text-[14px] sm:text-[18px] text-[#414651]">
                            Phone
                          </h2>
                        </div>
                        <h2 className="font-medium text-[14px] sm:text-[18px] text-[#717680]">
                          : {mentor.PhNumber}
                        </h2>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 items-center">
                        <div className="flex items-center gap-[6px]">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 13.4295C13.7231 13.4295 15.12 12.0326 15.12 10.3095C15.12 8.58633 13.7231 7.18945 12 7.18945C10.2769 7.18945 8.88 8.58633 8.88 10.3095C8.88 12.0326 10.2769 13.4295 12 13.4295Z"
                              stroke="#414651"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M3.62001 8.49C5.59001 -0.169998 18.42 -0.159997 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.39001 20.54C5.63001 17.88 2.47001 13.57 3.62001 8.49Z"
                              stroke="#414651"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <h2 className="font-semibold text-[14px] sm:text-[18px] text-[#414651]">
                            Location
                          </h2>
                        </div>
                        <h2 className="font-medium text-[14px] sm:text-[18px] text-[#717680]">
                          : {mentor.location}
                        </h2>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-2 items-center">
                        <div className="flex items-center gap-[6px]">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 sm:w-6 sm:h-6"
                          >
                            <path
                              d="M14.5 10.6504H9.5"
                              stroke="#414651"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 8.21094V13.2109"
                              stroke="#414651"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M16.82 2H7.18001C5.05001 2 3.32001 3.74 3.32001 5.86V19.95C3.32001 21.75 4.61001 22.51 6.19001 21.64L11.07 18.93C11.59 18.64 12.43 18.64 12.94 18.93L17.82 21.64C19.4 22.52 20.69 21.76 20.69 19.95V5.86C20.68 3.74 18.95 2 16.82 2Z"
                              stroke="#414651"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <h2 className="font-semibold text-[14px] sm:text-[18px] text-[#414651]">
                            Designation
                          </h2>
                        </div>
                        <h2 className="font-medium text-[14px] sm:text-[18px] text-[#717680]">
                          :{' '}
                          {Array.isArray(mentor.Designation)
                            ? mentor.Designation.join(', ')
                            : mentor.Designation}
                        </h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <Stack spacing={2}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      variant="outlined"
                      shape="rounded"
                      size="small"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '0.875rem',
                          padding: '0.25rem',
                        },
                        '@media (min-width: 640px)': {
                          '& .MuiPaginationItem-root': {
                            fontSize: '1rem',
                            padding: '0.5rem',
                          },
                        },
                      }}
                    />
                  </Stack>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SubjectAdminDashboard;
