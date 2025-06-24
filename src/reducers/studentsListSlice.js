import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getStudentsListFromService,
  getStudentsDataByLocation,
} from '../services/studentService';
import { resetAllState } from './resetAllSlices';

const initialState = {
  studentsList: [],
  studentsByLoc: [],
  studentsListLoading: false,
  studentsListError: null,
};

export const getStudentsList = createAsyncThunk(
  'studentsList/getStudentsList',
  async (_, { rejectWithValue }) => {
    try {
      const studentsList = await getStudentsListFromService();
      return studentsList;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch students list');
    }
  }
);

export const getStudentsByLoc = createAsyncThunk(
  'studentsList/getStudentsDataByLocation',
  async (location, { rejectWithValue }) => {
    try {
      const studentsData = await getStudentsDataByLocation(location);
      return studentsData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch students data');
    }
  }
);

const studentsListSlice = createSlice({
  name: 'studentsList',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getStudentsList.pending, state => {
        state.studentsListLoading = true;
        state.studentsListError = null;
      })
      .addCase(getStudentsList.fulfilled, (state, action) => {
        state.studentsListLoading = false;
        state.studentsList = action.payload;
      })
      .addCase(getStudentsList.rejected, (state, action) => {
        state.studentsListLoading = false;
        state.studentsListError =
          action.payload || 'Failed to fetch students list';
      })
      .addCase(getStudentsByLoc.pending, state => {
        state.studentsListLoading = true;
        state.studentsListError = null;
      })
      .addCase(getStudentsByLoc.fulfilled, (state, action) => {
        state.studentsListLoading = false;
        state.studentsByLoc = action.payload;
      })
      .addCase(getStudentsByLoc.rejected, (state, action) => {
        state.studentsListLoading = false;
        state.studentsListError =
          action.payload || 'Failed to fetch students data';
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default studentsListSlice.reducer;
