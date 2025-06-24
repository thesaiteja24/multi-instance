import React, { memo, useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { getFlags } from '../reducers/flagsSlice.js';
import { FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import {
  CourseIcon,
  ExamReportsIcon,
  CodePlayGroundIcon,
  JobsListIcon,
  MockInterviewIcon,
  ProfileIcon,
  AddIcon,
  ExamIcon,
  LeaveRequestIcon,
  FaPowerOn,
  ListIcon,
  ManageIcon,
  DataIcon,
  AdminIcon,
  BDEIcon,
  ManageMentorIcon,
  ManageProgramManagerIcon,
  StudentSearchIcon,
  CurriculumIcon,
} from '../Icons/StudentsIcons.jsx';
import {
  BatchScheduleIcon,
  CreateBatchIcon,
  ManageJobLIstIcon,
  ScheduleExamIcon,
  StudentAttendanceIcon,
  StudentEnrollmentIcon,
  ManagerDashboardIcon,
  ScheduleListIcon,
  StudentDataIcon,
  StudentsPerformance,
} from '../Icons/ManagerIcons.jsx';
import {
  MentorDashboardIcon,
  CoursesIcon,
  AttendanceIcon,
  StudentListIcon,
  MentorStudentDataIcon,
  StudentPerformanceIcon,
} from '../Icons/MentorIcons.jsx';
import { logoutUserThunk } from '../reducers/authSlice.js';
import {
  SUPER_ADMIN,
  ADMIN,
  BDE,
  PROGRAM_MANAGER,
  JAVA,
  PYTHON,
  MENTOR,
  STUDENT,
  TESTER,
} from '../constants/AppConstants.js';

const createMemoizedIcon = IconComponent =>
  memo(({ isActive, isHovered }) => {
    const color = isActive ? '#000000' : isHovered ? '#FFFFFF' : '#FFFFFF';
    const className = isActive
      ? 'text-blue-500'
      : isHovered
        ? 'text-blue-300'
        : 'text-white';
    return (
      <span className={className}>
        <IconComponent color={color} />
      </span>
    );
  });

export const SidebarV = ({
  onLogout,
  isCollapsed,
  setIsCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isMobileView,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutStatus, userInfo } = useSelector(state => state.auth);
  const { flags } = useSelector(state => state.flags);
  const { profileStatus, userType } = userInfo;
  const dispatch = useDispatch();
  const {
    studentDetails,
    profilePicture,
    loading: studentLoading,
    error: studentError,
  } = useSelector(state => state.student);

  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);

  useEffect(() => {
    dispatch(getFlags());
  }, [dispatch, location]);

  useEffect(() => {
    const menuItems = getMenuItems(userType);
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (currentItem) {
      setActiveLabel(currentItem.label);
    }
  }, [location.pathname, userType]);

  const userProfile = {
    avatarUrl: profilePicture || 'https://placehold.co/2.5remx2.5rem',
    name: studentDetails?.name || 'Guest',
    id: studentDetails?.studentId || 'N/A',
  };

  const iconMap = useMemo(() => ({
    ProfileIcon: createMemoizedIcon(ProfileIcon),
    JobsListIcon: createMemoizedIcon(JobsListIcon),
    CourseIcon: createMemoizedIcon(CourseIcon),
    ExamIcon: createMemoizedIcon(ExamIcon),
    ExamReportsIcon: createMemoizedIcon(ExamReportsIcon),
    MockInterviewIcon: createMemoizedIcon(MockInterviewIcon),
    CodePlayGroundIcon: createMemoizedIcon(CodePlayGroundIcon),
    AddIcon: createMemoizedIcon(AddIcon),
    ListIcon: createMemoizedIcon(ListIcon),
    DataIcon: createMemoizedIcon(DataIcon),
    ManageIcon: createMemoizedIcon(ManageIcon),
    LeaveRequestIcon: createMemoizedIcon(LeaveRequestIcon),
    StudentAttendanceIcon: createMemoizedIcon(StudentAttendanceIcon),
    MentorDashboardIcon: createMemoizedIcon(MentorDashboardIcon),
    CoursesIcon: createMemoizedIcon(CoursesIcon),
    AttendanceIcon: createMemoizedIcon(AttendanceIcon),
    StudentListIcon: createMemoizedIcon(StudentListIcon),
    MentorStudentDataIcon: createMemoizedIcon(MentorStudentDataIcon),
    StudentPerformanceIcon: createMemoizedIcon(StudentPerformanceIcon),
    ManagerDashboardIcon: createMemoizedIcon(ManagerDashboardIcon),
    ScheduleListIcon: createMemoizedIcon(ScheduleListIcon),
    CurriculumIcon: createMemoizedIcon(CurriculumIcon),
    StudentDataIcon: createMemoizedIcon(StudentDataIcon),
    ManageJobLIstIcon: createMemoizedIcon(ManageJobLIstIcon),
    StudentSearchIcon: createMemoizedIcon(StudentSearchIcon),
    StudentEnrollmentIcon: createMemoizedIcon(StudentEnrollmentIcon),
    BatchScheduleIcon: createMemoizedIcon(BatchScheduleIcon),
    BDEIcon: createMemoizedIcon(BDEIcon),
    ManageMentorIcon: createMemoizedIcon(ManageMentorIcon),
    AdminIcon: createMemoizedIcon(AdminIcon),
    CreateBatchIcon: createMemoizedIcon(CreateBatchIcon),
    ManageProgramManagerIcon: createMemoizedIcon(ManageProgramManagerIcon),
    ScheduleExamIcon: createMemoizedIcon(ScheduleExamIcon),
    StudentsPerformance: createMemoizedIcon(StudentsPerformance),
    FaPowerOn: createMemoizedIcon(FaPowerOn),
  }));

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path, label) => {
    const restrictedPaths = [
      '/jobslist',
      '/courses',
      '/exam-dashboard',
      '/exam-repors',
      '/exam-reports-dashboard',
      '/mock-interviews',
      '/leave-request-page',
    ];
    const isProfileIncomplete =
      userType === 'student_login_details' &&
      (!profileStatus || profileStatus === 'false');
    if (isProfileIncomplete && restrictedPaths.includes(path)) {
      Swal.fire({
        title: 'Profile Incomplete!',
        text: 'Please update your profile first to access this feature.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    navigate(path);
    setActiveLabel(label);
    setIsMobileMenuOpen(false);
    setHoveredItem(null);
  };

  const handleLogout = () => {
    dispatch(logoutUserThunk());
    if (logoutStatus === 200) {
      setIsLoggedOut(true);
      setActiveLabel(null);
      navigate('/', { replace: true });
    }
  };

  const getMenuItems = useMemo(() => {
    return userType => {
      switch (userType) {
        case STUDENT:
          const studentMenu = [
            { label: 'Profile', path: '/student/dashboard', icon: ProfileIcon },
            { label: 'Exams', path: '/exam-dashboard', icon: ExamIcon },
            {
              label: 'Exam Reports',
              path: '/student/reports/type',
              icon: ExamReportsIcon,
            },
            {
              label: 'Mock Interviews',
              path: '/student/mock-interview',
              icon: MockInterviewIcon,
            },
            // {
            //   label: 'Leaderboard',
            //   path: '/student/leaderboard',
            //   icon: ExamReportsIcon,
            // },
          ];
          // Conditionally add Code Playground based on flag
          if (flags.flagcodePlayground) {
            studentMenu.push({
              label: 'Code Playground',
              path: '/student/code-playground',
              icon: CodePlayGroundIcon, // Use correct icon
            });
          }
          studentMenu.push({
            label: 'Logout',
            action: onLogout,
            icon: FaPowerOn,
          });
          return studentMenu;

        case ADMIN:
          return [
            {
              label: 'Admin Dashboard',
              path: '/admin/dashboard',
              icon: AdminIcon,
            },
            {
              label: 'Manage Jobs List',
              path: '/admin/job-listings',
              icon: ManageIcon,
            },
            {
              label: 'Students List',
              path: '/admin/students-list',
              icon: StudentListIcon,
            },
            {
              label: 'Student Attendance',
              path: '/admin/attendance-details',
              icon: StudentAttendanceIcon,
            },
            {
              label: 'Search Student',
              path: '/admin/search-student',
              icon: StudentSearchIcon,
            },
            {
              label: 'Leaderboard',
              path: '/manageleaderboard',
              icon: ExamReportsIcon,
            },
            // {
            //   label: 'Parent Whatsapp Report',
            //   path: '/admin/parent-whatsapp-report',
            //   icon: ExamReportsIcon,
            // },
            { label: 'Logout', action: onLogout, icon: FaPowerOn },
          ];
        case TESTER:
          return [
            {
              label: 'Verify Questions',
              path: '/tester/dashboard',
              icon: ExamIcon,
            },
            {
              label: 'Create Questions',
              path: '/tester/create-questions',
              icon: AddIcon,
            },
            { label: 'Logout', action: onLogout, icon: FaPowerOn },
          ];
        case SUPER_ADMIN:
          return [
            {
              label: 'Admin Dashboard',
              path: '/admin/dashboard',
              icon: AdminIcon,
            },
            {
              label: 'Manage BDEs',
              path: '/admin/bdes-management',
              icon: BDEIcon,
            },
            {
              label: 'Manage Mentors',
              path: '/admin/mentors-management',
              icon: ManageMentorIcon,
            },
            {
              label: 'Program Managers',
              path: '/admin/program-managers-management',
              icon: ManageProgramManagerIcon,
            },
            {
              label: 'Testers',
              path: '/admin/testers-management',
              icon: ManageProgramManagerIcon,
            },
            {
              label: 'Testers Progress',
              path: '/admin/tester-progress',
              icon: BDEIcon,
            },
            {
              label: 'Students List',
              path: '/admin/students-list',
              icon: StudentListIcon,
            },
            {
              label: 'Student Attendance',
              path: '/admin/attendance-details',
              icon: StudentAttendanceIcon,
            },
            {
              label: 'Exam Statistics',
              path: '/admin/exam-statistics',
              icon: ExamReportsIcon,
            },
            {
              label: 'Search Student',
              path: '/admin/search-student',
              icon: StudentSearchIcon,
            },
            {
              label: 'Curriculum',
              path: '/admin/curriculum-management',
              icon: CurriculumIcon,
            },
            // {
            //   label: 'Manage Jobs List',
            //   path: '/admin/job-listings',
            //   icon: ManageIcon,
            // },
            // {
            //   label: 'Leaderboard',
            //   path: '/manageleaderboard',
            //   icon: ExamReportsIcon,
            // },
            // {
            //   label: 'Parent Whatsapp Report',
            //   path: '/admin/parent-whatsapp-report',
            //   icon: ExamReportsIcon,
            // },
            { label: 'Logout', action: onLogout, icon: FaPowerOn },
          ];
        case BDE:
          return [
            {
              label: 'Manage Jobs List',
              path: '/bde/job-listings',
              icon: ManageIcon,
            },
            { label: 'Add Job', path: '/bde/add-job', icon: AddIcon },
            {
              label: 'Students List',
              path: '/bde/students-list',
              icon: ListIcon,
            },
            {
              label: 'Student Data',
              path: '/bde/search-student',
              icon: DataIcon,
            },
            { label: 'Logout', action: onLogout, icon: FaPowerOn },
          ];
        case MENTOR:
          return [
            {
              label: 'Mentor Dashboard',
              path: '/mentor/dashboard',
              icon: MentorDashboardIcon,
            },
            {
              label: 'Curriculum Management',
              path: '/mentor/curriculum-management',
              icon: CoursesIcon,
            },
            {
              label: 'Search Student',
              path: '/mentor/search-student',
              icon: MentorStudentDataIcon,
            },
            // {
            //   label: 'Leaderboard',
            //   path: '/mentor/leaderboard',
            //   icon: ExamReportsIcon,
            // },
            {
              label: 'Students Performance',
              path: '/mentor/reports',
              icon: StudentPerformanceIcon,
            },
            { label: 'Logout', action: onLogout, icon: FaPowerOn },
          ];
        case PROGRAM_MANAGER:
          return [
            {
              label: 'Manager Dashboard',
              path: '/program-manager/dashboard',
              icon: ManagerDashboardIcon,
            },
            {
              label: 'Students List',
              path: '/program-manager/students-list',
              icon: ScheduleListIcon,
            },
            {
              label: 'Student Data',
              path: '/program-manager/search-student',
              icon: StudentDataIcon,
            },
            // {
            //   label: 'Manage Jobs List',
            //   path: '/program-manager/job-listings',
            //   icon: ManageJobLIstIcon,
            // },
            {
              label: 'Student Attendance',
              path: '/program-manager/students-attendance',
              icon: StudentAttendanceIcon,
            },
            {
              label: 'Batch Schedule',
              path: '/program-manager/schedule-class',
              icon: BatchScheduleIcon,
            },
            {
              label: 'Create Batch',
              path: '/program-manager/schedule-batch',
              icon: CreateBatchIcon,
            },
            {
              label: 'Exam Statistics',
              path: '/program-manager/exam-statistics',
              icon: ExamReportsIcon,
            },
            {
              label: 'Scheduling Exam',
              path: '/program-manager/schedule-exam',
              icon: ScheduleExamIcon,
            },
            // {
            //   label: 'Leaderboard',
            //   path: '/manageleaderboard',
            //   icon: ExamReportsIcon,
            // },

            { label: 'Logout', action: onLogout, icon: FaPowerOn },
          ];
        case PYTHON:
        case JAVA:
          return [
            {
              label: 'Dashboard',
              path: '/subject-admin/dashboard',
              icon: AdminIcon,
            },
            {
              label: 'Live Classes',
              path: '/subject-admin/live-classes',
              icon: ScheduleListIcon,
            },
            {
              label: 'View Batches',
              path: '/subject-admin/view-batches',
              icon: BatchScheduleIcon,
            },
            {
              label: 'Students List',
              path: '/subject-admin/students-list',
              icon: StudentListIcon,
            },
            {
              label: 'Student Attendance',
              path: '/subject-admin/attendance',
              icon: StudentAttendanceIcon,
            },
            {
              label: 'Search Student',
              path: '/subject-admin/search-student',
              icon: StudentSearchIcon,
            },
            {
              label: 'Logout',
              action: onLogout,
              icon: FaPowerOn,
            },
          ];
        default:
          return [];
      }
    };
  }, [flags]);

  const allMenuItems = getMenuItems(userType);
  const menuItems = allMenuItems.filter(item => item.label !== 'Logout');
  const logoutItem = allMenuItems.find(item => item.label === 'Logout');

  const isLoggedIn = !!userType && !isLoggedOut;

  if (!isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  const MenuItem = ({ icon: Icon, label, path, action }) => {
    const isActive = activeLabel === label;
    const color = isActive
      ? '#000000'
      : hoveredItem === label
        ? '#FFFFFF'
        : '#FFFFFF';

    return (
      <button
        className={classNames(
          'w-full flex items-center gap-[0.5rem] py-[0.75rem] pl-[1rem] rounded-[0.5rem] transition-colors duration-200 ease-in-out',
          {
            'bg-white text-blue-500': isActive,
            'text-white hover:bg-white/10 hover:text-blue-300 text-ellipsis':
              !isActive,
          }
        )}
        onMouseEnter={() => setHoveredItem(label)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          if (action) {
            action();
          } else {
            handleNavigation(path, label);
          }
        }}
      >
        <div className="p-0">
          <Icon color={color} />
        </div>
        <span
          className={classNames(
            'font-medium text-[0.9rem] text-nowrap inline-block',
            {
              hidden: isCollapsed && !isMobileView,
              block: !isCollapsed || isMobileView,
              'text-black': isActive,
              'text-white': !isActive,
            }
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobileView && (
        <aside
          className={classNames(
            'hidden lg:block fixed left-[1rem] top-[7.5rem] z-40 transition-all duration-300',
            {
              'w-[16.25rem]': !isCollapsed,
              'w-[4.625rem]': isCollapsed,
            }
          )}
        >
          <div
            className="rounded-[1.875rem] shadow-[0_0.25rem_0.5rem_rgba(0,0,0,0.1)] h-[calc(99vh-7.5rem)] bg-[#001F5C] p-[1rem] flex flex-col font-[Inter] overflow-y-auto no-scrollbar"
            style={{
              background: 'var(--gradient-sidebar)',
              boxShadow: '0 0.25rem 0.625rem rgba(0, 0, 0, 0.25)',
            }}
          >
            <nav className="space-y-[0.5rem] pt-[0.75rem] flex-1">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  action={item.action}
                />
              ))}
            </nav>

            {logoutItem && (
              <div className="mt-auto pt-[1rem] border-t border-white border-opacity-50">
                <MenuItem
                  icon={logoutItem.icon}
                  label={logoutItem.label}
                  action={logoutItem.action}
                />
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobileView && isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[6.5rem] z-50 bg-black bg-opacity-40 flex">
          <aside
            className="w-[16rem] h-full bg-[#001F5C] rounded-r-[1.875rem] shadow-[0_0.25rem_0.5rem_rgba(0,0,0,0.1)] p-[1rem] flex flex-col font-[Inter] overflow-y-auto no-scrollbar"
            style={{
              background: 'var(--gradient-sidebar)',
              boxShadow: '0 0.25rem 0.625rem rgba(0, 0, 0, 0.25)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end mb-[1rem]">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:text-blue-300"
              >
                <FiX className="h-[1.5rem] w-[1.5rem]" />
              </button>
            </div>

            {userType === 'student_login_details' && (
              <div className="text-center mb-[1rem]">
                {studentLoading ? (
                  <div className="w-[5rem] h-[5rem] mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-[0.5rem]">
                    Loading...
                  </div>
                ) : (
                  <div className="w-[5rem] h-[5rem] mx-auto rounded-full overflow-hidden border-[0.25rem] border-white mb-[0.5rem]">
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                      onError={e =>
                        (e.target.src = 'https://placehold.co/2.5remx2.5rem')
                      }
                    />
                  </div>
                )}
                <h2 className="text-white font-semibold text-[1.125rem]">
                  {studentLoading ? 'Loading...' : userProfile.name}
                </h2>
                <p className="text-white text-opacity-80 text-[0.75rem]">
                  ID: {studentLoading ? '...' : userProfile.id}
                </p>
              </div>
            )}

            <div className="border-t border-white border-opacity-50 my-[0.5rem]"></div>

            <nav className="space-y-[0.5rem] flex-1">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  action={item.action}
                />
              ))}
            </nav>

            {logoutItem && (
              <div className="pt-[1rem] border-t border-white border-opacity-50">
                <MenuItem
                  icon={logoutItem.icon}
                  label={logoutItem.label}
                  action={logoutItem.action}
                />
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

export default SidebarV;
