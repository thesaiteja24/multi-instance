export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const SUPER_ADMIN = 'superAdmin';
export const ADMIN = 'Admin';
export const BDE = 'BDE_data';
export const PROGRAM_MANAGER = 'Manager';
export const MENTOR = 'Mentors';
export const STUDENT = 'student_login_details';
export const TESTER = 'Testers';
export const JAVA = 'Java';
export const PYTHON = 'Python';
export const COLLEGE_CODE = import.meta.env.VITE_COLLEGE_CODE;
export const COLLEGE_SUBJECTS = import.meta.env.VITE_COLLEGE_SUBJECTS
  ? JSON.parse(import.meta.env.VITE_COLLEGE_SUBJECTS)
  : [];
