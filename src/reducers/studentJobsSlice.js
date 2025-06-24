import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStudentJobs } from '../services/commonService.js';
import { resetAllState } from './resetAllSlices.js';

const initialState = {
  jobs: [],
  loading: true,
  error: '',
};

export const fetchStudentJobsThunk = createAsyncThunk(
  'studentJobs/fetchStudentJobs',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await fetchStudentJobs(studentId);
      return response;
    } catch (err) {
      return rejectWithValue('Failed to fetch student jobs from the server.');
    }
  }
);

const studentJobsSlice = createSlice({
  name: 'studentJobs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchStudentJobsThunk.pending, state => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchStudentJobsThunk.fulfilled, (state, action) => {
        state.jobs = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudentJobsThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default studentJobsSlice.reducer;
