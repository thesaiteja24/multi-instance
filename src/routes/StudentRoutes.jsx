import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { STUDENT } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';
import ExamSecurity from '../Student/NewExamModule/ExamSecurity';
import CodePlaygroundHome from '../student-module/CodePlayground/CodePlaygroundHome';
import CodePlaygroundTopics from '../student-module/CodePlayground/CodePlaygroundTopics';

// Lazy load components
const StudentDashboard = lazy(
  () => import('../student-module/StudentDashboard')
);
const JobListings = lazy(() => import('../student-module/JobListings'));
const JobDetails = lazy(() => import('../student-module/JobDetails'));
const Courses = lazy(() => import('../student-module/Courses'));
const SubjectDetails = lazy(() => import('../student-module/SubjectDetails'));
const ReportsTypeSelection = lazy(
  () => import('../student-module/ReportsTypeSelection')
);
const DailyReportsOverview = lazy(
  () => import('../student-module/DailyReportsOverview')
);
const ExamAnalysis = lazy(
  () => import('../student-module/ExamAnalysis/ExamAnalysis')
);
const MockInterview = lazy(() => import('../student-module/MockInterview'));
const RequestLeave = lazy(() => import('../student-module/RequestLeave'));
const ExamDashboard = lazy(
  () => import('../Student/NewExamModule/ExamDashboard')
);
const ConductExam = lazy(() => import('../Student/NewExamModule/Main'));
const LeaderBoard = lazy(() => import('../student-module/LeaderBoard'));

const StudentRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/job-listings"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobListings />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/job-listings/:jobId"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobDetails />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <Courses />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:subject"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SubjectDetails />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/reports/type"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ReportsTypeSelection />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/reports/daily"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <DailyReportsOverview />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/reports/daily/:examName"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ExamAnalysis />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam-dashboard"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ExamDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conduct-exam"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ExamSecurity>
                  <ConductExam />
                </ExamSecurity>
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leaderboard"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <LeaderBoard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/mock-interview"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <MockInterview />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/code-playground"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CodePlaygroundHome />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/code-playground/:course"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CodePlaygroundTopics />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/request-leave"
        element={
          <ProtectedRoute allowedRoles={[STUDENT]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <RequestLeave />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
};

export default StudentRoutes;
