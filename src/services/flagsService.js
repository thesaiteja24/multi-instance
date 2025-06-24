import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFlagsFromService = async () => {
  try {
    const response = await api.get('/flags');
    return response.data;
  } catch (error) {
    console.error('Error fetching flags:', error);
    throw new Error(error.message || 'Failed to fetch flags');
  }
};

export const updateFlagFromService = async (flagKey, enabled) => {
  try {
    const response = await api.post(`/flags/${flagKey}`, { enabled });
    return response.data;
  } catch (error) {
    console.error(`Error updating flag ${flagKey}:`, error);
    throw new Error(error.message || `Failed to update flag ${flagKey}`);
  }
};
