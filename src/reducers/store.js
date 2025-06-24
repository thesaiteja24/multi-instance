import { configureStore } from '@reduxjs/toolkit';
import examModuleSlice from './examModuleSlice';
import examReportSlice from './examReportSlice';
import editslice from './editslice';
import dashboardSlice from './dashboardhome';
import studentsListSlice from './studentsListSlice';
import jobsslice from './Jobsslice';
import studentJobsSlice from './studentJobsSlice';
import mentorStudentsSlice from './mentorStudentsSlice';
import scheduleReducer from '../reducers/scheduleSlice';
import jobApplication from './jobApplicationSlice';
import studentSlice from './studentSlice';
import batchesSlice from './batchesSlice';
import authSlice from './authSlice';
import flagsSlice from './flagsSlice';

const store = configureStore({
  reducer: {
    examModule: examModuleSlice,
    flags: flagsSlice,
    editslice: editslice,
    dashboard: dashboardSlice,
    studentsList: studentsListSlice,
    jobs: jobsslice,
    studentJobs: studentJobsSlice,
    mentorStudents: mentorStudentsSlice,
    schedule: scheduleReducer,
    jobApplication: jobApplication,
    student: studentSlice,
    batches: batchesSlice,
    auth: authSlice,
    examReport: examReportSlice,
  },
});

export default store;
