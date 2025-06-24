import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBatchesFromService } from '../services/batchesService';
import { resetAllState } from './resetAllSlices';

const initialState = {
  batchesList: [],
  batchesListLoading: false,
  batchesListError: null,
};

export const getBatches = createAsyncThunk(
  'batches/getBatches',
  async (location, { rejectWithValue }) => {
    try {
      const batchesList = await getBatchesFromService(location);
      return batchesList;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch batches');
    }
  }
);

const batchesSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getBatches.pending, state => {
        state.batchesListLoading = true;
        state.batchesListError = null;
      })
      .addCase(getBatches.fulfilled, (state, action) => {
        state.batchesListLoading = false;
        state.batchesList = action.payload;
      })
      .addCase(getBatches.rejected, (state, action) => {
        state.batchesListLoading = false;
        state.batchesListError = action.payload || 'Failed to fetch batches';
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default batchesSlice.reducer;
