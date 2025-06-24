import {
  SUPER_ADMIN,
  ADMIN,
  BDE,
  PROGRAM_MANAGER,
  MENTOR,
  STUDENT,
  TESTER,
  JAVA,
  PYTHON,
} from '../constants/AppConstants';

function routeMapping(userType) {
  switch (userType) {
    case SUPER_ADMIN:
    case ADMIN:
      return '/admin/dashboard';
    case BDE:
      return '/bde/job-listings';
    case PROGRAM_MANAGER:
      return '/program-manager/dashboard';
    case MENTOR:
      return '/mentor/dashboard';
    case STUDENT:
      return '/student/dashboard';
    case TESTER:
      return '/tester/dashboard';
    case JAVA:
    case PYTHON:
      return '/subject-admin/dashboard';
    default:
      return '/not-found';
  }
}

export { routeMapping };
