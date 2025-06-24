import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../reducers/Jobsslice.js';
import { fetchStudentDetails } from '../reducers/studentSlice.js';
import { applyForJob } from '../services/studentService.js';
import Swal from 'sweetalert2';
import CustomScaleLoader from '../ui/CustomScaleLoader.jsx';

const JobDetails = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
  } = useSelector(state => state.jobs);
  const {
    studentDetails,
    loading: studentLoading,
    error: studentError,
  } = useSelector(state => state.student);
  const userInfo = useSelector(state => state.auth.userInfo);
  const id = userInfo.id;
  const location = userInfo.location;
  const navigate = useNavigate();

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(fetchJobs());
    }
  }, [dispatch, studentDetails]);

  const applyJob = async selectedJobId => {
    const job = jobs.find(job => job.job_id === selectedJobId);

    if (!job || !job.isActive) {
      Swal.fire({
        icon: 'error',
        title: 'This job is not active. You cannot apply.',
      });
      return;
    }

    if (studentDetails?.applied_jobs?.includes(selectedJobId)) {
      Swal.fire({
        icon: 'info',
        title: 'Already Applied',
        text: 'You have already applied for this job.',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to apply for this job?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply',
      cancelButtonText: 'Cancel',
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await applyForJob(selectedJobId, studentDetails.id);
          Swal.fire({
            icon: 'success',
            title: 'Job Applied Successfully',
            showConfirmButton: false,
            timer: 3000,
          });
          dispatch(fetchStudentDetails({ id, location }));
          dispatch(fetchJobs());
        } catch (error) {
          if (error.response?.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'Already applied for the job',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'An error occurred while applying',
            });
          }
        }
      }
    });
  };

  // Loading Screen with Inline Animation
  if (jobsLoading || studentLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <style>
          {`
            @layer utilities {
              @keyframes custom-spin {
                to { transform: rotate(360deg); }
              }
              .animate-custom-spin {
                animation: custom-spin 1s linear infinite;
              }
            }
          `}
        </style>

        <div className="flex flex-col items-center gap-4">
          <CustomScaleLoader />
          <p className="text-lg font-semibold text-[var(--color-secondary)] font-['Inter']">
            Loading Job Details...
          </p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (jobsError || studentError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-red-600 font-['Inter']">
          Error: {jobsError || studentError}
        </p>
        <button
          onClick={() => {
            dispatch(fetchJobs());
            dispatch(fetchStudentDetails());
          }}
          className="mt-4 bg-[#19216F] text-white px-4 py-2 rounded-md font-semibold font-['Inter'] hover:bg-[#0f1a5b]"
        >
          Retry
        </button>
      </div>
    );
  }

  const job = jobs.find(j => j.job_id === jobId) || {};
  const isApplied = studentDetails?.applied_jobs?.includes(jobId);

  return (
    <div className="w-full flex flex-col items-center pt-4 px-4 pb-20 mt-0">
      {/* Main Content */}
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-6 justify-center items-end">
        {/* Left Column */}
        <div className="w-full lg:w-[70%] flex flex-col">
          <div className="grid grid-cols-[10%_80%] items-center">
            <button
              className="ext-xl sm:text-2xl font-semibold font-['Inter']"
              onClick={() => navigate('/student/job-listings')}
            >
              {'<- Back'}
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold font-['Inter'] text-[var(--color-primary)] text-center mb-6 mt-6">
              Job Details
            </h1>
          </div>

          {/* Job Info Card */}
          <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-t-[20px] pb-4 sm:pb-6">
            {/* Job Role, Deadline, Button */}
            <div className="w-full flex flex-col sm:flex-row flex-wrap justify-between rounded-t-[20px] pr-4 pl-4 bg-[var(--color-secondary)] py-4 items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-col p-3 sm:flex-row items-start sm:items-center gap-2">
                <span className="text-[#FFFFFF] text-lg sm:text-xl font-bold font-['Inter']">
                  Job Role:
                </span>
                <span className="text-[#FFFFFF] text-lg sm:text-xl font-bold font-['Inter']">
                  {job.jobRole || 'N/A'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-[#FFFFFF] text-lg sm:text-xl font-bold font-['Inter']">
                  Deadline:
                </span>
                <span className="text-[#FFFFFF] text-lg sm:text-xl font-bold font-['Inter']">
                  {job.deadLine
                    ? new Date(job.deadLine).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>

              <button
                onClick={() => applyJob(job.job_id)}
                className={`px-5 py-2 rounded-md text-sm sm:text-base font-semibold font-['Inter'] whitespace-nowrap ${
                  isApplied || !job.isActive
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#FFFFFF] text-[--color-secondary] hover:bg-[--color-primary] hover:border hover:border-white hover:text-white'
                }`}
                disabled={isApplied || !job.isActive}
              >
                {isApplied ? 'Applied' : 'Apply Now'}
              </button>
            </div>

            {/* Info Grid */}
            <div className="w-full flex flex-col md:flex-row gap-6">
              {/* Left Info */}
              <div className="w-full md:w-1/2 p-4 text-base font-['Inter'] text-black leading-[30px]">
                {[
                  ['Job ID:', job.job_id || 'N/A'],
                  ['Company Name:', job.companyName || 'N/A'],
                  ['Job Location:', job.jobLocation || 'N/A'],
                  ['Salary:', job.salary ? `${job.salary} LPA` : 'N/A'],
                  ['Technologies:', job.technologies?.join(', ') || 'N/A'],
                ].map(([label, value], index) => (
                  <div className="mb-4" key={index}>
                    <p className="text-[var(--color-secondary)] font-medium text-lg">
                      {label}
                    </p>
                    <p className="text-gray-600">{value}</p>
                  </div>
                ))}
              </div>

              {/* Right Info */}
              <div className="w-full md:w-1/2 text-base font-['Inter'] text-black leading-[30px]">
                {[
                  [
                    'Education Qualification:',
                    job.educationQualification || 'N/A',
                  ],
                  ['Department:', job.department?.join(', ') || 'N/A'],
                  ['Graduates:', job.graduates?.join(', ') || 'N/A'],
                  [
                    'Percentage:',
                    job.percentage ? `${job.percentage}%` : 'N/A',
                  ],
                  [
                    'Bond:',
                    job.bond !== undefined
                      ? `${job.bond} Year${job.bond !== 1 ? 's' : ''}`
                      : 'N/A',
                  ],
                ].map(([label, value], index) => (
                  <div className="mb-4" key={index}>
                    <p className="text-[var(--color-secondary)] font-medium text-lg">
                      {label}
                    </p>
                    <p className="text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Note */}
          <div className="relative z-0 -mt-3">
            <div className="bg-[var(--color-secondary)] p-4 sm:p-6 rounded-[20px] shadow-lg">
              <h2 className="text-white text-lg sm:text-xl font-bold font-['Inter'] mb-2 leading-[30px]">
                Special Note:
              </h2>
              <p className="text-white text-sm sm:text-base font-['Inter'] leading-[28px]">
                {job.specialNote || 'No special note available.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="hidden lg:flex w-full lg:w-[30%] justify-center items-start pt-4 mt-10">
          <img
            src="/Joblist/jobviewer.png"
            alt="Job Illustration"
            className="w-full max-w-[400px] h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
