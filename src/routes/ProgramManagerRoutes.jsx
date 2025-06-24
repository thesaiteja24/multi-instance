import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { PROGRAM_MANAGER } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';

// Lazy load components
const ProgramManagerDashboard = lazy(
  () => import('../program-manager-module/ProgramManagerDashboard')
);
const StudentsList = lazy(
  () => import('../program-manager-module/StudentsList')
);
const Attendance = lazy(() => import('../program-manager-module/Attendance'));
const StudentEnrollment = lazy(
  () => import('../program-manager-module/StudentEnrollment')
);
const Reports = lazy(
  () => import('../program-manager-module/ExamReports/Reports')
);
const ReportsType = lazy(
  () => import('../program-manager-module/ExamReports/ReportsType')
);
const DailyExamSelection = lazy(
  () => import('../program-manager-module/ExamReports/DailyExamSelection')
);
const DailyExamReport = lazy(
  () => import('../program-manager-module/ExamReports/DailyExamReport')
);
const JobListings = lazy(() => import('../program-manager-module/JobListings'));
const ScheduleClass = lazy(
  () => import('../program-manager-module/ScheduleClass')
);
const ScheduleBatch = lazy(
  () => import('../program-manager-module/ScheduleBatch')
);
const CreateExam = lazy(
  () => import('../program-manager-module/Exams/CreateExam')
);
const CreateExamType = lazy(
  () => import('../program-manager-module/Exams/CreateExamType')
);
const LiveClasses = lazy(
  () => import('../common/admin-program-manager/LiveClasses')
);
const ViewBatch = lazy(
  () => import('../common/admin-program-manager/ViewBatch')
);
const LeaveRequest = lazy(
  () => import('../common/admin-program-manager/LeaveRequest')
);
const ExamStatistics = lazy(
  () => import('../common/admin-program-manager/ExamStatistics/ExamStatistics')
);
const WhatsappNotificationsReport = lazy(
  () =>
    import(
      '../common/admin-program-manager/ExamStatistics/WhatsappNotificationsReport'
    )
);
const BatchSchedulePage = lazy(
  () => import('../common/admin-program-manager/BatchSchedulePage')
);
const ViewAppliedStudents = lazy(
  () =>
    import(
      '../common/admin-program-manager-bde/view-applied-students/ViewAppliedStudents'
    )
);
const JobDetails = lazy(
  () =>
    import(
      '../common/admin-program-manager-bde/view-applied-students/JobDetails'
    )
);
const SearchStudent = lazy(
  () =>
    import(
      '../common/admin-bde-program-manager-mentor/search-student/SearchStudent'
    )
);
const SetExam = lazy(() => import('../program-manager-module/Exams/SetExam'));
const ManageLeaderBoard = lazy(
  () => import('../common/admin-program-manager/ManageLeaderBoard')
);

const ProgramManagerRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/program-manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ProgramManagerDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/student-enrollment"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentEnrollment />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/live-classes"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <LiveClasses />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/view-batch"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ViewBatch />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/view-batch/schedule"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <BatchSchedulePage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/reports"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <Reports />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/reports/:batch/:location"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ReportsType />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/reports/daily"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <DailyExamSelection />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/reports/daily/:examName"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <DailyExamReport />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/leave-request"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <LeaveRequest />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/students-list"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentsList />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/search-student"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SearchStudent />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/job-listings"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobListings />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/job-listings/:job_id"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobDetails />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/view-applied-students/:job_id"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ViewAppliedStudents />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/students-attendance"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <Attendance />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/schedule-class"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ScheduleClass />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/schedule-batch"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ScheduleBatch />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/exam-statistics"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ExamStatistics />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/whatsapp-notification-report"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <WhatsappNotificationsReport />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/schedule-exam"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CreateExam />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/schedule-exam/:batch/:location"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CreateExamType />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/program-manager/schedule-exam/create"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SetExam />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manageleaderboard"
        element={
          <ProtectedRoute allowedRoles={[PROGRAM_MANAGER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ManageLeaderBoard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};

export default ProgramManagerRoutes;
