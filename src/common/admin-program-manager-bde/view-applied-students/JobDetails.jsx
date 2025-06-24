import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../../../reducers/Jobsslice.js';
import {
  ADMIN,
  BDE,
  PROGRAM_MANAGER,
  SUPER_ADMIN,
} from '../../../constants/AppConstants.js';

const JobDetails = () => {
  const { userInfo } = useSelector(state => state.auth);
  const { userType } = userInfo;
  const { job_id } = useParams();
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector(state => state.jobs);
  const [job, setJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(fetchJobs());
    } else {
      const selectedJob = jobs.find(j => j.job_id === job_id);
      setJob(selectedJob || null);
    }
  }, [jobs, job_id, dispatch]);
  const handleViewAppliedStudents = () => {
    if (userType === ADMIN || userType === SUPER_ADMIN) {
      navigate(`/admin/view-applied-students/${job_id}`);
    } else if (userType === PROGRAM_MANAGER) {
      navigate(`/program-manager/view-applied-students/${job_id}`);
    } else if (userType === BDE) {
      navigate(`/bde/view-applied-students/${job_id}`);
    }
  };

  const handleEditJob = () => {
    navigate(`/bde/update-job/${job_id}`);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-4 border-[#00007F] border-solid rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-[#00007F]">
            Loading Job Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 font-inter">
        <p className="text-lg font-semibold text-red-600">
          {error || 'Job not found'}
        </p>
        <button
          onClick={() => navigate('/admin/job-listings')}
          className="mt-4 bg-[#00007F] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#00007F]/90 transition"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-5 font-inter">
      <div className="flex items-center justify-between px-6 py-6 relative">
        <div
          className="absolute left-0 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <svg
            width="38"
            height="39"
            viewBox="0 0 38 39"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.1518 9.88867L5.54102 19.4995L15.1518 29.1103"
              stroke="#2333CB"
              strokeWidth="2.375"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32.458 19.5H5.81055"
              stroke="#2333CB"
              strokeWidth="2.375"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="w-full text-center">
          <h2 className="text-[#00007F] font-semibold text-[30px]">
            Application
          </h2>
        </div>
      </div>
      <div className="w-full bg-white p-6 rounded-[13px]">
        <div>
          <h2 className="font-semibold text-[30px] text-[#252B37]">
            {job.jobRole || 'N/A'}
          </h2>
          <h3 className="font-medium text-[28px] text-[#535862]">
            {job.companyName || 'N/A'}
          </h3>
        </div>
        <div className="text-[20px] text-[#717680] font-semibold space-y-3 mt-3">
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Salary</h2>
            <h2 className="font-medium">
              {job.salary?.includes('LPA')
                ? job.salary
                : `${job.salary} LPA` || 'N/A'}
            </h2>
          </div>
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Location</h2>
            <h2 className="font-medium">{job.jobLocation || 'N/A'}</h2>
          </div>
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Qualification</h2>
            <h2 className="font-medium">
              {job.educationQualification || 'N/A'}
            </h2>
          </div>
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Branch</h2>
            <h2 className="font-medium">
              {job.department?.join(', ') || 'N/A'}
            </h2>
          </div>
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Percentage</h2>
            <h2 className="font-medium">
              {job.percentage ? `${job.percentage}%` : 'N/A'}
            </h2>
          </div>
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Graduate Year</h2>
            <h2 className="font-medium">
              {job.graduates?.join(', ') || 'N/A'}
            </h2>
          </div>
          <div className="grid grid-cols-[200px_1fr]">
            <h2>Bond</h2>
            <h2 className="font-medium">
              {job.bond !== undefined
                ? job.bond > 1
                  ? `${job.bond} Years`
                  : `${job.bond} Year`
                : 'N/A'}
            </h2>
          </div>
        </div>

        <div className="pt-3">
          <div className="flex flex-wrap gap-2">
            {job.technologies?.map((tag, index) => (
              <div
                key={index}
                className="px-4 py-1 text-[#00007F] font-medium bg-[#E7E9FE] rounded-full flex items-center gap-1 text-[18px]"
              >
                <span className="leading-none">•</span>
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-[#E1EFFF] p-4 mt-4 rounded-[13px]">
          <h2 className="text-[#252B37] font-semibold text-[20px]">
            Special Note
          </h2>
          <h2 className="text-[#414651] font-normal text-[18px]">
            {job.specialNote || 'No special note available.'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 pt-4 gap-3">
          <button
            hidden={userType !== BDE}
            onClick={handleViewAppliedStudents}
            className="bg-[#00007F] text-white rounded-[10px] font-medium text-[18px] p-3 hover:bg-[#00007F]/90 transition"
          >
            View Applied Students
          </button>
          <button
            onClick={handleEditJob}
            hidden={userType !== BDE}
            className="bg-[#00007F] text-white rounded-[10px] font-medium text-[18px] p-3 hover:bg-[#00007F]/90 transition"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
