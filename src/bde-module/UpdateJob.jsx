import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../reducers/Jobsslice.js';
import { useNavigate } from 'react-router-dom';
import { getDepartments } from '../services/studentService.js';
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 text-red-600">
          Something went wrong. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

const UpdateJob = () => {
  const dispatch = useDispatch();
  const { jobs } = useSelector(state => state.jobs);
  const navigate = useNavigate();

  const [state, setState] = useState({
    editingJobId: null,
    formData: {
      companyName: '',
      jobRole: '',
      salary: '',
      academicPercentage: '',
      jobLocation: '',
      specialNote: '',
      bond: '',
    },
    skills: [
      'HTML',
      'CSS',
      'JavaScript',
      'Python',
      'Java',
      'Node.js',
      'React.js',
      'Angular',
      'Vue.js',
      'Machine Learning',
      'Django',
      'Spring Boot',
      'C++',
      'C#',
      'Ruby',
      'PHP',
      'Flask',
      'Bootstrap',
      'MySQL',
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
      'Hibernate',
      'Spring',
      'JSP',
      'Servlets',
    ],
    departments: {
      UG: [],
      PG: [],
    },
    years: Array.from({ length: 14 }, (_, index) => 2015 + index),
    currentSkill: '',
    customSkill: '',
    selectedSkills: [],
    currentYear: '',
    selectedYears: [],
    currentQualification: '',
    currentDepartment: '',
    customDepartment: '',
    selectedQualifications: [],
    selectedDepartments: { UG: [], PG: [] },
    isUpdated: false,
    errors: {
      qualificationError: '',
      departmentError: '',
      yearsError: '',
      skillsError: '',
      companyNameError: '',
      jobRoleError: '',
      bondError: '',
      salaryError: '',
      academicPercentageError: '',
      jobLocationError: '',
      specialNoteError: '',
    },
  });

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllDepartments = async () => {
      const newDepartments = { UG: [], PG: [] };
      for (const qual of state.selectedQualifications) {
        const qualKey = qual === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
        try {
          const response = await getDepartments(qual);
          if (Array.isArray(response[qual])) {
            newDepartments[qualKey] = response[qual];
          } else {
            newDepartments[qualKey] =
              qualKey === 'UG'
                ? [
                    'CSE',
                    'ISE',
                    'IT',
                    'ECE',
                    'EEE',
                    'CIVIL',
                    'MECH',
                    'AIML',
                    'AIDS',
                    'CSD',
                    'BCA',
                    'BSC',
                  ]
                : ['MBA', 'BBA', 'MTECH CSE', 'IoT', 'MCA', 'MSC'];
          }
        } catch (error) {
          console.warn(
            `Failed to fetch departments for ${qual}, using defaults`
          );
          newDepartments[qualKey] =
            qualKey === 'UG'
              ? [
                  'CSE',
                  'ISE',
                  'IT',
                  'ECE',
                  'EEE',
                  'CIVIL',
                  'MECH',
                  'AIML',
                  'AIDS',
                  'CSD',
                  'BCA',
                  'BSC',
                ]
              : ['MBA', 'BBA', 'MTECH CSE', 'IoT', 'MCA', 'MSC'];
        }
      }
      setField('departments', newDepartments);
    };
    if (state.selectedQualifications.length > 0) {
      fetchAllDepartments();
    }
  }, [state.selectedQualifications]);

  useEffect(() => {
    if (jobs.length > 0 && !state.editingJobId) {
      handleEditClick(jobs[0].job_id);
    }
  }, [jobs]);

  const setField = (field, value) => {
    setState(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const setError = (errorField, message) => {
    setState(prevState => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [errorField]: message,
      },
    }));
  };

  const handleEditClick = jobId => {
    const jobToEdit = jobs.find(job => job.job_id === jobId);
    if (jobToEdit) {
      const qualifications = Array.isArray(jobToEdit.educationQualification)
        ? jobToEdit.educationQualification
        : jobToEdit.educationQualification
          ? [jobToEdit.educationQualification]
          : [];
      const departments = Array.isArray(jobToEdit.department)
        ? jobToEdit.department
        : jobToEdit.department
          ? jobToEdit.department.split(', ')
          : [];
      const selectedDepartments = { UG: [], PG: [] };
      if (qualifications.includes('UG (Bachelor Degrees)')) {
        selectedDepartments.UG = departments.filter(
          dep =>
            state.departments.UG.includes(dep) ||
            !state.departments.PG.includes(dep)
        );
      }
      if (qualifications.includes('PG (Postgraduate Degrees)')) {
        selectedDepartments.PG = departments.filter(dep =>
          state.departments.PG.includes(dep)
        );
      }
      const remainingDepts = departments.filter(
        dep =>
          !selectedDepartments.UG.includes(dep) &&
          !selectedDepartments.PG.includes(dep)
      );
      if (
        remainingDepts.length > 0 &&
        qualifications.includes('UG (Bachelor Degrees)')
      ) {
        selectedDepartments.UG.push(...remainingDepts);
      } else if (
        remainingDepts.length > 0 &&
        qualifications.includes('PG (Postgraduate Degrees)')
      ) {
        selectedDepartments.PG.push(...remainingDepts);
      }

      setState(prevState => ({
        ...prevState,
        editingJobId: jobToEdit.job_id,
        selectedSkills: Array.isArray(jobToEdit.technologies)
          ? jobToEdit.technologies
          : jobToEdit.technologies
            ? jobToEdit.technologies.split(', ')
            : [],
        selectedYears: Array.isArray(jobToEdit.graduates)
          ? jobToEdit.graduates
          : jobToEdit.graduates
            ? jobToEdit.graduates.split(', ')
            : [],
        selectedQualifications: qualifications,
        selectedDepartments,
        formData: {
          companyName: jobToEdit.companyName || '',
          jobRole: jobToEdit.jobRole || '',
          salary: jobToEdit.salary || '',
          academicPercentage: jobToEdit.percentage || '',
          jobLocation: jobToEdit.jobLocation || '',
          specialNote: jobToEdit.specialNote || '',
          bond: jobToEdit.bond || '',
        },
      }));
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setField('formData', {
      ...state.formData,
      [name]: value,
    });
    setError(
      `${name}Error`,
      value
        ? ''
        : `${
            name.charAt(0).toUpperCase() +
            name
              .slice(1)
              .replace(/([A-Z])/g, ' $1')
              .trim()
          } is required`
    );
  };

  const handleCurrentSkill = e => {
    setField('currentSkill', e.target.value);
    setError('skillsError', '');
  };

  const handleCustomSkill = e => {
    setField('customSkill', e.target.value);
    setError('skillsError', '');
  };

  const addSkill = () => {
    if (!state.currentSkill && !state.customSkill) {
      setError('skillsError', 'Please select or enter a skill.');
      return;
    }
    const newSkill =
      state.currentSkill === 'Other'
        ? state.customSkill.trim()
        : state.currentSkill;
    if (!newSkill) {
      setError('skillsError', 'Custom skill cannot be empty.');
      return;
    }
    if (state.selectedSkills.includes(newSkill)) {
      setError('skillsError', 'This skill is already added.');
      return;
    }
    setField('selectedSkills', [...state.selectedSkills, newSkill]);
    setField('formData', {
      ...state.formData,
      skills: [...state.selectedSkills, newSkill],
    });
    setField('currentSkill', '');
    setField('customSkill', '');
    setError('skillsError', '');
  };

  const removeSkill = skill => {
    const updatedSkills = state.selectedSkills.filter(s => s !== skill);
    setField('selectedSkills', updatedSkills);
    setField('formData', {
      ...state.formData,
      skills: updatedSkills,
    });
    setError(
      'skillsError',
      updatedSkills.length === 0 ? 'At least one skill is required.' : ''
    );
  };

  const handleCurrentQualification = e => {
    setField('currentQualification', e.target.value);
    setError('qualificationError', '');
  };

  const addQualification = () => {
    if (!state.currentQualification) {
      setError('qualificationError', 'Please select a qualification.');
      return;
    }
    if (state.selectedQualifications.includes(state.currentQualification)) {
      setError('qualificationError', 'This qualification is already added.');
      return;
    }
    const qualKey =
      state.currentQualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    setField('selectedQualifications', [
      ...state.selectedQualifications,
      state.currentQualification,
    ]);
    setField('selectedDepartments', {
      ...state.selectedDepartments,
      [qualKey]: [],
    });
    setField('currentQualification', '');
    setError('qualificationError', '');
  };

  const removeQualification = qualification => {
    const updatedQualifications = state.selectedQualifications.filter(
      q => q !== qualification
    );
    const qualKey = qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    const newSelectedDepartments = {
      ...state.selectedDepartments,
      [qualKey]: [],
    };
    setField('selectedQualifications', updatedQualifications);
    setField('selectedDepartments', newSelectedDepartments);
    setError(
      'qualificationError',
      updatedQualifications.length === 0
        ? 'Education Qualification should not be empty.'
        : ''
    );
  };

  const handleCurrentDepartment = e => {
    setField('currentDepartment', e.target.value);
    setError('departmentError', '');
  };

  const handleCustomDepartment = e => {
    setField('customDepartment', e.target.value);
    setError('departmentError', '');
  };

  const addDepartment = qualification => {
    if (!state.currentDepartment && !state.customDepartment) {
      setError('departmentError', 'Please select or enter a department.');
      return;
    }
    const qualKey = qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    const newDepartment =
      state.currentDepartment === 'Other'
        ? state.customDepartment.charAt(0).toUpperCase() +
          state.customDepartment.slice(1).trim()
        : state.currentDepartment;
    if (!newDepartment) {
      setError('departmentError', 'Custom department cannot be empty.');
      return;
    }
    if (state.selectedDepartments[qualKey].includes(newDepartment)) {
      setError('departmentError', 'This department is already added.');
      return;
    }
    setField('selectedDepartments', {
      ...state.selectedDepartments,
      [qualKey]: [...state.selectedDepartments[qualKey], newDepartment],
    });
    setField('currentDepartment', '');
    setField('customDepartment', '');
    setError('departmentError', '');
  };

  const removeDepartment = (qualification, department) => {
    const qualKey = qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    const updatedDepartments = state.selectedDepartments[qualKey].filter(
      dep => dep !== department
    );
    setField('selectedDepartments', {
      ...state.selectedDepartments,
      [qualKey]: updatedDepartments,
    });
  };

  const handleChangeYear = e => {
    setField('currentYear', e.target.value);
    setError('yearsError', '');
  };

  const addYear = () => {
    if (!state.currentYear) {
      setError('yearsError', 'Please select a year.');
      return;
    }
    if (state.selectedYears.includes(state.currentYear)) {
      setError('yearsError', 'This year is already added.');
      return;
    }
    setField('selectedYears', [...state.selectedYears, state.currentYear]);
    setField('formData', {
      ...state.formData,
      graduatedYear: [...state.selectedYears, state.currentYear],
    });
    setField('currentYear', '');
    setError('yearsError', '');
  };

  const removeYear = year => {
    const updatedYears = state.selectedYears.filter(y => y !== year);
    setField('selectedYears', updatedYears);
    setField('formData', {
      ...state.formData,
      graduatedYear: updatedYears,
    });
    setError(
      'yearsError',
      updatedYears.length === 0 ? 'At least one year is required.' : ''
    );
  };

  const validateForm = () => {
    const errors = {
      companyNameError: !state.formData.companyName
        ? 'Company name is required'
        : '',
      jobRoleError:
        !state.formData.jobRole || state.formData.jobRole.length < 3
          ? 'Job role must be at least 3 characters'
          : '',
      qualificationError:
        state.selectedQualifications.length === 0
          ? 'At least one qualification is required.'
          : '',
      departmentError: Object.values(state.selectedDepartments).every(
        deps => deps.length === 0
      )
        ? 'At least one department is required.'
        : '',
      yearsError:
        state.selectedYears.length === 0
          ? 'At least one year is required.'
          : '',
      skillsError:
        state.selectedSkills.length === 0
          ? 'At least one skill is required.'
          : '',
      bondError: !state.formData.bond ? 'Bond is required.' : '',
      salaryError: !state.formData.salary ? 'Salary is required.' : '',
      academicPercentageError: !state.formData.academicPercentage
        ? 'Percentage is required'
        : Number(state.formData.academicPercentage) < 0 ||
            Number(state.formData.academicPercentage) > 100
          ? 'Percentage must be between 0 and 100'
          : '',
      jobLocationError: !state.formData.jobLocation
        ? 'Job location is required.'
        : '',
      specialNoteError: !state.formData.specialNote
        ? 'Special note is required'
        : '',
    };
    setState(prevState => ({
      ...prevState,
      errors,
    }));
    return !Object.values(errors).some(error => error !== '');
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    const mergedDepartments = Object.values(state.selectedDepartments).flat();
    const updatedJob = {
      job_id: state.editingJobId,
      jobRole: state.formData.jobRole,
      companyName: state.formData.companyName,
      salary: state.formData.salary,
      graduates: state.selectedYears,
      educationQualification: state.selectedQualifications,
      department: mergedDepartments,
      percentage: state.formData.academicPercentage,
      jobSkills: state.selectedSkills,
      jobLocation: state.formData.jobLocation,
      specialNote: state.formData.specialNote,
      bond: state.formData.bond,
    };

    try {
      setField('isUpdated', true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/editjob`,
        updatedJob
      );

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Job Updated Successfully',
          showConfirmButton: false,
          timer: 3000,
        });
        setField('isUpdated', false);
        setField('editingJobId', null);
        setField('formData', {
          companyName: '',
          jobRole: '',
          salary: '',
          academicPercentage: '',
          jobLocation: '',
          specialNote: '',
          bond: '',
        });
        setField('selectedSkills', []);
        setField('selectedYears', []);
        setField('selectedQualifications', []);
        setField('selectedDepartments', { UG: [], PG: [] });
        dispatch(fetchJobs());
        navigate(-1);
      }
    } catch (error) {
      setError(
        'error',
        error.response?.data?.message || 'Failed to update job details'
      );
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update job.',
      });
      setField('isUpdated', false);
    }
  };

  const applyCancel = () => {
    setState(prevState => ({
      ...prevState,
      editingJobId: null,
      formData: {
        companyName: '',
        jobRole: '',
        salary: '',
        academicPercentage: '',
        jobLocation: '',
        specialNote: '',
        bond: '',
      },
      selectedSkills: [],
      selectedYears: [],
      selectedQualifications: [],
      selectedDepartments: { UG: [], PG: [] },
    }));
    navigate(-1);
  };

  return (
    <ErrorBoundary>
      <div className="w-full p-4 font-[poppins] rounded-[30px] mt-0">
        <style>
          {`
          .selected-skills, .selected-years, .selected-qualifications, .selected-departments {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
          }
          .selected-skills div, .selected-years div, .selected-qualifications div, .selected-departments div {
            background: #e6e6fa;
            padding: 5px 10px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
            color: #333;
          }
          .remove-skill, .remove-year, .remove-qualification, .remove-department {
            background: #ff4d4d;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
          }
          .add-skill-button, .add-year-button, .add-qualification-button, .add-department-button {
            background: #00007F;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 14px;
          }
          .add-skill-button:hover, .add-year-button:hover, .add-qualification-button:hover, .add-department-button:hover {
            background: #0000cc;
          }
          .custom-skill-input, .custom-department-input {
            width: 100%;
            border: 1px solid #00007F;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-size: 16px;
          }
          .error-message {
            color: #EC5F70;
            font-size: 14px;
            margin-top: 5px;
          }
          .department-section {
           
            border-radius: 8px;
            margin-top: 12px;
          }
        `}
        </style>
        <div className="p-2">
          <h2 className="text-center text-[25px] font-semibold text-[#00007F]">
            Update Job
          </h2>
        </div>
        <div
          className="w-full bg-white p-8 rounded-[30px]"
          style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
        >
          <form onSubmit={handleFormSubmit}>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Company Name <span className="text-[#EC5F70]">*</span>
                </h2>
                <input
                  type="text"
                  name="companyName"
                  value={state.formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Ex: Codegnan"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  required
                  aria-label="Company Name"
                  aria-describedby="companyNameError-error"
                />
                {state.errors.companyNameError && (
                  <p id="companyNameError-error" className="error-message">
                    {state.errors.companyNameError}
                  </p>
                )}
              </div>
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Job Role <span className="text-[#EC5F70]">*</span>
                </h2>
                <input
                  type="text"
                  name="jobRole"
                  value={state.formData.jobRole}
                  onChange={handleInputChange}
                  placeholder="Ex: Full stack developer"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  required
                  aria-label="Job Role"
                  aria-describedby="jobRoleError-error"
                />
                {state.errors.jobRoleError && (
                  <p id="jobRoleError-error" className="error-message">
                    {state.errors.jobRoleError}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Education Qualification{' '}
                  <span className="text-[#EC5F70]">*</span>
                </h2>
                <div className="relative flex items-center gap-2">
                  <select
                    value={state.currentQualification}
                    onChange={handleCurrentQualification}
                    className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] pr-10 rounded-[4px] appearance-none text-gray-500"
                    aria-label="Education Qualification"
                    aria-describedby="qualificationError-error"
                  >
                    <option value="">Select Qualification</option>
                    <option
                      value="UG (Bachelor Degrees)"
                      disabled={state.selectedQualifications.includes(
                        'UG (Bachelor Degrees)'
                      )}
                    >
                      UG (Bachelor Degrees)
                    </option>
                    <option
                      value="PG (Postgraduate Degrees)"
                      disabled={state.selectedQualifications.includes(
                        'PG (Postgraduate Degrees)'
                      )}
                    >
                      PG (Postgraduate Degrees)
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="add-qualification-button"
                  >
                    Add Qualification
                  </button>
                </div>
                {state.errors.qualificationError && (
                  <p id="qualificationError-error" className="error-message">
                    {state.errors.qualificationError}
                  </p>
                )}
                <div className="selected-qualifications">
                  {(state.selectedQualifications || []).map(qual => (
                    <div key={`qual-${qual}`}>
                      {qual}
                      <button
                        type="button"
                        onClick={() => removeQualification(qual)}
                        className="remove-qualification"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Graduated Year <span className="text-[#EC5F70]">*</span>
                </h2>
                <div className="relative flex items-center gap-2">
                  <select
                    value={state.currentYear}
                    onChange={handleChangeYear}
                    className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] pr-10 rounded-[4px] appearance-none text-gray-500"
                    aria-label="Graduated Year"
                    aria-describedby="yearsError-error"
                  >
                    <option value="">Select Graduated Year</option>
                    {(state.years || []).map(year => (
                      <option
                        key={year}
                        value={year}
                        disabled={state.selectedYears.includes(year.toString())}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addYear}
                    className="add-year-button"
                  >
                    Add Year
                  </button>
                </div>
                {state.errors.yearsError && (
                  <p id="yearsError-error" className="error-message">
                    {state.errors.yearsError}
                  </p>
                )}
                <div className="selected-years">
                  {(state.selectedYears || []).map(year => (
                    <div key={`year-${year}`}>
                      {year}
                      <button
                        type="button"
                        onClick={() => removeYear(year)}
                        className="remove-year"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full pt-[22px]">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Branch/Department <span className="text-[#EC5F70]">*</span>
              </h2>
              {state.selectedQualifications.includes(
                'UG (Bachelor Degrees)'
              ) && (
                <div className="department-section">
                  <h3 className="text-[18px] font-medium text-[#00007F] mb-2">
                    UG (Bachelor Degrees)
                  </h3>
                  <div className="relative flex items-center gap-2">
                    <select
                      value={state.currentDepartment}
                      onChange={handleCurrentDepartment}
                      className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] pr-10 rounded-[4px] appearance-none text-gray-500"
                      aria-label="UG Department"
                    >
                      <option value="">Select Department for UG</option>
                      {(state.departments.UG || []).map(dept => (
                        <option key={`ug-dept-${dept}`} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => addDepartment('UG (Bachelor Degrees)')}
                      className="add-department-button"
                    >
                      Add Department
                    </button>
                  </div>
                  {state.currentDepartment === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom department"
                      value={state.customDepartment}
                      onChange={handleCustomDepartment}
                      className="custom-department-input"
                      aria-label="Custom UG Department"
                    />
                  )}
                </div>
              )}
              {state.selectedQualifications.includes(
                'PG (Postgraduate Degrees)'
              ) && (
                <div className="department-section">
                  <h3 className="text-[18px] font-medium text-[#00007F] mb-2">
                    PG (Postgraduate Degrees)
                  </h3>
                  <div className="relative flex items-center gap-2">
                    <select
                      value={state.currentDepartment}
                      onChange={handleCurrentDepartment}
                      className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] pr-10 rounded-[4px] appearance-none text-gray-500"
                      aria-label="PG Department"
                    >
                      <option value="">Select Department for PG</option>
                      {(state.departments.PG || []).map(dept => (
                        <option key={`pg-dept-${dept}`} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => addDepartment('PG (Postgraduate Degrees)')}
                      className="add-department-button"
                    >
                      Add Department
                    </button>
                  </div>
                  {state.currentDepartment === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom department"
                      value={state.customDepartment}
                      onChange={handleCustomDepartment}
                      className="custom-department-input"
                      aria-label="Custom PG Department"
                    />
                  )}
                </div>
              )}
              {(state.selectedDepartments.UG.length > 0 ||
                state.selectedDepartments.PG.length > 0) && (
                <div className="selected-departments mt-4">
                  {(state.selectedDepartments.UG || []).map(dep => (
                    <div key={`ug-dep-${dep}`}>
                      {dep} (UG)
                      <button
                        type="button"
                        onClick={() =>
                          removeDepartment('UG (Bachelor Degrees)', dep)
                        }
                        className="remove-department"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  {(state.selectedDepartments.PG || []).map(dep => (
                    <div key={`pg-dep-${dep}`}>
                      {dep} (PG)
                      <button
                        type="button"
                        onClick={() =>
                          removeDepartment('PG (Postgraduate Degrees)', dep)
                        }
                        className="remove-department"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {state.errors.departmentError && (
                <p id="departmentError-error" className="error-message">
                  {state.errors.departmentError}
                </p>
              )}
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Skills <span className="text-[#EC5F70]">*</span>
                </h2>
                <div className="relative flex items-center gap-2">
                  <select
                    value={state.currentSkill}
                    onChange={handleCurrentSkill}
                    className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] pr-10 rounded-[4px] appearance-none text-gray-500"
                    aria-label="Skills"
                    aria-describedby="skillsError-error"
                  >
                    <option value="">Select Skills</option>
                    {(state.skills || []).map(skill => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="add-skill-button"
                  >
                    Add Skill
                  </button>
                </div>
                {state.currentSkill === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom skill"
                    value={state.customSkill}
                    onChange={handleCustomSkill}
                    className="custom-skill-input"
                    aria-label="Custom Skill"
                  />
                )}
                {state.errors.skillsError && (
                  <p id="skillsError-error" className="error-message">
                    {state.errors.skillsError}
                  </p>
                )}
                <div className="selected-skills">
                  {(state.selectedSkills || []).map(skill => (
                    <div key={`skill-${skill}`}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="remove-skill"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Academic Percentage <span className="text-[#EC5F70]">*</span>
                </h2>
                <input
                  type="number"
                  name="academicPercentage"
                  value={state.formData.academicPercentage}
                  onChange={handleInputChange}
                  placeholder="Ex: 70"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  required
                  aria-label="Academic Percentage"
                  aria-describedby="academicPercentageError-error"
                />
                {state.errors.academicPercentageError && (
                  <p
                    id="academicPercentageError-error"
                    className="error-message"
                  >
                    {state.errors.academicPercentageError}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Bond <span className="text-[#EC5F70]">*</span>
                </h2>
                <input
                  type="number"
                  name="bond"
                  value={state.formData.bond}
                  onChange={handleInputChange}
                  placeholder="Ex: 1"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  required
                  aria-label="Bond"
                  aria-describedby="bondError-error"
                />
                {state.errors.bondError && (
                  <p id="bondError-error" className="error-message">
                    {state.errors.bondError}
                  </p>
                )}
              </div>
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Salary <span className="text-[#EC5F70]">*</span>
                </h2>
                <input
                  type="text"
                  name="salary"
                  value={state.formData.salary}
                  onChange={handleInputChange}
                  placeholder="Ex: 4LPA"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  required
                  aria-label="Salary"
                  aria-describedby="salaryError-error"
                />
                {state.errors.salaryError && (
                  <p id="salaryError-error" className="error-message">
                    {state.errors.salaryError}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Location <span className="text-[#EC5F70]">*</span>
                </h2>
                <input
                  type="text"
                  name="jobLocation"
                  value={state.formData.jobLocation}
                  onChange={handleInputChange}
                  placeholder="Ex: Vijayawada"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  required
                  aria-label="Job Location"
                  aria-describedby="jobLocationError-error"
                />
                {state.errors.jobLocationError && (
                  <p id="jobLocationError-error" className="error-message">
                    {state.errors.jobLocationError}
                  </p>
                )}
              </div>
              <div className="w-full">
                <h2 className="text-[20px] font-medium text-[#00007F]">
                  Special Note <span className="text-[#EC5F70]">*</span>
                </h2>
                <textarea
                  name="specialNote"
                  value={state.formData.specialNote}
                  onChange={handleInputChange}
                  placeholder="Ex: Immediate recruitment"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                  rows="4"
                  required
                  aria-label="Special Note"
                  aria-describedby="specialNoteError-error"
                />
                {state.errors.specialNoteError && (
                  <p id="specialNoteError-error" className="error-message">
                    {state.errors.specialNoteError}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full pt-[22px] grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                className="w-full border rounded-[10px] border-[#00007F] py-3 bg-[#00007F] text-[18px] text-[#FFFFFF] font-medium hover:bg-[#0000cc] disabled:opacity-50"
                disabled={state.isUpdated}
              >
                {state.isUpdated ? 'Updating...' : 'Update Job'}
              </button>
              <button
                type="button"
                onClick={applyCancel}
                className="w-full border rounded-[10px] border-[#00007F] py-3 bg-white text-[18px] text-[#00007F] font-medium hover:bg-[#f0f0f0]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UpdateJob;
