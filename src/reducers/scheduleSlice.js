import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getScheduleData } from '../services/scheduleDataService.js';
import { resetAllState } from './resetAllSlices.js';

// Async thunk to fetch schedule and mentor data
export const fetchScheduleData = createAsyncThunk(
  'schedule/fetchScheduleData',
  async (location, { rejectWithValue }) => {
    try {
      const data = await getScheduleData(location);
      return {
        schedule: data.schedule_data || [],
        mentors: data.mentor_data || [],
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch schedule data');
    }
  }
);

const initialState = {
  schedule: [],
  mentors: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    resetSchedule: state => {
      state.schedule = [];
      state.mentors = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchScheduleData.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchScheduleData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedule = action.payload.schedule;
        state.mentors = action.payload.mentors;
        state.error = null;
      })
      .addCase(fetchScheduleData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(resetAllState, () => initialState);
  },
});

export const { resetSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;
