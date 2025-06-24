import axios from 'axios';
import { SERVER_TIME_URL } from '../constants/APIURLConstants';

export default async function fetchServerTime() {
  try {
    const response = await axios.get(`${SERVER_TIME_URL}`);
    if (response.status === 200 && response.data && response.data.server_time) {
      return response.data.server_time;
    } else {
      throw new Error('Failed to fetch server time');
    }
  } catch (error) {
    console.error('Error fetching server time:', error);
    throw error;
  }
}
