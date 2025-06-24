import axios from 'axios';
import { GET_JOBS_URL } from '../constants/APIURLConstants.js';

async function getJobs() {
  try {
    const response = await axios.get(`${GET_JOBS_URL}`);
    if (response.status === 200 && response.data) {
      return response.data.jobs;
    } else {
      throw new Error('Failed to fetch jobs');
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

async function fetchStudentJobs(studentId) {
  try {
    const response = await axios.post(`${GET_JOBS_URL}`, { studentId });
    if (response.status === 200 && response.data) {
      return response.data.jobs;
    } else {
      throw new Error('Failed to fetch student jobs');
    }
  } catch (error) {
    console.error('Error fetching student jobs:', error);
    throw error;
  }
}

export { getJobs, fetchStudentJobs };
