import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { TESTER } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';

// Lazy load components
const TesterDashboard = lazy(() => import('../tester-module/TesterDashboard'));
const VerifyMCQ = lazy(() => import('../tester-module/VerifyMCQ'));
const VerifyCoding = lazy(() => import('../tester-module/VerifyCoding'));
const CreateCoding = lazy(() => import('../tester-module/CreateCoding'));
const CreateMCQ = lazy(() => import('../tester-module/CreateMCQ'));
const CreateQuestion = lazy(() => import('../tester-module/CreateQuestion'));
const OnlineCompiler = lazy(() => import('../tester-module/OnlineCompiler'));

const TestersRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/tester/dashboard"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <TesterDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/verify-mcq"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <VerifyMCQ />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/verify-coding"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <VerifyCoding />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/verify-coding/test"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <OnlineCompiler />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/create-questions"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CreateQuestion />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/create-questions/mcq"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CreateMCQ />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tester/create-questions/coding"
        element={
          <ProtectedRoute allowedRoles={[TESTER]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CreateCoding />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};

export default TestersRoutes;
