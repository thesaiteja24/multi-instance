import axios from 'axios';
import {
  FETCH_STUDENT_DETAILS_URL,
  PROFILE_PIC_OPERATIONS_URL,
  GET_STUDENTS_LIST_URL,
  STUDENTS_REPORT_URL,
  RESUME_OPERATIONS_URL,
  ATS_OPERATIONS_URL,
  GET_AVAILABLE_EXAMS_URL,
  LEAVER_REQUEST_OPERATIONS_URL,
  GET_DEPARTMENTS_URL,
  JOB_APPLY_URL,
  MANAGER_STUDENTS_DATA_URL,
} from '../constants/APIURLConstants.js';
import { getHeaders } from './headers.js';

async function getDepartments(branchName) {
  try {
    const response = await axios.get(
      `${GET_DEPARTMENTS_URL}?branch=${branchName}`,
      { headers: getHeaders() }
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch departments');
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
}

async function getStudentsListFromService() {
  try {
    const response = await axios.get(GET_STUDENTS_LIST_URL, {
      headers: getHeaders(),
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch students list');
    }
  } catch (error) {
    console.error('Error fetching students list:', error);
    throw error;
  }
}

async function getStudentsReports(stdId) {
  try {
    const response = await axios.get(`${STUDENTS_REPORT_URL}?stdId=${stdId}`, {
      headers: getHeaders(),
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch students report');
    }
  } catch (error) {
    console.error('Error fetching students report:', error);
    throw error;
  }
}

async function getStudentDetails(student_id, location) {
  try {
    const response = await axios.get(FETCH_STUDENT_DETAILS_URL, {
      params: { student_id, location },
      headers: getHeaders(),
    });
    if (response.status === 200 && response.data) {
      return response.data || { studentSkills: [] };
    } else {
      throw new Error('Failed to fetch student details');
    }
  } catch (error) {
    throw error;
  }
}

async function getProfilePicture(student_id) {
  try {
    const response = await axios.get(PROFILE_PIC_OPERATIONS_URL, {
      params: { student_id },
      responseType: 'blob',
      headers: getHeaders(),
    });
    if (response.status === 200) {
      const contentType = response.headers['content-type'];
      if (contentType.startsWith('image/')) {
        return URL.createObjectURL(response.data);
      } else {
        console.warn(`Unsupported content type: ${contentType}`);
        return '/logo.png';
      }
    } else {
      console.warn('Non-200 response:', response.status);
      return '/logo.png';
    }
  } catch (error) {
    console.error(
      'Error fetching profile picture:',
      error.message,
      error.response?.status,
      error.response?.data
    );
    return '/logo.png';
  }
}

async function UpdateProfilePicture(studentId, newFile) {
  try {
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('profilePic', newFile);

    const response = await axios.post(PROFILE_PIC_OPERATIONS_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return true;
    } else {
      throw new Error('Failed to update profile picture');
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
}

async function getResume(resumeId) {
  try {
    const response = await axios.get(RESUME_OPERATIONS_URL, {
      params: { resumeId },
      responseType: 'blob',
      headers: getHeaders(),
    });
    if (response.status === 200) {
      const contentType = response.headers['content-type'];
      if (contentType.includes('application/pdf')) {
        return URL.createObjectURL(response.data);
      } else {
        throw new Error(`Unsupported file type: ${contentType}`);
      }
    } else {
      throw new Error('Failed to fetch resume');
    }
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
}

async function updateResume(studentId, file) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('student_id', studentId);

  const headers = { ...getHeaders() };
  delete headers['Content-Type'];
  delete headers['content-type'];

  try {
    const { status, data } = await axios.post(RESUME_OPERATIONS_URL, formData, {
      headers,
    });

    if (status === 200) return true;
    throw new Error(data?.message || 'Failed to update resume');
  } catch (err) {
    console.error(
      'Error updating resume:',
      err?.response?.status,
      err?.message
    );
    throw new Error(
      err?.response?.data?.message || err?.message || 'Failed to update resume'
    );
  }
}

async function getResumeScore(studentId) {
  try {
    const response = await axios.get(ATS_OPERATIONS_URL, {
      params: { student_id: studentId },
      headers: getHeaders(),
    });
    if (response.status === 200 && response.data?.Resume_data) {
      return response.data.Resume_data;
    } else {
      throw new Error('Failed to fetch resume score');
    }
  } catch (error) {
    console.error('Error fetching resume score:', error);
    throw error;
  }
}

async function checkResumeATS(studentId, resume) {
  try {
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('student_id', studentId);

    const response = await axios.post(ATS_OPERATIONS_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getHeaders(),
      },
    });

    if (response.status === 200) {
      return true;
    } else {
      throw new Error('Failed to send resume to ATS check');
    }
  } catch (error) {
    console.error('Error sending resume to ATS API:', error);
    throw error;
  }
}

async function updateStudentProfile(data, profileStatus) {
  try {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'studentSkills' && Array.isArray(data[key])) {
        data[key].forEach(skill => {
          if (skill) formData.append('studentSkills[]', skill);
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const method = profileStatus ? 'put' : 'post';
    const response = await axios({
      method,
      url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating student profile:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    throw new Error(
      error.response?.data?.message ||
        'Failed to update student profile. Please try again.'
    );
  }
}

async function getLeaveRequests(studentId, location) {
  try {
    const response = await axios.get(LEAVER_REQUEST_OPERATIONS_URL, {
      params: { studentId, location },
      headers: getHeaders(),
    });
    if (response.status === 200 && response.data?.leaves) {
      return response.data.leaves;
    } else {
      throw new Error('Failed to fetch leave requests');
    }
  } catch (error) {
    console.error(
      'Error fetching leave requests:',
      error.response?.status,
      error.message
    );
    throw error;
  }
}

async function submitLeaveRequest(payload) {
  try {
    const response = await axios.post(LEAVER_REQUEST_OPERATIONS_URL, payload, {
      headers: getHeaders(),
    });
    if (response.status === 200 || response.status === 201) {
      return true;
    } else {
      throw new Error('Failed to submit leave request');
    }
  } catch (error) {
    console.error(
      'Error submitting leave request:',
      error.response?.status,
      error.message
    );
    throw error;
  }
}

async function getAvailableExams(studentId) {
  try {
    const response = await axios.get(GET_AVAILABLE_EXAMS_URL, {
      params: { studentId },
      headers: getHeaders(),
    });
    if (
      response.status === 200 &&
      response.data?.success &&
      response.data?.exams?.['Daily-Exam']
    ) {
      return response.data.exams['Daily-Exam'];
    } else {
      throw new Error(response.data?.message || 'No exams found');
    }
  } catch (error) {
    console.error(
      'Error fetching available exams:',
      error.response?.status,
      error.message
    );
    throw error;
  }
}

async function applyForJob(jobId, studentId) {
  try {
    const response = await axios.post(
      JOB_APPLY_URL,
      { job_id: jobId, student_id: studentId },
      { headers: getHeaders() }
    );
    if (response.status === 200) {
      return true;
    } else {
      throw new Error('Failed to apply for job');
    }
  } catch (error) {
    console.error(
      'Error applying for job:',
      error.response?.status,
      error.message
    );
    throw error;
  }
}

async function getStudentsDataByLocation(location) {
  try {
    const response = await axios.get(
      `${MANAGER_STUDENTS_DATA_URL}?location=${location}`,
      { headers: getHeaders() }
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch student data');
    }
  } catch (error) {
    throw error;
  }
}

export {
  getStudentsListFromService,
  getStudentsReports,
  getStudentDetails,
  getProfilePicture,
  getResume,
  getResumeScore,
  getLeaveRequests,
  getAvailableExams,
  applyForJob,
  submitLeaveRequest,
  updateStudentProfile,
  UpdateProfilePicture,
  updateResume,
  checkResumeATS,
  getDepartments,
  getStudentsDataByLocation,
};
