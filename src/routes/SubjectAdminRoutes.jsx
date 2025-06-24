import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { JAVA, PYTHON } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';

// Lazy load components
const SubjectAdminDashboard = lazy(
  () => import('../subject-admin-module/SubjectAdminDashboard')
);
const SearchStudent = lazy(
  () =>
    import(
      '../common/admin-bde-program-manager-mentor/search-student/SearchStudent'
    )
);
const SubjectAdminLiveClasses = lazy(
  () => import('../subject-admin-module/SubjectAdminLiveClasses')
);
const SubjectAdminViewBatch = lazy(
  () => import('../subject-admin-module/SubjectAdminViewBatch')
);
const SubjectAdminStudentsList = lazy(
  () => import('../subject-admin-module/SubjectAdminStudentsList')
);
const SubjectAdminAttendance = lazy(
  () => import('../subject-admin-module/SubjectAdminAttendance')
);

const SubjectAdminRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/subject-admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[JAVA, PYTHON]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SubjectAdminDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject-admin/live-classes"
        element={
          <ProtectedRoute allowedRoles={[JAVA, PYTHON]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SubjectAdminLiveClasses />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject-admin/view-batches"
        element={
          <ProtectedRoute allowedRoles={[JAVA, PYTHON]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SubjectAdminViewBatch />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject-admin/students-list"
        element={
          <ProtectedRoute allowedRoles={[JAVA, PYTHON]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SubjectAdminStudentsList />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject-admin/attendance"
        element={
          <ProtectedRoute allowedRoles={[JAVA, PYTHON]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SubjectAdminAttendance />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject-admin/search-student"
        element={
          <ProtectedRoute allowedRoles={[JAVA, PYTHON]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SearchStudent />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};

export default SubjectAdminRoutes;
