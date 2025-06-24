import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PostLogin from './PostLogin.jsx';
import PreLogin from './PreLogin.jsx';
import { SidebarV } from './SidebarV.jsx';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStudentDetails,
  fetchProfilePicture,
} from '../reducers/studentSlice.js';
import { logoutUserThunk } from '../reducers/authSlice.js';
import { resetAllState } from '../reducers/resetAllSlices.js';

import classNames from 'classnames';
import './Layout.css';
import { STUDENT, MENTOR, PROGRAM_MANAGER } from '../constants/AppConstants.js';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = useLocation(); // Renamed to avoid conflict
  const { isAuthenticated, userInfo } = useSelector(state => state.auth);
  const { studentDetails, profilePicture } = useSelector(
    state => state.student
  );
  const { id, location, userType } = userInfo || {}; // Safeguard for userInfo
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const userProfile = {
    name: studentDetails?.name || 'Guest',
    avatarUrl: profilePicture || '/logo.png', // Better fallback
  };

  useEffect(() => {
    if (isAuthenticated && id && location) {
      switch (userType) {
        case STUDENT:
          if (!studentDetails) {
            dispatch(fetchStudentDetails({ id, location }));
          }
          break;
        case MENTOR:
          break;
        case PROGRAM_MANAGER:
          break;
        default:
          console.warn('Unknown user type:', userType);
          break;
      }
    }
  }, [dispatch, id, location, studentDetails, isAuthenticated]);

  useEffect(() => {
    if (studentDetails?.studentId && !profilePicture) {
      dispatch(fetchProfilePicture(studentDetails.studentId));
    }
  }, [dispatch, studentDetails?.studentId, profilePicture]);

  const clearAllStates = () => {
    try {
      dispatch(resetAllState());
    } catch (error) {
      console.error('Error resetting states:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUserThunk()).unwrap();
      if (resultAction.status === 200) {
        clearAllStates();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isConductExam = ['/conduct-exam', '/conduct-exam/', '/new'].includes(
    currentPath.pathname
  );

  if (isConductExam) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <div className="flex-grow h-full w-full">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-grow overflow-hidden">
        {isAuthenticated && (
          <SidebarV
            onLogout={handleLogout}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isMobileView={isMobileView}
            setIsMobileView={setIsMobileView}
          />
        )}
        <div
          className={classNames(
            'flex-grow overflow-auto bg-[url(/background.webp)] bg-[#EDF2FF] bg-contain bg-repeat transition-all duration-300',
            {
              'pl-[15.625rem]':
                !isSidebarCollapsed && !isMobileView && isAuthenticated,
              'pl-[8rem]':
                isSidebarCollapsed && !isMobileView && isAuthenticated,
              'pl-0': isMobileView || !isAuthenticated,
              'pt-[6.1rem]': isAuthenticated && !isMobileView,
              'pt-[2rem] mt-[4rem]': isMobileView && isAuthenticated,
              'pt-0': !isAuthenticated,
            }
          )}
        >
          {isAuthenticated ? (
            <PostLogin
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              userProfile={userProfile}
              onLogout={handleLogout}
              isMobileView={isMobileView}
              setIsMobileView={setIsMobileView}
            />
          ) : ['', '/'].includes(currentPath.pathname) ? null : (
            <PreLogin />
          )}
          <div
            className={classNames('overflow-hidden transition-all', {
              'h-full': ['/', '/login'].includes(currentPath.pathname),
              'h-full mt-[1.5rem] px-[2rem]': ![
                '/',
                '/login',
                '/admin',
                '/forgot-password',
              ].includes(currentPath.pathname),
            })}
          >
            <div className="h-full overflow-y-auto no-scrollbar">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
