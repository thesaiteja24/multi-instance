import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  dashboardData: {
    companiesList: {},
    collegesList: {},
    yearOFPlacement: {},
  },
  loading: true,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, thunkAPI) => {
    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/refreshdashboard`;
    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      return {
        companiesList: data.COMPANIES || {},
        collegesList: data.COLLEGES_LIST || {},
        yearOFPlacement: data.YOP_DICT || {},
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDashboardData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.dashboardData = {
          companiesList: {},
          collegesList: {},
          yearOFPlacement: {},
        };
      });
  },
});

export default dashboardSlice.reducer;
