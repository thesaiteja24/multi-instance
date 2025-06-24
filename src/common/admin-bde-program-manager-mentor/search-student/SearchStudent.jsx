import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import StudentDetailsManager from './StudentDetailsManager';
import axios from 'axios';
import AppliedJobsManager from './AppliedJobsManager';
import EligibleJobsManager from './EligibleJobsManager';
import AttendenceOverviewManager from './AttendenceOverviewManager';
import ExamsDetailsManager from './ExamsDetailsManager';
import { useSelector } from 'react-redux';

const tabs = [
  'Student Details',
  // 'Applied Jobs',
  // 'Eligible Jobs',
  'Attendance Overview',
  'Exams Details',
];

const SearchStudent = () => {
  const [activeTab, setActiveTab] = useState('Student Details');
  const [appliedJobs, setAppliedJobs] = useState('');
  const [examDetails, setExamDetails] = useState('');
  const [attendanceOverview, setAttendanceOverview] = useState('');
  const [eligibleJobs, setEligibleJobs] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [lastSearchedInput, setLastSearchedInput] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gender, setgender] = useState('');

  const { userInfo } = useSelector(state => state.auth);
  const userType = userInfo?.userType;
  const location = userInfo?.location;

  const handleSearch = async () => {
    const trimmedInput = searchInput.trim().toUpperCase();
    // Validate input
    if (!trimmedInput) {
      setError('Please enter a valid student number or name.');
      setStudentData(null);
      return;
    }

    // Avoid duplicate API call
    if (trimmedInput === lastSearchedInput) {
      setError('You already searched this student.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let response;
      // Manager uses a GET request with studentId and location as query params
      const apiUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/searchstudent?studentId=${trimmedInput}&location=${location}`;
      response = await axios.get(apiUrl);

      setStudentData(response.data.student_data);
      setgender(response.data.student_data.gender);
      setProfile(response.data.profile);
      setAppliedJobs(response.data.applied_jobs_details);
      setEligibleJobs(response.data.eligible_jobs_details);
      setAttendanceOverview(response.data.Attendance);
      setExamDetails(response.data.Exam_Results);
      setLastSearchedInput(trimmedInput); // Update only on success
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Student not found. Please try again.');
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  const SpinnerIcon = () => (
    <svg
      className="animate-spin h-1 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
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
  );

  return (
    <div className="font-[poppins] flex flex-col  max-w-full   max-h-[70vh]  px-4">
      <h1 className="font-semibold uppercase text-[var(--color-secondary)] text-center text-xl sm:text-2xl md:text-3xl lg:text-[22px] py-3">
        Search Student
      </h1>
      {/* <div className="border-t border-[#D1D1D1] w-[90%] max-w-[1695px] my-2"></div> */}

      <div className="w-[100%] max-w-full rounded-lg px-2 py-4">
        {/* Search Input */}
        <div className="flex justify-center w-full">
          <div className="flex w-full max-w-[100%] sm:max-w-[70%] h-[60px] mb-5">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="Enter Student Number / Name..."
              className="flex-1 w-[50%] h-[80%] bg-[#FFFFFF] rounded-l-[20px] px-3 outline-none text-base placeholder:text-base placeholder:font-normal"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[var(--color-secondary)]  w-[30%] h-[80%] lg:w-[20%]  lg:h-[80%] text-white rounded-r-[20px] font-semibold px-9 text-[16px] sm:text-[22px] flex items-center justify-center gap-2"
            >
              {loading ? <SpinnerIcon /> : <FaSearch className="text-[22px]" />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {error && (
          <div className="flex justify-center mb-4">
            <p className="text-red-600 font-medium text-center">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="w-full max-w-full mx-auto rounded-t-[20px]   shadow-[0px_4px_20px_#B3BAF7] ">
          <div
            className="flex h-[50px]   rounded-t-[20px]    overflow-x-auto scrollbar-hide"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #00007F 0%, #0920F5 100%)',
            }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab;
              const showBadge =
                (tab === 'Applied Jobs' &&
                  appliedJobs?.length > 0 &&
                  isActive) ||
                (tab === 'Eligible Jobs' &&
                  eligibleJobs?.length > 0 &&
                  isActive);

              const count =
                tab === 'Applied Jobs'
                  ? appliedJobs?.length
                  : tab === 'Eligible Jobs'
                    ? eligibleJobs?.length
                    : null;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
        flex-1 min-w-[150px] flex items-center justify-center gap-2 font-semibold
        text-[12px] sm:text-[12px] md:text-[16px] lg:text-[16px] leading-[28px] rounded-t-[20px]
        ${isActive ? 'text-[var(--color-secondary)]' : 'text-white'}
      `}
                  style={
                    isActive
                      ? {
                          background: '#FFFFFF',
                          border: '1px solid #00007F',
                          height: '50px',
                        }
                      : { height: '50px' }
                  }
                >
                  <span className="flex items-center gap-2">
                    {tab}
                    {showBadge && (
                      <span className="bg-[#] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="sm:min-h-[461px] md:min-h-[461px] lg:min-h-[361px] bg-white  rounded-b-lg box-border">
            <div className="md:p-3 lg:p-3 sm:p-1">
              {activeTab === 'Student Details' && (
                <StudentDetailsManager data={studentData} profile={profile} />
              )}
              {/* {activeTab === 'Applied Jobs' && (
                <AppliedJobsManager data={appliedJobs} gender={gender} />
              )}
              {activeTab === 'Eligible Jobs' && (
                <EligibleJobsManager data={eligibleJobs} gender={gender} />
              )} */}
              {activeTab === 'Attendance Overview' && (
                <AttendenceOverviewManager data={attendanceOverview} />
              )}
              {activeTab === 'Exams Details' && (
                <ExamsDetailsManager data={examDetails} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchStudent;
