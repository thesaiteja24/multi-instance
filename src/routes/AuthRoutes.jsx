import { lazy, Fragment } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { routeMapping } from '../routes/routeMappings.js';

// Lazy load components
const Login = lazy(() => import('../auth-module/Login'));
const AdminLogin = lazy(() => import('../auth-module/AdminLogin'));
const ForgotPassword = lazy(() => import('../auth-module/ForgotPassword'));

const AuthRoutes = () => {
  const { isAuthenticated, userInfo } = useSelector(state => state.auth);
  const userType = userInfo?.userType;
  const redirectTo = userType ? routeMapping(userType) : '/';

  return (
    <Fragment>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={redirectTo} replace /> : <Login />
        }
      />
      <Route
        path="/admin"
        element={
          isAuthenticated ? (
            <Navigate to={redirectTo} replace />
          ) : (
            <AdminLogin />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to={redirectTo} replace />
          ) : (
            <ForgotPassword />
          )
        }
      />
    </Fragment>
  );
};

export default AuthRoutes;
