import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import examReportService from '../services/examReportService';
import { resetAllState } from './resetAllSlices';

const getDefaultDate = () => {
  const today = new Date();
  // If today is Sunday, set to Friday; otherwise, set to yesterday
  if (today.getDay() === 0) {
    today.setDate(today.getDate() - 2);
  } else {
    today.setDate(today.getDate() - 1);
  }
  return today.toISOString().split('T')[0];
};

const initialState = {
  examReport: {
    location_stats: {},
    batches: [],
    total_allocated_students: 0,
    total_attempted_students: 0,
    total_not_attempted: 0,
    total_batches: 0,
  },
  examReportLoading: false,
  examReportError: null,
  noData: false,
  batchFilter: '',
  locationFilter: '',
  selectedDate: getDefaultDate(),
  reportDate: null, // Tracks the date of the current examReport data
};

export const getExamReport = createAsyncThunk(
  'examReport/getExamReport',
  async ({ date, location }, { rejectWithValue }) => {
    try {
      const data = await examReportService(date, location);
      if (
        !data ||
        !data.locations ||
        Object.keys(data.locations).length === 0
      ) {
        return { noData: true, date };
      }

      // Transform the API response to match the component's data structure
      const transformedData = {
        location_stats: Object.keys(data.locations).reduce((acc, loc) => {
          acc[loc] = {
            allocated: data.locations[loc].total_allocated,
            attempted: data.locations[loc].total_attempted,
            non_attempted: data.locations[loc].total_not_attempted,
          };
          return acc;
        }, {}),
        batches: Object.values(data.locations).flatMap(loc =>
          loc.batches.map(batch => ({
            ...batch,
            location: Object.keys(data.locations).find(key =>
              data.locations[key].batches.includes(batch)
            ),
          }))
        ),
        total_allocated_students: data.total_allocated_students,
        total_attempted_students: data.total_attempted_students,
        total_not_attempted: data.total_not_attempted,
        total_batches: data.total_batches,
      };

      return { ...transformedData, noData: false, date };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch exam report');
    }
  }
);

const examReportSlice = createSlice({
  name: 'examReport',
  initialState,
  reducers: {
    setBatchFilter: (state, action) => {
      state.batchFilter = action.payload;
    },
    setLocationFilter: (state, action) => {
      state.locationFilter = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getExamReport.pending, state => {
        state.examReportLoading = true;
        state.examReportError = null;
        state.noData = false;
      })
      .addCase(getExamReport.fulfilled, (state, action) => {
        state.examReportLoading = false;
        state.reportDate = action.payload.date; // Store the date of the report
        if (action.payload.noData) {
          state.noData = true;
          state.examReport = initialState.examReport;
        } else {
          state.examReport = {
            location_stats: action.payload.location_stats,
            batches: action.payload.batches,
            total_allocated_students: action.payload.total_allocated_students,
            total_attempted_students: action.payload.total_attempted_students,
            total_not_attempted: action.payload.total_not_attempted,
            total_batches: action.payload.total_batches,
          };
          state.noData = false;
        }
      })
      .addCase(getExamReport.rejected, (state, action) => {
        state.examReportLoading = false;
        state.examReportError = action.payload || 'Failed to fetch exam report';
        state.noData = false;
        state.reportDate = null;
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default examReportSlice.reducer;
export const { setBatchFilter, setLocationFilter, setSelectedDate } =
  examReportSlice.actions;
