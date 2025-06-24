import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getResume,
  updateResume,
  getStudentDetails,
  getProfilePicture,
  UpdateProfilePicture,
  getStudentsListFromService,
  getStudentsReports,
  getDepartments,
} from '../services/studentService.js';
import { resetAllState } from './resetAllSlices.js';

const initialState = {
  studentDetails: null,
  profilePicture: null,
  resumeUrl: null,
  loading: false,
  error: null,
  resumeLoading: false,
  resumeError: null,
  studentsList: [],
  studentReports: [],
  departments: {},
  departmentsLoading: false,
  departmentsError: null,
};

export const fetchDepartments = createAsyncThunk(
  'student/fetchDepartments',
  async (qualification, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      if (state.student.departments[qualification]) {
        return {
          qualification,
          data: state.student.departments[qualification],
        };
      }
      const response = await getDepartments(qualification);
      if (typeof response !== 'object' || response === null) {
        throw new Error('Invalid department data received');
      }
      const deptArray = response[qualification];
      if (!Array.isArray(deptArray)) {
        throw new Error(
          `No departments found for qualification "${qualification}"`
        );
      }
      return { qualification, data: deptArray };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentDetails = createAsyncThunk(
  'student/fetchStudentDetails',
  async ({ id, location }, { rejectWithValue }) => {
    try {
      if (!id) {
        return [];
      }
      const response = await getStudentDetails(id, location);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProfilePicture = createAsyncThunk(
  'student/fetchProfilePicture',
  async (studentId, { rejectWithValue }) => {
    try {
      const imageUrl = await getProfilePicture(studentId);
      return imageUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  'student/updateProfilePicture',
  async ({ studentId, newFile }, { rejectWithValue, dispatch }) => {
    try {
      const success = await UpdateProfilePicture(studentId, newFile);
      if (success) {
        await dispatch(fetchProfilePicture(studentId)).unwrap();
      }
      return success;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResume = createAsyncThunk(
  'student/fetchResume',
  async (resumeId, { rejectWithValue }) => {
    try {
      const pdfUrl = await getResume(resumeId);
      return pdfUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadResume = createAsyncThunk(
  'student/uploadResume',
  async ({ studentId, file }, { rejectWithValue, dispatch }) => {
    try {
      const success = await updateResume(studentId, file);
      if (success) await dispatch(fetchResume(studentId)).unwrap();
      return success;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const fetchStudentsList = createAsyncThunk(
  'student/fetchStudentsList',
  async (_, { rejectWithValue }) => {
    try {
      const studentsList = await getStudentsListFromService();
      return studentsList;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentReports = createAsyncThunk(
  'student/fetchStudentReports',
  async (stdId, { rejectWithValue }) => {
    try {
      const reports = await getStudentsReports(stdId);
      return reports;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentDetails: (state, action) => {
      state.studentDetails = action.payload;
    },
  },
  extraReducers: builder => {
    // fetchDepartments
    builder
      .addCase(fetchDepartments.pending, state => {
        state.departmentsLoading = true;
        state.departmentsError = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departmentsLoading = false;
        const { qualification, data } = action.payload;
        state.departments = {
          ...state.departments,
          [qualification]: data,
        };
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departmentsLoading = false;
        state.departmentsError =
          action.payload || 'Failed to load departments.';
      });

    // fetchStudentDetails
    builder
      .addCase(fetchStudentDetails.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.studentDetails = action.payload;
        state.studentId = state.studentDetails.studentId;
      })
      .addCase(fetchStudentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to load student details. Please try again.';
        state.studentDetails = [];
      });

    // fetchProfilePicture
    builder
      .addCase(fetchProfilePicture.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.profilePicture = action.payload;
      })
      .addCase(fetchProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to load profile picture. Please try again.';
        state.profilePicture = null;
      });

    // updateProfilePicture
    builder
      .addCase(updateProfilePicture.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, state => {
        state.loading = false;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          'Failed to update profile picture. Please try again.';
      });

    // fetchResume
    builder
      .addCase(fetchResume.pending, state => {
        state.resumeLoading = true;
        state.resumeError = null;
      })
      .addCase(fetchResume.fulfilled, (state, action) => {
        state.resumeLoading = false;
        state.resumeUrl = action.payload;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.resumeLoading = false;
        state.resumeError = action.payload || 'Failed to fetch resume';
        state.resumeUrl = null;
      });

    // uploadResume
    builder
      .addCase(uploadResume.pending, state => {
        state.resumeLoading = true;
        state.resumeError = null;
      })
      .addCase(uploadResume.fulfilled, state => {
        state.resumeLoading = false;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.resumeLoading = false;
        state.resumeError = action.payload || 'Failed to upload resume';
      });

    // fetchStudentsList
    builder
      .addCase(fetchStudentsList.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsList.fulfilled, (state, action) => {
        state.loading = false;
        state.studentsList = action.payload;
      })
      .addCase(fetchStudentsList.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to load students list. Please try again.';
        state.studentsList = [];
      });

    // fetchStudentReports
    builder
      .addCase(fetchStudentReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentReports.fulfilled, (state, action) => {
        state.loading = false;
        state.studentReports = action.payload;
      })
      .addCase(fetchStudentReports.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to load student reports. Please try again.';
        state.studentReports = [];
      })
      .addCase(resetAllState, () => initialState);
  },
});

export const { setStudentDetails } = studentSlice.actions;
export default studentSlice.reducer;
