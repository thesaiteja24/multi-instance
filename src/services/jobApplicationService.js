import axios from 'axios';
import {
  FETCH_JOB_DETAILS_URL,
  FETCH_APPLIED_STUDENTS_URL,
  DOWNLOAD_RESUME_URL,
  UPDATE_JOB_APPLICANTS_URL,
} from '../constants/APIURLConstants';

export const jobApplicationService = {
  getJobDetails: async jobId => {
    try {
      const response = await axios.get(
        `${FETCH_JOB_DETAILS_URL}?job_id=${jobId}`
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to fetch job details');
      }
    } catch (error) {
      throw error;
    }
  },

  getAppliedStudents: async jobId => {
    try {
      const response = await axios.get(
        `${FETCH_APPLIED_STUDENTS_URL}?job_id=${jobId}`
      );
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to fetch applied students details');
      }
    } catch (error) {
      throw error;
    }
  },

  downloadResume: async studentIds => {
    try {
      const response = await axios.post(
        `${DOWNLOAD_RESUME_URL}`,
        { student_ids: studentIds },
        { responseType: 'blob' }
      );
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to download resumes');
      }
    } catch (error) {
      throw error;
    }
  },

  updateJobApplicants: async ({ selectedStudentIds, job_id }) => {
    try {
      const response = await axios.post(`${UPDATE_JOB_APPLICANTS_URL}`, {
        selected_student_ids: selectedStudentIds,
        job_id: job_id,
      });
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to update job applicants');
      }
    } catch (error) {
      throw error;
    }
  },
};
