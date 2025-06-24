import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { useDispatch, useSelector } from 'react-redux';
import { setEdit } from '../reducers/editslice.js';
import { setProfileStatus } from '../reducers/authSlice.js';
import {
  fetchStudentDetails,
  fetchDepartments,
  fetchProfilePicture,
} from '../reducers/studentSlice.js';
import { updateStudentProfile } from '../services/studentService.js';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const qualificationList = ['B Tech'];

const SCHOOL_LEVELS = [];
const NEEDS_12TH = ['B Tech'];

const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'Python',
  'Java',
  'NodeJS',
  'Reactjs',
  'Angular',
  'Vuejs',
  'ML',
  'Django',
  'Spring Boot',
  'C++',
  'C#',
  'Ruby',
  'PHP',
  'Swift',
  'TypeScript',
  'Go',
  'Rust',
  'Kotlin',
  'SQL',
  'Shell Scripting',
  'VB.NET',
  'MATLAB',
  'R',
  'AWS',
  'DevOps',
];

const EditProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const { studentDetails, departments, departmentsLoading, departmentsError } =
    useSelector(state => state.student);
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.auth.userInfo);
  const profileStatus = userInfo.profileStatus;
  const email = userInfo.email;
  const id = userInfo.id;
  const location = userInfo.location;

  const [isDepartmentAdded, setIsDepartmentAdded] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [arrearsCount, setArrearsCount] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState(
    studentDetails?.studentSkills || []
  );
  const [currentSkill, setCurrentSkill] = useState('');
  const [isOtherSkill, setIsOtherSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isOtherDepartment, setIsOtherDepartment] = useState(false);

  const profilePicRef = useRef(null);
  const resumeRef = useRef(null);

  // Yup Validation Schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required.')
      .matches(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces.'),
    dob: Yup.string()
      .required('Date of Birth is required.')
      .test('age', 'Must be at least 10 years old.', value => {
        const age = calculateAge(value);
        return age !== '' && parseInt(age) >= 10;
      }),
    gender: Yup.string().required('Please select a gender.'),
    collegeUSNNumber: Yup.string()
      .required('USN is required.')
      .matches(/^[a-zA-Z0-9]{1,50}$/, 'USN must be alphanumeric characters.'),
    password: Yup.string().when([], {
      is: () => !profileStatus,
      then: schema =>
        schema
          .required('Password is required.')
          .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 6 characters long.'
          ),
      otherwise: schema => schema.optional(),
    }),
    cpassword: Yup.string().when([], {
      is: () => !profileStatus,
      then: schema =>
        schema
          .required('Confirm Password is required.')
          .oneOf([Yup.ref('password')], 'Passwords do not match.'),
      otherwise: schema => schema.optional(),
    }),
    cityname: Yup.string()
      .required('City is required.')
      .matches(/^[a-zA-Z0-9\s]*$/, 'City must not contain special characters.'),
    state: Yup.string()
      .required('State is required.')
      .matches(
        /^[a-zA-Z0-9\s]*$/,
        'State must not contain special characters.'
      ),
    tenthStandard: Yup.string()
      .required('Percentage is required.')
      .matches(/^\d{2}$/, 'Percentage must be 2 digits.'),
    tenthPassoutYear: Yup.string()
      .required('Year is required.')
      .matches(/^\d{4}$/, 'Year must be exactly 4 digits.'),
    twelfthStandard: Yup.string()
      .required('Percentage is required.')
      .matches(/^\d{2}$/, 'Percentage must be 2 digits.'),
    twelfthPassoutYear: Yup.string()
      .matches(/^\d{4}$/, 'Year must be exactly 4 digits.')
      .required('Twelfth Passout Year is required.'),
    qualification: Yup.string().required('Qualification is required.'),
    department: Yup.string().required('Department is required.'),
    yearOfPassing: Yup.string()
      .required('Year of passing is required.')
      .matches(/^\d{4}$/, 'Year of passing must be 4 digits.'),
    collegeName: Yup.string()
      .required('College name is required.')
      .matches(
        /^[a-zA-Z0-9\s]*$/,
        'College name must not contain special characters.'
      ),
    arrears: Yup.boolean().required('Please select an option.'),
    skills: Yup.array().min(1, 'At least one skill is required.').required(),
    arrearsCount: Yup.string().when('arrears', {
      is: true,
      then: schema =>
        schema
          .required('Number of arrears is required.')
          .matches(/^\d*$/, 'Must be a number.'),
      otherwise: schema => schema.optional(),
    }),
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: studentDetails?.name || '',
      dob: studentDetails?.DOB || '',
      gender: studentDetails?.gender || '',
      collegeUSNNumber: studentDetails?.collegeUSNNumber || '',
      githubLink: studentDetails?.githubLink || '',
      arrears: studentDetails?.arrears || false,
      arrearsCount: studentDetails?.ArrearsCount || '',
      qualification: studentDetails?.qualification || '',
      department: studentDetails?.department || '',
      password: '',
      cpassword: '',
      state: studentDetails?.state || '',
      cityname: studentDetails?.city || '',
      yearOfPassing: studentDetails?.yearOfPassing || '',
      collegeName: studentDetails?.collegeName || '',
      tenthStandard: studentDetails?.tenthStandard || '',
      tenthPassoutYear: studentDetails?.TenthPassoutYear || '',
      twelfthStandard: studentDetails?.twelfthStandard || '',
      twelfthPassoutYear: studentDetails?.TwelfthPassoutYear || '',
      profilePic: null,
      resume: null,
      skills: studentDetails?.studentSkills || [],
      highestGraduationPercentage:
        studentDetails?.highestGraduationpercentage || '',
    },
  });

  // Fetch departments when qualification changes
  useEffect(() => {
    if (watch('qualification')) {
      dispatch(fetchDepartments(watch('qualification'))).then(result => {
        if (fetchDepartments.fulfilled.match(result)) {
          const deptArray = result.payload.data;
          if (Array.isArray(deptArray)) {
            if (!watch('department') && deptArray.length > 0) {
              setValue('department', deptArray[0]);
            }
          }
        }
      });
    } else {
      setValue('department', '');
    }
  }, [watch('qualification'), setValue, dispatch]);

  // Define required fields
  const requiredFields = [
    'name',
    'dob',
    'gender',
    'collegeUSNNumber',
    'cityname',
    'state',
    'tenthStandard',
    'tenthPassoutYear',
    'collegeName',
    'qualification',
    'department',
    'yearOfPassing',
    'highestGraduationPercentage',
    'githubLink',
    'skills',
    'twelfthStandard',
    'twelfthPassoutYear',
  ];

  // Calculate total required fields dynamically
  let totalFields = requiredFields.length;
  if (watch('arrears')) totalFields += 1; // arrearsCount
  if (!profileStatus) {
    totalFields += 2; // password, cpassword
    totalFields += 2; // profilePic, resume
  }

  // Calculate progress
  useEffect(() => {
    let filledFields = 0;

    requiredFields.forEach(field => {
      const value = watch(field);
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          if (value.length > 0) filledFields += 1;
        } else {
          filledFields += 1;
        }
      }
    });

    if (watch('arrears') && watch('arrearsCount')) {
      filledFields += 1;
    }

    if (!profileStatus) {
      if (watch('password')) filledFields += 1;
      if (watch('cpassword')) filledFields += 1;
      if (watch('profilePic')) filledFields += 1;
      if (watch('resume')) filledFields += 1;
    }

    const calculatedProgress =
      totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    setProgress(calculatedProgress);
  }, [watch(), profileStatus]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleCPasswordVisibility = () => setShowCPassword(!showCPassword);

  const handleArrearsChange = value => {
    setValue('arrears', value === 'yes');
    setValue('arrearsCount', value === 'yes' ? watch('arrearsCount') : '');
    if (!value) setArrearsCount('');
    trigger('arrearsCount');
  };

  const handleArrearsCountChange = e => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setArrearsCount(value);
      setValue('arrearsCount', value);
      trigger('arrearsCount');
    }
  };

  const handleDOBChange = e => {
    const selectedDate = e.target.value;
    const calculatedAge = calculateAge(selectedDate);
    setValue('dob', selectedDate);
    setValue('age', calculatedAge);
    trigger('dob');
  };

  const calculateAge = dob => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (
        fieldName === 'profilePic' &&
        !['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please upload an image file (JPEG, PNG, GIF).',
        });
        return;
      }
      if (fieldName === 'resume' && file.type !== 'application/pdf') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please upload a PDF document.',
        });
        return;
      }
      if (
        (fieldName === 'profilePic' && file.size > 10 * 1024) ||
        (fieldName === 'resume' && file.size > 100 * 1024)
      ) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: `${
            fieldName === 'profilePic' ? 'Profile picture' : 'Resume'
          } must be less than ${
            fieldName === 'profilePic' ? '10 KB' : '100 KB'
          }.`,
        });
        return;
      }
      setValue(fieldName, file);
      trigger(fieldName);
    } else {
      setValue(fieldName, null);
      trigger(fieldName);
      if (fieldName === 'profilePic') profilePicRef.current.value = '';
      if (fieldName === 'resume') resumeRef.current.value = '';
    }
  };

  const handleSkillChange = e => {
    const value = e.target.value;
    setCurrentSkill(value);
    setIsOtherSkill(value === 'Other');
  };

  const addSkill = () => {
    const updatedSkill = newSkill.charAt(0).toUpperCase() + newSkill.slice(1);
    const skillToAdd = isOtherSkill ? updatedSkill : currentSkill;
    if (skillToAdd && !selectedSkills.includes(skillToAdd)) {
      const updatedSkills = [...selectedSkills, skillToAdd];
      setSelectedSkills(updatedSkills);
      setValue('skills', updatedSkills);
      setCurrentSkill('');
      setIsOtherSkill(false);
      setNewSkill('');
      if (isOtherSkill && !skills.includes(skillToAdd)) {
        skills.push(skillToAdd);
      }
      trigger('skills');
    }
  };

  const removeSkill = skill => {
    const updatedSkills = selectedSkills.filter(item => item !== skill);
    setSelectedSkills(updatedSkills);
    setValue('skills', updatedSkills);
    trigger('skills');
  };

  const addDepartment = () => {
    const updatedDepartment =
      newDepartment.charAt(0).toUpperCase() + newDepartment.slice(1);
    if (
      updatedDepartment &&
      !departments[watch('qualification')]?.includes(updatedDepartment)
    ) {
      setValue('department', updatedDepartment);
      dispatch({
        type: 'student/updateDepartments',
        payload: {
          qualification: watch('qualification'),
          department: updatedDepartment,
        },
      });
      setNewDepartment('');
      setIsDepartmentAdded(true);
      setIsOtherDepartment(false);
      trigger('department');
    }
  };

  const handleDepartmentChange = e => {
    const value = e.target.value;
    setValue('department', value);
    setIsOtherDepartment(value === 'Others');
    trigger('department');
  };

  const handleQualificationChange = async e => {
    const value = e.target.value;
    setValue('qualification', value);
    const result = await dispatch(fetchDepartments(value));
    const deptArray = result.payload?.data || [];
    setValue(
      'department',
      Array.isArray(deptArray) && deptArray.length > 0 ? deptArray[0] : ''
    );
    trigger();
  };

  const getDepartmentOptions = () => {
    return [...(departments[watch('qualification')] || []), 'Others'];
  };

  const onSubmit = async data => {
    dispatch(setEdit(true));

    Swal.fire({
      title: 'Submitting...',
      text: 'Please wait while we process your registration',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const dataToSend = {
        name: data.name,
        email,
        gender: data.gender,
        dob: data.dob,
        cityName: data.cityname,
        department: data.department,
        yearOfPassing: data.yearOfPassing,
        state: data.state,
        collegeName: data.collegeName,
        qualification: data.qualification,
        age: Number(data.age) || calculateAge(data.dob),
        collegeUSNNumber: data.collegeUSNNumber,
        githubLink: data.githubLink,
        arrears: data.arrears,
        arrearsCount: data.arrears ? Number(data.arrearsCount) || 0 : 0,
        tenthStandard: Number(data.tenthStandard) || 0,
        tenthPassoutYear: data.tenthPassoutYear,
        twelfthStandard: Number(data.twelfthStandard) || 0,
        twelfthPassoutYear: data.twelfthPassoutYear || '',
        highestGraduationPercentage:
          Number(data.highestGraduationPercentage) || 0,
        studentSkills: selectedSkills,
        profileStatus: true,
      };

      if (!profileStatus) {
        if (data.password) dataToSend.password = data.password;
        if (data.profilePic) dataToSend.profilePic = data.profilePic;
        if (data.resume) dataToSend.resume = data.resume;
      }

      await updateStudentProfile(dataToSend, profileStatus);

      if (!profileStatus) {
        const updatedUserInfo = { ...userInfo, profileStatus: true };
        sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }

      dispatch(fetchStudentDetails({ id, location }));
      dispatch(setProfileStatus(true));
      dispatch(fetchProfilePicture(studentDetails.studentId));

      Swal.fire({
        title: 'Profile Successfully Updated',
        icon: 'success',
      });
      dispatch(setEdit(false));
    } catch (error) {
      console.error('Error during profile update:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Unable to update profile. Please try again.',
      });
    }
  };

  useEffect(() => {
    if (!studentDetails) return;

    setValue('name', studentDetails.name || '');
    setValue('dob', studentDetails.DOB || '');
    setValue('age', studentDetails.age || '');
    setValue(
      'gender',
      studentDetails.gender &&
        ['Male', 'Female'].includes(studentDetails.gender)
        ? studentDetails.gender
        : ''
    );
    setValue('collegeUSNNumber', studentDetails.collegeUSNNumber || '');
    setValue('githubLink', studentDetails.githubLink || '');
    setValue(
      'arrears',
      studentDetails.arrears === 'true' || studentDetails.arrears === true
    );
    setValue(
      'arrearsCount',
      studentDetails.ArrearsCount ? String(studentDetails.ArrearsCount) : ''
    );
    setValue('qualification', studentDetails.qualification || '');
    setValue('department', studentDetails.department || '');
    setValue('password', '');
    setValue('cpassword', '');
    setValue('state', studentDetails.state || '');
    setValue('cityname', studentDetails.city || '');
    setValue('yearOfPassing', studentDetails.yearOfPassing || '');
    setValue('collegeName', studentDetails.collegeName || '');
    setValue('tenthStandard', studentDetails.tenthStandard || '');
    setValue('tenthPassoutYear', studentDetails.TenthPassoutYear || '');
    setValue('twelfthStandard', studentDetails.twelfthStandard || '');
    setValue('twelfthPassoutYear', studentDetails.TwelfthPassoutYear || '');
    setValue('profilePic', null);
    setValue('resume', null);
    setValue('skills', studentDetails.studentSkills || []);
    setValue(
      'highestGraduationPercentage',
      studentDetails.highestGraduationpercentage || ''
    );

    setArrearsCount(
      studentDetails.ArrearsCount ? String(studentDetails.ArrearsCount) : ''
    );
    setSelectedSkills(studentDetails.studentSkills || []);

    if (studentDetails.qualification) {
      dispatch(fetchDepartments(studentDetails.qualification)).then(result => {
        if (fetchDepartments.fulfilled.match(result)) {
          const deptArray = result.payload.data;
          if (
            studentDetails.department &&
            !deptArray.includes(studentDetails.department)
          ) {
            dispatch({
              type: 'student/updateDepartments',
              payload: {
                qualification: studentDetails.qualification,
                department: studentDetails.department,
              },
            });
          }
        }
      });
    }
  }, [studentDetails, setValue, dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 font-[inter]">
      <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[#999999] text-xs font-medium">Start</span>
          <div className="flex-1 mx-2">
            <div className="relative w-full h-2 bg-[#E1E1E1] rounded-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#00007F] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 bg-[#00007F] rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-semibold"
                style={{ left: `calc(${progress}% - 12px)` }}
              >
                {progress}%
              </div>
            </div>
          </div>
          <span className="text-[#999999] text-xs font-medium">Completed</span>
        </div>
      </div>

      <div className="text-[#00007F] font-semibold text-2xl leading-tight mb-8 mt-12 md:mt-0 text-center">
        Student Profile
      </div>

      <div className="w-full max-w-7xl bg-white border border-[#E1E1E1] shadow-md rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-6 relative">
        <button
          type="button"
          onClick={() => dispatch(setEdit(false))}
          className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
        </button>

        <div className="hidden md:flex w-[10%] justify-center">
          <div className="flex flex-col items-center relative w-16 h-full">
            <span className="text-[#999999] text-xs mb-3">Start</span>
            <div className="relative w-2 flex-grow rounded-full bg-[#E1E1E1] overflow-visible">
              <div
                className="absolute top-0 left-0 w-full bg-[#00007F] rounded-full transition-all duration-300"
                style={{ height: `${progress}%` }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: `calc(100% - 19px)` }}
                >
                  <div className="w-9 h-9 bg-[#00007F] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[#999999] text-xs mt-3">Completed</span>
          </div>
        </div>

        <div className="w-full md:w-[90%] flex flex-col gap-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.name ? 'border-red-500' : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      onChange={e => {
                        field.onChange(e);
                        handleDOBChange(e);
                      }}
                      max={dayjs().subtract(10, 'years').format('YYYY-MM-DD')}
                      className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                        errors.dob ? 'border-red-500' : 'border-[#00007F]'
                      }`}
                    />
                  )}
                />
              </div>
              {errors.dob && (
                <span className="text-red-500 text-sm">
                  {errors.dob.message}
                </span>
              )}
            </div>

            {!profileStatus && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter Password"
                          className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                            errors.password
                              ? 'border-red-500'
                              : 'border-[#00007F]'
                          }`}
                        />
                      )}
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEye : faEyeSlash}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] cursor-pointer"
                      onClick={togglePasswordVisibility}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-red-500 text-sm">
                      {errors.password.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="cpassword"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type={showCPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                            errors.cpassword
                              ? 'border-red-500'
                              : 'border-[#00007F]'
                          }`}
                        />
                      )}
                    />
                    <FontAwesomeIcon
                      icon={showCPassword ? faEye : faEyeSlash}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] cursor-pointer"
                      onClick={toggleCPasswordVisibility}
                    />
                  </div>
                  {errors.cpassword && (
                    <span className="text-red-500 text-sm">
                      {errors.cpassword.message}
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="radio"
                        id="male"
                        value="Male"
                        checked={field.value === 'Male'}
                        onChange={() => field.onChange('Male')}
                        className="w-5 h-5 text-[#00007F] border-[#00007F] focus:ring-[#00007F]"
                      />
                    )}
                  />
                  <label
                    htmlFor="male"
                    className="text-[#666666] text-base font-medium"
                  >
                    Male
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="radio"
                        id="female"
                        value="Female"
                        checked={field.value === 'Female'}
                        onChange={() => field.onChange('Female')}
                        className="w-5 h-5 text-[#00007F] border-[#00007F] focus:ring-[#00007F]"
                      />
                    )}
                  />
                  <label
                    htmlFor="female"
                    className="text-[#666666] text-base font-medium"
                  >
                    Female
                  </label>
                </div>
              </div>
              {errors.gender && (
                <span className="text-red-500 text-sm">
                  {errors.gender.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Highest Qualification <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  name="qualification"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        handleQualificationChange(e);
                      }}
                      className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none ${
                        errors.qualification
                          ? 'border-red-500'
                          : 'border-[#00007F]'
                      }`}
                    >
                      <option value="">Select Qualification</option>
                      {qualificationList.map((qual, index) => (
                        <option key={index} value={qual}>
                          {qual}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-[#999999] text-l">
                  ▼
                </span>
              </div>
              {errors.qualification && (
                <span className="text-red-500 text-sm">
                  {errors.qualification.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                College USN/ID Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="collegeUSNNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your College USN/ID Number"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.collegeUSNNumber
                        ? 'border-red-500'
                        : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.collegeUSNNumber && (
                <span className="text-red-500 text-sm">
                  {errors.collegeUSNNumber.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Github Link
              </label>
              <Controller
                name="githubLink"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="url"
                    placeholder="Enter your Github link"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] border-[#00007F]`}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                City Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="cityname"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Select City"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.cityname ? 'border-red-500' : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.cityname && (
                <span className="text-red-500 text-sm">
                  {errors.cityname.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                State <span className="text-red-500">*</span>
              </label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your State"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.state ? 'border-red-500' : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.state && (
                <span className="text-red-500 text-sm">
                  {errors.state.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                10th Percentage <span className="text-red-500">*</span>
              </label>
              <Controller
                name="tenthStandard"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your 10th Percentage"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.tenthStandard
                        ? 'border-red-500'
                        : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.tenthStandard && (
                <span className="text-red-500 text-sm">
                  {errors.tenthStandard.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                10th Passout Year <span className="text-red-500">*</span>
              </label>
              <Controller
                name="tenthPassoutYear"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your 10th Passout Year"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.tenthPassoutYear
                        ? 'border-red-500'
                        : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.tenthPassoutYear && (
                <span className="text-red-500 text-sm">
                  {errors.tenthPassoutYear.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                12th Percentage <span className="text-red-500">*</span>
              </label>
              <Controller
                name="twelfthStandard"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your 12th Percentage"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.twelfthStandard
                        ? 'border-red-500'
                        : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.twelfthStandard && (
                <span className="text-red-500 text-sm">
                  {errors.twelfthStandard.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                12th Passout Year <span className="text-red-500">*</span>
              </label>
              <Controller
                name="twelfthPassoutYear"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your 12th Passout Year"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.twelfthPassoutYear
                        ? 'border-red-500'
                        : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.twelfthPassoutYear && (
                <span className="text-red-500 text-sm">
                  {errors.twelfthPassoutYear.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        handleDepartmentChange(e);
                      }}
                      disabled={departmentsLoading}
                      className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none ${
                        errors.department
                          ? 'border-red-500'
                          : 'border-[#00007F]'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {getDepartmentOptions().map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-[#999999] text-l">
                  ▼
                </span>
              </div>
              {isOtherDepartment && !isDepartmentAdded && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new department"
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  />
                  <button
                    type="button"
                    onClick={addDepartment}
                    className="px-4 py-3 bg-[#00007F] text-white font-medium text-sm rounded-lg hover:bg-[#000066]"
                  >
                    Add
                  </button>
                </div>
              )}
              {errors.department && (
                <span className="text-red-500 text-sm">
                  {errors.department.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Highest Qualification Year of Passing{' '}
                <span className="text-red-500">*</span>
              </label>
              <Controller
                name="yearOfPassing"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your Qualification Year"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.yearOfPassing
                        ? 'border-red-500'
                        : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.yearOfPassing && (
                <span className="text-red-500 text-sm">
                  {errors.yearOfPassing.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Graduated College Name (PG/UG/School){' '}
                <span className="text-red-500">*</span>
              </label>
              <Controller
                name="collegeName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your Graduated College Name"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                      errors.collegeName ? 'border-red-500' : 'border-[#00007F]'
                    }`}
                  />
                )}
              />
              {errors.collegeName && (
                <span className="text-red-500 text-sm">
                  {errors.collegeName.message}
                </span>
              )}
            </div>

            {!profileStatus && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Profile Picture (10KB){' '}
                  </label>
                  <Controller
                    name="profilePic"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif"
                        ref={profilePicRef}
                        onChange={e => handleFileChange(e, 'profilePic')}
                        className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg border-[#00007F]`}
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#00007F] font-medium text-lg">
                    Resume (100KB - pdf)
                  </label>
                  <Controller
                    name="resume"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        accept=".pdf"
                        ref={resumeRef}
                        onChange={e => handleFileChange(e, 'resume')}
                        className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg border-[#00007F]`}
                      />
                    )}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Percentage (Highest Graduation){' '}
              </label>
              <Controller
                name="highestGraduationPercentage"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your Percentage"
                    className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]`}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={currentSkill}
                  onChange={handleSkillChange}
                  className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] appearance-none ${
                    errors.skills ? 'border-red-500' : 'border-[#00007F]'
                  }`}
                >
                  <option value="">Select a skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-[#999999] text-l">
                  ▼
                </span>
              </div>
              {isOtherSkill && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter a new skill"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    className="w-full px-4 py-3 text-[#666666] text-base font-medium border border-[#00007F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={addSkill}
                className="mt-2 px-4 py-3 bg-[#00007F] text-white font-medium text-sm rounded-lg hover:bg-[#000066]"
              >
                Add Skill
              </button>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm"
                  >
                    <span className="text-[#666666]">{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-red-500 font-bold text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {errors.skills && (
                <span className="text-red-500 text-sm">
                  {errors.skills.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-lg">
                Arrears <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Controller
                    name="arrears"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="radio"
                        id="arrearsYes"
                        value="yes"
                        checked={field.value === true}
                        onChange={() => {
                          field.onChange(true);
                          handleArrearsChange('yes');
                        }}
                        className="w-5 h-5 text-[#00007F] border-[#00007F] focus:ring-[#00007F]"
                      />
                    )}
                  />
                  <label
                    htmlFor="arrearsYes"
                    className="text-[#666666] text-base font-medium"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    name="arrears"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="radio"
                        id="arrearsNo"
                        value="no"
                        checked={field.value === false}
                        onChange={() => {
                          field.onChange(false);
                          handleArrearsChange('no');
                        }}
                        className="w-5 h-5 text-[#00007F] border-[#00007F] focus:ring-[#00007F]"
                      />
                    )}
                  />
                  <label
                    htmlFor="arrearsNo"
                    className="text-[#666666] text-base font-medium"
                  >
                    No
                  </label>
                </div>
              </div>
              {errors.arrears && (
                <span className="text-red-500 text-sm">
                  {errors.arrears.message}
                </span>
              )}
            </div>

            {watch('arrears') === true && (
              <div className="flex flex-col gap-2">
                <label className="text-[#00007F] font-medium text-lg">
                  How many arrears do you have?{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="arrearsCount"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      value={arrearsCount}
                      onChange={e => {
                        field.onChange(e);
                        handleArrearsCountChange(e);
                      }}
                      placeholder="Enter number of arrears"
                      className={`w-full px-4 py-3 text-[#666666] text-base font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00007F] ${
                        errors.arrearsCount
                          ? 'border-red-500'
                          : 'border-[#00007F]'
                      }`}
                    />
                  )}
                />
                {errors.arrearsCount && (
                  <span className="text-red-500 text-sm">
                    {errors.arrearsCount.message}
                  </span>
                )}
              </div>
            )}

            <div className="col-span-1 sm:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                disabled={
                  Object.values(errors).some(error => error) ||
                  departmentsLoading
                }
                className={`w-full py-3 bg-[#00007F] text-white font-medium text-base rounded-lg hover:bg-[#000066] transition-colors ${
                  Object.values(errors).some(error => error) ||
                  departmentsLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {departmentsLoading ? 'Loading Departments...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
