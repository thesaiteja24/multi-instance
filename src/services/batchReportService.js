import axios from 'axios';
import { BATCH_REPORT_URL } from '../constants/APIURLConstants';

export default async function batchReportService(date, batchId, location) {
  try {
    const response = await axios.get(
      `${BATCH_REPORT_URL}?date=${date}&batch=${batchId}&location=${location}`
    );
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Failed to fetch batch report');
    }
  } catch (error) {
    console.error('Error fetching batch report:', error);
    throw error;
  }
}
