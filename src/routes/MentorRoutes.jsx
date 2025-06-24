import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { MENTOR } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';

// Lazy load components
const MentorDashboard = lazy(() => import('../mentor-module/MentorDashboard'));
const CurriculumManagement = lazy(
  () => import('../mentor-module/CurriculumManagement')
);
const AttendanceSystem = lazy(
  () => import('../mentor-module/AttendanceManagement')
);

const MentorLeaderBoard = lazy(
  () => import('../mentor-module/MentorLeaderBoard')
);
const ViewAttendance = lazy(() => import('../mentor-module/ViewAttendance'));
const StudentsList = lazy(() => import('../mentor-module/MentorStudentData'));
const Reports = lazy(() => import('../mentor-module/ExamReports/Reports'));
const ReportsType = lazy(
  () => import('../mentor-module/ExamReports/ReportsType')
);
const DailyExamSelection = lazy(
  () => import('../mentor-module/ExamReports/DailyExamSelection')
);
const DailyExamReport = lazy(
  () => import('../mentor-module/ExamReports/DailyExamReport')
);
const AssignedBatches = lazy(() => import('../mentor-module/AssignedBatches'));
const CodePlayground = lazy(
  () => import('../common/mentor-student/Codeplayground')
);
const SearchStudent = lazy(
  () =>
    import(
      '../common/admin-bde-program-manager-mentor/search-student/SearchStudent'
    )
);

const MentorRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <MentorDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/assigned-batches"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <AssignedBatches />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/students-list"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentsList />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/attendance-management"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <AttendanceSystem />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/attendance-management/view"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ViewAttendance />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/curriculum-management"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CurriculumManagement />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/search-student"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SearchStudent />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/playground"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CodePlayground />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/reports"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <Reports />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/reports/:batch/:location"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ReportsType />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/reports/:batch/:location/daily"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <DailyExamSelection />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/reports/:batch/:location/daily/:examName"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <DailyExamReport />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/leaderboard"
        element={
          <ProtectedRoute allowedRoles={[MENTOR]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <MentorLeaderBoard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};

export default MentorRoutes;
