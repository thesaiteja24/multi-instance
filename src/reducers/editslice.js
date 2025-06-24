import { createSlice } from '@reduxjs/toolkit';
import { resetAllState } from './resetAllSlices.js';

const initialState = {
  edit: false,
};

const editslice = createSlice({
  name: 'editslice',
  initialState,
  reducers: {
    setEdit: (state, action) => {
      state.edit = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(resetAllState, () => initialState);
  },
});
export default editslice.reducer;
export const { setEdit } = editslice.actions;
