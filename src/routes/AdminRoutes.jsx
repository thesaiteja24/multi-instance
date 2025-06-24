import { lazy, Fragment, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../utils/ProtectedRoute';
import { SUPER_ADMIN, ADMIN } from '../constants/AppConstants';
import ErrorBoundary from '../utils/ErrorBoundary';
import CustomScaleLoader from '../ui/CustomScaleLoader';

// Lazy load components
const AdminDashboard = lazy(() => import('../admin-module/AdminDashboard'));
const BDEsManagement = lazy(() => import('../admin-module/BDEsManagement'));
const MentorsManagement = lazy(
  () => import('../admin-module/MentorsManagement')
);
const StudentsList = lazy(() => import('../admin-module/StudentsList'));
const ProgramManagersManagement = lazy(
  () => import('../admin-module/ProgramManagersManagement')
);
const EmployeesData = lazy(() => import('../admin-module/EmployeesData'));
const CurriculumManagement = lazy(
  () => import('../admin-module/CurriculumManagement')
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
const StudentAttendanceData = lazy(
  () => import('../program-manager-module/Attendance')
);
const BatchSchedulePage = lazy(
  () => import('../common/admin-program-manager/BatchSchedulePage')
);
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
const TesterManagement = lazy(() => import('../admin-module/TesterManagement'));
const InternProgressSummary = lazy(
  () => import('../admin-module/InternProgressSummary')
);
const WhatsappNotificationsReport = lazy(
  () =>
    import(
      '../common/admin-program-manager/ExamStatistics/WhatsappNotificationsReport'
    )
);
const ExamStatistics = lazy(
  () => import('../common/admin-program-manager/ExamStatistics/ExamStatistics')
);

const ParentWhatsappMessage = lazy(
  () => import('../admin-module/ParentWhatsappMessage')
);

const ManageLeaderBoard = lazy(
  () => import('../common/admin-program-manager/ManageLeaderBoard')
);

const AdminRoutes = () => {
  return (
    <Fragment>
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/live-classes"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <LiveClasses />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-batch"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ViewBatch />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-batch/schedule"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <BatchSchedulePage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leave-request"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <LeaveRequest />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <EmployeesData />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bdes-management"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <BDEsManagement />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mentors-management"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <MentorsManagement />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/program-managers-management"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ProgramManagersManagement />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/testers-management"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <TesterManagement />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tester-progress"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <InternProgressSummary />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students-list"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentsList />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance-details"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <StudentAttendanceData />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exam-statistics"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ExamStatistics />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/whatsapp-notification-report"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <WhatsappNotificationsReport />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/search-student"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <SearchStudent />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/curriculum-management"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <CurriculumManagement />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/job-listings"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobListings />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/job-listings/:job_id"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <JobDetails />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-applied-students/:job_id"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ViewAppliedStudents />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/parent-whatsapp-report"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
            <Suspense fallback={<CustomScaleLoader />}>
              <ErrorBoundary>
                <ParentWhatsappMessage />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manageleaderboard"
        element={
          <ProtectedRoute allowedRoles={[SUPER_ADMIN, ADMIN]}>
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

export default AdminRoutes;
