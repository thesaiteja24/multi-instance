import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { useSelector } from 'react-redux';
import NotFound from './NotFound.jsx';
import Home from './Home/Home.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import { ToastContainer } from 'react-toastify';
import Layout from './Layout/Layout.jsx';

import {
  ADMIN,
  BDE,
  MENTOR,
  PROGRAM_MANAGER,
  STUDENT,
  SUPER_ADMIN,
  TESTER,
} from './constants/AppConstants.js';
import AdminRoutes from './routes/AdminRoutes.jsx';
import BDERoutes from './routes/BDERoutes.jsx';
import MentorRoutes from './routes/MentorRoutes.jsx';
import StudentRoutes from './routes/StudentRoutes.jsx';
import ProgramManagerRoutes from './routes/ProgramManagerRoutes.jsx';
import { routeMapping } from './routes/routeMappings.js';
import TestersRoutes from './routes/TestersRoutes.jsx';
import AuthRoutes from './routes/AuthRoutes.jsx';
import SubjectAdminRoutes from './routes/SubjectAdminRoutes.jsx';
import { logError } from './utils/logger.jsx';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, 'ErrorBoundary caught error', 'react_error');
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="max-w-md w-full text-center bg-white shadow-2xl rounded-2xl p-8 border border-red-300">
            <div className="flex justify-center items-center mb-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 text-3xl font-bold flex items-center justify-center rounded-full">
                !
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-700 mb-6">
              An unexpected error occurred. Please try one of the options below.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={this.handleRefresh}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleGoBack}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const { isAuthenticated, userInfo } = useSelector(state => state.auth);
  const userType = userInfo?.userType || null;

  return (
    <div
      style={{ overflow: 'auto', height: '100vh', backgroundColor: '#f4f4f4' }}
      className="no-scrollbar"
    >
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <Route element={<Layout />}>
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <Navigate to={routeMapping(userType)} replace />
                    ) : (
                      <Home />
                    )
                  }
                />

                {AuthRoutes()}
                {(userType === SUPER_ADMIN || userType === ADMIN) &&
                  AdminRoutes()}
                {userType === BDE && BDERoutes()}
                {userType === PROGRAM_MANAGER && ProgramManagerRoutes()}
                {userType === SubjectAdminRoutes && SubjectAdminRoutes()}
                {userType === MENTOR && MentorRoutes()}
                {userType === STUDENT && StudentRoutes()}
                {userType === TESTER && TestersRoutes()}
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
}
