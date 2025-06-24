import axios from 'axios';
import { EXAM_REPORT_URL } from '../constants/APIURLConstants';

export default async function examReportService(date, location = 'all') {
  try {
    const response = await axios.get(
      `${EXAM_REPORT_URL}?date=${date}&location=${location}`,
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch exam report');
    }
  } catch (error) {
    console.error('Error fetching exam report:', error);
    throw error;
  }
}
