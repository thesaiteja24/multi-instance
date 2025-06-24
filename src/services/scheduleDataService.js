import axios from 'axios';
import { SCHEDULE_DATA_URL } from '../constants/APIURLConstants';

async function getScheduleData(location) {
  try {
    const response = await axios.get(SCHEDULE_DATA_URL, {
      params: { location },
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch schedule data');
    }
  } catch (error) {
    throw error;
  }
}

export { getScheduleData };
