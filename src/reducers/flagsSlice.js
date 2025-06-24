import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getFlagsFromService,
  updateFlagFromService,
} from '../services/flagsService';
import { resetAllState } from './resetAllSlices';

const initialState = {
  flags: {
    flagcodePlayground: false,
  },
  codePlaygroundStatus: true,
  flagsLoading: true,
  flagsError: null,
};

export const getFlags = createAsyncThunk(
  'flags/getFlags',
  async (_, { rejectWithValue }) => {
    try {
      const flagsData = await getFlagsFromService();
      return flagsData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch flags');
    }
  }
);

export const updateFlag = createAsyncThunk(
  'flags/updateFlag',
  async ({ flagKey, enabled }, { rejectWithValue }) => {
    try {
      const updatedFlag = await updateFlagFromService(flagKey, enabled);
      return { flagKey, enabled: updatedFlag.enabled ?? enabled };
    } catch (error) {
      return rejectWithValue(
        error.message || `Failed to update flag ${flagKey}`
      );
    }
  }
);

const flagsSlice = createSlice({
  name: 'flags',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getFlags.pending, state => {
        state.flagsLoading = true;
        state.flagsError = null;
      })
      .addCase(getFlags.fulfilled, (state, action) => {
        state.flagsLoading = false;
        state.flags = { flagcodePlayground: action.payload.flagcodePlayground };
        state.codePlaygroundStatus = action.payload.flagcodePlayground;
      })
      .addCase(getFlags.rejected, (state, action) => {
        state.flagsLoading = false;
        state.flagsError = action.payload || 'Failed to fetch flags';
      })
      .addCase(updateFlag.pending, state => {
        state.flagsLoading = true;
        state.flagsError = null;
      })
      .addCase(updateFlag.fulfilled, (state, action) => {
        state.flagsLoading = false;
        const { flagKey, enabled } = action.payload;
        state.flags = { ...state.flags, [flagKey]: enabled };
        if (flagKey === 'flagcodePlayground') {
          state.codePlaygroundStatus = enabled;
        }
      })
      .addCase(updateFlag.rejected, (state, action) => {
        state.flagsLoading = false;
        state.flagsError = action.payload || 'Failed to update flag';
      })
      .addCase(resetAllState, () => initialState);
  },
});

export default flagsSlice.reducer;
