import axios from 'axios';
import { START_EXAM_URL } from '../constants/APIURLConstants.js';
import { mockData } from '../mock/examData.js';

// API constant for submit exam endpoint
export const SUBMIT_EXAM_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/submit-exam`;

// API constant for code submission endpoint
export const COMPILE_AND_RUN_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/submissions`;

async function startExam(examId, collectionName) {
  try {
    const response = await axios.post(`${START_EXAM_URL}`, {
      examId,
      collectionName,
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to start exam');
    }
  } catch (error) {
    console.error('Error starting exam:', error);
    throw error;
  }
}

async function compileAndRun(payload) {
  try {
    const response = await axios.post(COMPILE_AND_RUN_URL, payload);
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to compile and run code');
    }
  } catch (error) {
    console.error('Error compiling and running code:', error);
    throw error;
  }
}

async function submitExam(payload) {
  try {
    const response = await axios.post(SUBMIT_EXAM_URL, payload);
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to submit exam');
    }
  } catch (error) {
    console.error('Error submitting exam:', error);
    throw error;
  }
}

export { startExam, compileAndRun, submitExam };
