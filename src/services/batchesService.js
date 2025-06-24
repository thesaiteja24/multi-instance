import axios from 'axios';
import { FETCH_BATCHES_URL } from '../constants/APIURLConstants';

export const getBatchesFromService = async location => {
  if (!location || location === 'SelectLocation') return [];

  try {
    const response = await axios.get(`${FETCH_BATCHES_URL}`, {
      params: { location },
    });
    const data = response.data.data || [];
    return data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw new Error(error.message || 'Failed to fetch batches');
  }
};
