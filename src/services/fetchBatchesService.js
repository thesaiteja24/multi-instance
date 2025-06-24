import axios from 'axios';
import { FETCH_BATCHES_URL } from '../constants/APIURLConstants';

// In-memory cache object to store responses
const cache = new Map();
// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function fetchBatches(location) {
  if (!location || location === 'SelectLocation') return [];

  // Generate cache key based on location
  const cacheKey = `batches_${location}`;

  // Check if response exists in cache and is not expired
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    const { data, timestamp } = cachedData;
    const now = Date.now();
    if (now - timestamp < CACHE_TTL) {
      return data;
    } else {
      // Remove expired cache entry
      cache.delete(cacheKey);
    }
  }

  try {
    const response = await axios.get(`${FETCH_BATCHES_URL}`, {
      params: { location },
    });
    const data = response.data.data || [];

    // Store response in cache with current timestamp
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
}

// Optional: Function to manually clear the cache
export function clearBatchesCache() {
  cache.clear();
}
