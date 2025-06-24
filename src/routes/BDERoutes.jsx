import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { BDE } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';

// Lazy load components
const StudentsList = lazy(() => import('../bde-module/StudentsList'));
const AddJob = lazy(() => import('../bde-module/AddJob'));
const UpdateJob = lazy(() => import('../bde-module/UpdateJob'));
const JobListings = lazy(
  () =>
    import(
      '../common/admin-program-manager-bde/view-applied-students/JobListings'
    )
);
const JobDetails = lazy(
  () =>
    import(
      '../common/admin-program-manager-bde/view-applied-students/JobDetails'
    )
);
const ViewAppliedStudents = lazy(
  () =>
    import(
      '../common/admin-program-manager-bde/view-applied-students/ViewAppliedStudents'
    )
);
const SearchStudent = lazy(
  () =>
    import(
      '../common/admin-bde-program-manager-mentor/search-student/SearchStudent'
    )
);

const BDERoutes = () => {
  return (
    <Fragment>
      <Route
        path="/bde/job-listings"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobListings />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bde/job-listings/:job_id"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobDetails />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bde/view-applied-students/:job_id"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ViewAppliedStudents />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bde/update-job/:job_id"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <UpdateJob />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bde/add-job"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <AddJob />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bde/students-list"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentsList />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bde/search-student"
        element={
          <ProtectedRoute allowedRoles={[BDE]}>
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

export default BDERoutes;
