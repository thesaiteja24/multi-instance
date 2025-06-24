import axios from 'axios';
import { MENTOR_STUDENTS_LIST_URL } from '../constants/APIURLConstants';

async function getMentorStudentsList(location, mentorId, batch) {
  try {
    const response = await axios.get(`${MENTOR_STUDENTS_LIST_URL}`, {
      params: { location, mentorId, batch },
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch mentor students list');
    }
  } catch (error) {
    throw error;
  }
}

export { getMentorStudentsList };
