import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, logoutUser } from '../services/authService';

const persistedUserInfo = JSON.parse(sessionStorage.getItem('userInfo'));

const initialState = {
  isAuthenticated: !!persistedUserInfo,
  userInfo: persistedUserInfo || {},
  loginError: null,
  isLoggingIn: false,
  loginStatus: null,
  loginMessage: null,
  isLoggingOut: false,
  logoutStatus: null,
};

export const loginUserThunk = createAsyncThunk(
  'auth/loginUserThunk',
  async ({ url, payload }, { rejectWithValue }) => {
    try {
      const { status, message, userInfo } = await loginUser(url, payload);
      const userObj = {
        id: userInfo.id,
        profileStatus: userInfo.profileStatus || null,
        userType: userInfo.userType,
        email: userInfo.email,
        location: userInfo.location,
      };
      sessionStorage.setItem('userInfo', JSON.stringify(userObj));
      return { userObj, status, message };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUserThunk',
  async () => {
    try {
      // TODO: Uncomment this when the backend JWT is ready and the logout endpoint is implemented
      // TODO: Also need to clear the JWT token from the backend and the session storage
      // await logoutUser();
      sessionStorage.removeItem('userInfo');
      return { status: 200, message: 'Logged out successfully' };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // New reducer to set profileStatus
    setProfileStatus: (state, action) => {
      state.userInfo = {
        ...state.userInfo,
        profileStatus: action.payload, // Update profileStatus with the payload value
      };
      // Persist updated userInfo to sessionStorage
      sessionStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUserThunk.pending, state => {
        state.isLoggingIn = true;
        state.loginError = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        const { message, userObj } = action.payload;
        state.isAuthenticated = true;
        state.userInfo = userObj;
        state.loginStatus = 200;
        state.loginMessage = message;
        state.isLoggingIn = false;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loginError = action.payload || 'Failed to login';
        state.isLoggingIn = false;
      })
      .addCase(logoutUserThunk.pending, state => {
        state.isLoggingOut = true;
      })
      .addCase(logoutUserThunk.fulfilled, (state, action) => {
        state.userInfo = null;
        state.isAuthenticated = false;
        state.isLoggingOut = false;
        state.loginStatus = action.payload.status;
        state.loginMessage = action.payload.message;
        state.logoutStatus = 200;
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.isAuthenticated = true;
        state.isLoggingOut = false;
        state.logoutStatus = action.payload.status;
      });
  },
});

export default authSlice.reducer;
export const { setProfileStatus } = authSlice.actions; // Export the new action
