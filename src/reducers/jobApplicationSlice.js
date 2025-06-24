import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobApplicationService } from '../services/jobApplicationService';
import { resetAllState } from './resetAllSlices';

const initialState = {
  companyName: '',
  jobRole: '',
  appliedStudents: [],
  jobSkills: [],
  departments: [],
  selectedStudents: [],
  rejectedStudents: [],
  selectedDepartments: [],
  customDepartments: [],
  selectedPercentage: '',
  selectedSkills: [],
  selectedLocations: [], // Added to initialState
  batchBlobs: [],
  selectedPassoutYears: [],
  passoutYears: [],
  jsZipLoaded: false,
  loading: false,
  excelName: '',
  resumeName: '',
  error: null,
};

// Async thunk for fetching job details
export const fetchJobDetails = createAsyncThunk(
  'jobApplication/fetchJobDetails',
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await jobApplicationService.getJobDetails(jobId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching applied students
export const fetchAppliedStudents = createAsyncThunk(
  'jobApplication/fetchAppliedStudents',
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await jobApplicationService.getAppliedStudents(jobId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for downloading resumes
export const downloadResume = createAsyncThunk(
  'jobApplication/downloadResume',
  async (studentIds, { rejectWithValue }) => {
    try {
      const data = await jobApplicationService.downloadResume(studentIds);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating job applicants
export const updateJobApplicants = createAsyncThunk(
  'jobApplication/updateJobApplicants',
  async ({ selectedStudentIds, job_id }, { rejectWithValue }) => {
    try {
      const data = await jobApplicationService.updateJobApplicants({
        selectedStudentIds,
        job_id,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const jobApplicationSlice = createSlice({
  name: 'jobApplication',
  initialState,
  reducers: {
    setSelectedDepartments: (state, action) => {
      state.selectedDepartments = action.payload;
    },
    setCustomDepartments: (state, action) => {
      state.customDepartments = action.payload;
    },
    setSelectedPercentage: (state, action) => {
      state.selectedPercentage = action.payload;
    },
    setSelectedSkills: (state, action) => {
      state.selectedSkills = action.payload;
    },
    setSelectedPassoutYears: (state, action) => {
      state.selectedPassoutYears = action.payload;
    },
    setSelectedLocations: (state, action) => {
      state.selectedLocations = action.payload;
    }, // Added reducer for location filter
    setJsZipLoaded: (state, action) => {
      state.jsZipLoaded = action.payload;
    },
    addBatchBlob: (state, action) => {
      state.batchBlobs.push(action.payload);
    },
    clearBatchBlobs: state => {
      state.batchBlobs = [];
    },
  },
  extraReducers: builder => {
    // Handle fetchJobDetails
    builder
      .addCase(fetchJobDetails.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.companyName = action.payload.companyName;
        state.jobRole = action.payload.jobRole;
        state.departments = action.payload.department;
        state.excelName = `${action.payload.companyName}_${action.payload.jobRole}`;
        state.resumeName = `resumes_${action.payload.companyName}_${action.payload.jobRole}`;
        state.passoutYears = action.payload.graduates;
        state.jobSkills = action.payload.jobSkills;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchAppliedStudents
      .addCase(fetchAppliedStudents.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppliedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedStudents = action.payload.students_applied;
        state.departmentList = action.payload.departmentList;
        state.selectedStudents = action.payload.selected_students_ids;
        state.rejectedStudents = action.payload.rejected_students_ids;
      })
      .addCase(fetchAppliedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle downloadResume
      .addCase(downloadResume.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadResume.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(downloadResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updateJobApplicants
      .addCase(updateJobApplicants.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobApplicants.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateJobApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetAllState, () => initialState);
  },
});

export const {
  setSelectedDepartments,
  setCustomDepartments,
  setSelectedPercentage,
  setSelectedSkills,
  setSelectedLocations, // Export the new action
  setJsZipLoaded,
  addBatchBlob,
  clearBatchBlobs,
  setSelectedPassoutYears,
} = jobApplicationSlice.actions;
export default jobApplicationSlice.reducer;
