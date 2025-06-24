import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobs } from '../services/commonService.js';
import { resetAllState } from './resetAllSlices.js';

const initialState = {
  jobs: [],
  loading: true,
  error: '',
};

// Async thunk for fetching jobs
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getJobs();
      return response;
    } catch (err) {
      return rejectWithValue('Failed to fetch data from the server.');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchJobs.pending, state => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobs = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default jobsSlice.reducer;
