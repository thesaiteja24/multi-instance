import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMentorStudentsList } from '../services/mentorService';
import { resetAllState } from './resetAllSlices';

const initialState = {
  studentsList: [],
  mentorData: [],
  scheduleData: [],
  classes: [],
  mentorStudentsListLoading: false,
  mentorStudentsListError: null,
};

export const getMentorStudentsThunk = createAsyncThunk(
  'mentorStudents/getMentorStudentsThunk',
  async ({ location, mentorId, selectedBatch }, { rejectWithValue }) => {
    try {
      const studentsList = await getMentorStudentsList(
        location,
        mentorId,
        selectedBatch
      );
      return studentsList;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch students list');
    }
  }
);

const mentorStudentsSlice = createSlice({
  name: 'mentorStudents',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getMentorStudentsThunk.pending, state => {
        state.mentorStudentsListLoading = true;
        state.mentorStudentsListError = null;
      })
      .addCase(getMentorStudentsThunk.fulfilled, (state, action) => {
        state.mentorStudentsListLoading = false;
        state.studentsList = action.payload.student_data;
        state.mentorData = action.payload.mentor_data;
        state.scheduleData = action.payload.schedule_data;
        state.classes = action.payload.classes;
      })
      .addCase(getMentorStudentsThunk.rejected, (state, action) => {
        state.mentorStudentsListLoading = false;
        state.mentorStudentsListError =
          action.payload || 'Failed to fetch mentor students list';
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default mentorStudentsSlice.reducer;
