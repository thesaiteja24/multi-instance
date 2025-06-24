import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../reducers/Jobsslice.js';
import { getDepartments } from '../services/studentService.js';

export default function AddJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const { userInfo } = useSelector(state => state.auth);
  const location = userInfo?.location || '';
  const BDEId = userInfo?.id || '';

  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [graduates, setGraduates] = useState('');
  const [salary, setSalary] = useState('');
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [currentQualification, setCurrentQualification] = useState('');
  const [departments, setDepartments] = useState({ UG: [], PG: [] });
  const [selectedDepartments, setSelectedDepartments] = useState({
    UG: [],
    PG: [],
  });
  const [currentDepartment, setCurrentDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [percentage, setPercentage] = useState('');
  const [bond, setBond] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [deadLine, setDeadLine] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [designation, setDesignation] = useState('');
  const [interviewMode, setInterviewMode] = useState('');
  const [customInterviewMode, setCustomInterviewMode] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [errors, setErrors] = useState({
    companyName: '',
    jobRole: '',
    graduates: '',
    salary: '',
    educationQualification: '',
    department: '',
    percentage: '',
    skills: '',
    bond: '',
    jobLocation: '',
    deadLine: '',
    interviewMode: '',
    specialNote: '',
  });

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
    'Flask Framework',
    'Bootstrap',
    'MySQL',
    'TypeScript',
    'Go',
    'Rust',
    'Kotlin',
    'SQL',
    'Shell Scripting',
    'PostgreSQL',
    'MongoDB',
    'MATLAB',
    'R',
    'AWS',
    'Docker',
    'Kubernetes',
    'GraphQL',
    'Terraform',
    'Ansible',
    'DevOps',
    'Hibernate',
    'JSP',
    'Servlets',
    'VB.NET',
  ];

  const years = Array.from({ length: 14 }, (_, index) => 2015 + index);

  const interviewModes = [
    'Online',
    'Offline',
    'Phone',
    'Video Interview',
    'In-Person',
    'Offline Interview at Vijayawada',
    'Offline Interview at Hyderabad',
    'Offline Interview at Bengaluru',
    'Others',
  ];

  useEffect(() => {
    const fetchAllDepartments = async () => {
      const newDepartments = { UG: [], PG: [] };
      for (const qual of selectedQualifications) {
        const qualKey = qual === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
        try {
          const data = await getDepartments(qual);
          newDepartments[qualKey] = Array.isArray(data[qual]) ? data[qual] : [];
        } catch (error) {
          console.error(`Error fetching departments for ${qual}:`, error);
          newDepartments[qualKey] = [];
        }
      }
      setDepartments(newDepartments);
    };
    fetchAllDepartments();
  }, [selectedQualifications]);

  const handleDateChange = e => {
    const value = e.target.value;
    if (!value) {
      setDeadLine('');
      setErrors(prev => ({ ...prev, deadLine: 'Deadline is required' }));
      return;
    }
    const [date, time] = value.split('T');
    const formattedTime = formatTimeTo24Hour(time);
    const formattedDateTime = `${date} ${formattedTime}`;
    setDeadLine(formattedDateTime);
    setErrors(prev => ({ ...prev, deadLine: '' }));
  };

  const formatTimeTo24Hour = time => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const hour24 = hour.padStart(2, '0');
    const minutePadded = minute.padStart(2, '0');
    return `${hour24}:${minutePadded}`;
  };

  const openCalendar = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
      dateInputRef.current.focus();
    }
  };

  const addSkill = () => {
    let skillToAdd = currentSkill;
    if (currentSkill === 'Other') {
      if (!customSkill.trim()) {
        setErrors(prev => ({
          ...prev,
          skills: 'Custom skill cannot be empty.',
        }));
        return;
      }
      skillToAdd =
        customSkill.charAt(0).toUpperCase() + customSkill.slice(1).trim();
    }
    if (skillToAdd && !selectedSkills.includes(skillToAdd)) {
      setSelectedSkills([...selectedSkills, skillToAdd]);
      setErrors(prev => ({ ...prev, skills: '' }));
      setCurrentSkill('');
      setCustomSkill('');
    }
  };

  const removeSkill = skill => {
    const updatedSkills = selectedSkills.filter(item => item !== skill);
    setSelectedSkills(updatedSkills);
    setErrors(prev => ({
      ...prev,
      skills:
        updatedSkills.length === 0 ? 'Skills field could not be empty.' : '',
    }));
  };

  const addQualification = () => {
    if (
      currentQualification &&
      !selectedQualifications.includes(currentQualification)
    ) {
      setSelectedQualifications([
        ...selectedQualifications,
        currentQualification,
      ]);
      setErrors(prev => ({ ...prev, educationQualification: '' }));
      setSelectedDepartments(prev => ({
        ...prev,
        [currentQualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG']: [],
      }));
    }
    setCurrentQualification('');
  };

  const removeQualification = qualification => {
    const updatedQualifications = selectedQualifications.filter(
      q => q !== qualification
    );
    setSelectedQualifications(updatedQualifications);
    const qualKey = qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    setSelectedDepartments(prev => {
      const newSelected = { ...prev };
      delete newSelected[qualKey];
      return newSelected;
    });
    setErrors(prev => ({
      ...prev,
      educationQualification:
        updatedQualifications.length === 0
          ? 'Education qualification field could not be empty.'
          : '',
      department: Object.values(selectedDepartments).every(
        deps => deps.length === 0
      )
        ? 'Department could not be empty.'
        : '',
    }));
  };

  const addDepartment = qualification => {
    const qualKey = qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    let deptToAdd = currentDepartment;
    if (currentDepartment === 'Others') {
      if (!customDepartment.trim()) {
        setErrors(prev => ({
          ...prev,
          department: 'Custom department cannot be empty.',
        }));
        return;
      }
      deptToAdd =
        customDepartment.charAt(0).toUpperCase() +
        customDepartment.slice(1).trim();
    }
    if (deptToAdd && !selectedDepartments[qualKey].includes(deptToAdd)) {
      setSelectedDepartments(prev => ({
        ...prev,
        [qualKey]: [...prev[qualKey], deptToAdd],
      }));
      setErrors(prev => ({ ...prev, department: '' }));
    }
    setCurrentDepartment('');
    setCustomDepartment('');
  };

  const removeDepartment = (qualification, departmentToRemove) => {
    const qualKey = qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG';
    const updatedDepartments = selectedDepartments[qualKey].filter(
      dep => dep !== departmentToRemove
    );
    setSelectedDepartments(prev => ({
      ...prev,
      [qualKey]: updatedDepartments,
    }));
    setErrors(prev => ({
      ...prev,
      department: Object.values({
        ...selectedDepartments,
        [qualKey]: updatedDepartments,
      }).every(deps => deps.length === 0)
        ? 'Department could not be empty.'
        : '',
    }));
  };

  const addYear = () => {
    if (graduates && !selectedYears.includes(graduates)) {
      setSelectedYears([...selectedYears, graduates]);
      setErrors(prev => ({ ...prev, graduates: '' }));
      setGraduates('');
    }
  };

  const removeYear = yearToRemove => {
    const updatedYears = selectedYears.filter(year => year !== yearToRemove);
    setSelectedYears(updatedYears);
    setErrors(prev => ({
      ...prev,
      graduates:
        updatedYears.length === 0 ? 'Graduates field could not be empty.' : '',
    }));
  };

  const resetForm = () => {
    setCompanyName('');
    setJobRole('');
    setGraduates('');
    setSalary('');
    setSelectedQualifications([]);
    setCurrentQualification('');
    setDepartments({ UG: [], PG: [] });
    setSelectedDepartments({ UG: [], PG: [] });
    setCurrentDepartment('');
    setCustomDepartment('');
    setPercentage('');
    setBond('');
    setJobLocation('');
    setDeadLine('');
    setSpecialNote('');
    setDesignation('');
    setInterviewMode('');
    setCustomInterviewMode('');
    setSelectedSkills([]);
    setCurrentSkill('');
    setCustomSkill('');
    setSelectedYears([]);
    setErrors({
      companyName: '',
      jobRole: '',
      graduates: '',
      salary: '',
      educationQualification: '',
      department: '',
      percentage: '',
      skills: '',
      bond: '',
      jobLocation: '',
      deadLine: '',
      interviewMode: '',
      specialNote: '',
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {
      companyName: !companyName ? 'Company name is required' : '',
      jobRole:
        !jobRole || jobRole.length < 3
          ? 'Job role must be at least 3 characters'
          : '',
      graduates:
        selectedYears.length === 0 ? 'Graduates field could not be empty.' : '',
      salary: !salary ? 'Salary field could not be empty.' : '',
      educationQualification:
        selectedQualifications.length === 0
          ? 'Education qualification field could not be empty.'
          : '',
      department: Object.values(selectedDepartments).every(
        deps => deps.length === 0
      )
        ? 'Department could not be empty.'
        : '',
      percentage: !percentage
        ? 'Percentage could not be empty'
        : Number(percentage) < 0 || Number(percentage) > 100
          ? 'Percentage must be between 0 and 100'
          : '',
      skills:
        selectedSkills.length === 0 ? 'Skills field could not be empty.' : '',
      bond: !bond
        ? 'Bond field could not be empty.'
        : Number(bond) < 0
          ? 'Bond cannot be negative'
          : '',
      jobLocation: !jobLocation ? 'Job location field could not be empty.' : '',
      deadLine: !deadLine ? 'Deadline is required' : '',
      interviewMode: !interviewMode
        ? 'Mode of Interview field could not be empty.'
        : interviewMode === 'Others' && !customInterviewMode.trim()
          ? 'Custom interview mode cannot be empty.'
          : '',
      specialNote: !specialNote ? 'Special note is required' : '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    if (!buttonClicked) {
      setButtonClicked(true);
      try {
        const mergedDepartments = Object.values(selectedDepartments).flat();
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/postjobs`,
          {
            companyName,
            jobRole,
            graduates: selectedYears,
            salary,
            educationQualification: selectedQualifications,
            department: mergedDepartments,
            percentage,
            bond,
            jobLocation,
            deadLine,
            specialNote,
            designation,
            jobSkills: selectedSkills,
            location,
            BDEId,
            interviewMode:
              interviewMode === 'Others' ? customInterviewMode : interviewMode,
          }
        );

        if (response.status === 200) {
          Swal.fire({ title: 'Job added successfully!', icon: 'success' });
          await dispatch(fetchJobs());
          resetForm();
          navigate('/jobs-dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong!!!',
          text:
            error.response?.data?.message || 'Please check the fields again.',
        });
      } finally {
        setButtonClicked(false);
      }
    }
  };

  return (
    <div
      className="w-full p-4 font-[poppins] border bg-white rounded-[30px] mt-7"
      style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
    >
      <style>
        {`
          .selected-skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
          }
          .selected-skills p {
            background: #e6e6fa;
            padding: 5px 10px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
            color: #333;
          }
          .remove-skill {
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
          .add-skill-button {
            background: #00007F;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 14px;
          }
          .add-skill-button:disabled {
            background: #cccccc;
            cursor: not-allowed;
          }
          .add-skill-button:hover:not(:disabled) {
            background: #0000cc;
          }
          .custom-skill-input {
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
        `}
      </style>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 className="text-center text-[25px] font-semibold text-[#00007F]">
            Job Description
          </h2>
        </div>
        <div className="w-full p-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Company Name <span className="text-[#EC5F70]">*</span>
              </h2>
              <input
                type="text"
                placeholder="Ex: Codegnan"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={companyName}
                onChange={e => {
                  setCompanyName(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    companyName: e.target.value
                      ? ''
                      : 'Company name is required',
                  }));
                }}
                required
                aria-label="Company Name"
                aria-describedby="companyName-error"
              />
              {errors.companyName && (
                <p id="companyName-error" className="error-message">
                  {errors.companyName}
                </p>
              )}
            </div>
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Job Role <span className="text-[#EC5F70]">*</span>
              </h2>
              <input
                type="text"
                placeholder="Ex: Full stack developer"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={jobRole}
                onChange={e => {
                  setJobRole(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    jobRole:
                      e.target.value.length >= 3
                        ? ''
                        : 'Job role must be at least 3 characters',
                  }));
                }}
                required
                aria-label="Job Role"
                aria-describedby="jobRole-error"
              />
              {errors.jobRole && (
                <p id="jobRole-error" className="error-message">
                  {errors.jobRole}
                </p>
              )}
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
            <div className="w-full relative">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Education Qualification{' '}
                <span className="text-[#EC5F70]">*</span>
              </h2>
              <select
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] pr-8 rounded-[4px] appearance-none text-gray-500"
                value={currentQualification}
                onChange={e => setCurrentQualification(e.target.value)}
                aria-label="Education Qualification"
                aria-describedby="educationQualification-error"
              >
                <option value="">Select Qualification</option>
                <option
                  value="UG (Bachelor Degrees)"
                  disabled={selectedQualifications.includes(
                    'UG (Bachelor Degrees)'
                  )}
                >
                  UG (Bachelor Degrees)
                </option>
                <option
                  value="PG (Postgraduate Degrees)"
                  disabled={selectedQualifications.includes(
                    'PG (Postgraduate Degrees)'
                  )}
                >
                  PG (Postgraduate Degrees)
                </option>
              </select>

              <button
                type="button"
                className="add-skill-button"
                onClick={addQualification}
                disabled={!currentQualification}
              >
                Add Qualification
              </button>
              <div className="selected-skills">
                {selectedQualifications.map((qual, index) => (
                  <p key={`qual-${index}`}>
                    {qual}
                    <button
                      className="remove-skill"
                      type="button"
                      onClick={() => removeQualification(qual)}
                    >
                      X
                    </button>
                  </p>
                ))}
              </div>
              {errors.educationQualification && (
                <p id="educationQualification-error" className="error-message">
                  {errors.educationQualification}
                </p>
              )}
            </div>
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Salary <span className="text-[#EC5F70]">*</span>
              </h2>
              <input
                type="text"
                placeholder="Ex: 4.6LPA"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={salary}
                onChange={e => {
                  setSalary(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    salary: e.target.value
                      ? ''
                      : 'Salary field could not be empty.',
                  }));
                }}
                required
                aria-label="Salary"
                aria-describedby="salary-error"
              />
              {errors.salary && (
                <p id="salary-error" className="error-message">
                  {errors.salary}
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
                type="text"
                placeholder="Ex: 0"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={bond}
                onChange={e => {
                  setBond(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    bond: e.target.value
                      ? Number(e.target.value) < 0
                        ? 'Bond cannot be negative'
                        : ''
                      : 'Bond field could not be empty.',
                  }));
                }}
                required
                aria-label="Bond"
                aria-describedby="bond-error"
              />
              {errors.bond && (
                <p id="bond-error" className="error-message">
                  {errors.bond}
                </p>
              )}
            </div>
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Location <span className="text-[#EC5F70]">*</span>
              </h2>
              <input
                type="text"
                placeholder="Ex: Vijayawada"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={jobLocation}
                onChange={e => {
                  setJobLocation(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    jobLocation: e.target.value
                      ? ''
                      : 'Job location field could not be empty.',
                  }));
                }}
                required
                aria-label="Job Location"
                aria-describedby="jobLocation-error"
              />
              {errors.jobLocation && (
                <p id="jobLocation-error" className="error-message">
                  {errors.jobLocation}
                </p>
              )}
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Academic Percentage <span className="text-[#EC5F70]">*</span>
              </h2>
              <input
                type="text"
                placeholder="Ex: 70"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={percentage}
                onChange={e => {
                  setPercentage(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    percentage: e.target.value
                      ? Number(e.target.value) < 0 ||
                        Number(e.target.value) > 100
                        ? 'Percentage must be between 0 and 100'
                        : ''
                      : 'Percentage could not be empty',
                  }));
                }}
                required
                aria-label="Academic Percentage"
                aria-describedby="percentage-error"
              />
              {errors.percentage && (
                <p id="percentage-error" className="error-message">
                  {errors.percentage}
                </p>
              )}
            </div>
            <div className="w-full relative">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Deadline (24-hour format){' '}
                <span className="text-[#EC5F70]">*</span>
              </h2>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="datetime-local"
                  className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px] pr-12"
                  value={deadLine ? deadLine.replace(' ', 'T') : ''}
                  onChange={handleDateChange}
                  required
                  aria-label="Deadline"
                  aria-describedby="deadLine-error"
                />
                <div
                  onClick={openCalendar}
                  className="absolute right-4 top-[45%] transform -translate-y-1/2 cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                      stroke="#00007F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 2V6"
                      stroke="#00007F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 2V6"
                      stroke="#00007F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 10H21"
                      stroke="#00007F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {errors.deadLine && (
                <p id="deadLine-error" className="error-message">
                  {errors.deadLine}
                </p>
              )}
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
            <div className="w-full relative">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Graduated Year <span className="text-[#EC5F70]">*</span>
              </h2>
              <select
                className="w-full border border-[#00007F] text-[16px] p-4 mt-4 pr-8 rounded-[4px] appearance-none text-gray-500"
                value={graduates}
                onChange={e => {
                  setGraduates(e.target.value);
                  setErrors(prev => ({ ...prev, graduates: '' }));
                }}
                aria-label="Graduated Year"
                aria-describedby="graduates-error"
              >
                <option value="">Select Graduated Year</option>
                {years.map(year => (
                  <option
                    key={year}
                    value={year}
                    disabled={selectedYears.includes(year.toString())}
                    className="text-black"
                  >
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="add-skill-button"
                onClick={addYear}
                disabled={!graduates}
              >
                Add Year
              </button>
              <div className="selected-skills">
                {selectedYears.map((year, index) => (
                  <p key={`year-${year}-${index}`}>
                    {year}
                    <button
                      className="remove-skill"
                      type="button"
                      onClick={() => removeYear(year)}
                    >
                      X
                    </button>
                  </p>
                ))}
              </div>
              {errors.graduates && (
                <p id="graduates-error" className="error-message">
                  {errors.graduates}
                </p>
              )}
            </div>
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Branch/Department <span className="text-[#EC5F70]">*</span>
              </h2>
              {selectedQualifications.map(qualification => (
                <div key={qualification} className="mt-4">
                  <h3 className="text-[18px] font-medium text-[#00007F]">
                    {qualification}
                  </h3>
                  <div className="relative">
                    <select
                      className="w-full border border-[#00007F] text-[16px] p-4 mt-2 pr-8 rounded-[4px] appearance-none text-gray-500"
                      value={currentDepartment}
                      onChange={e => setCurrentDepartment(e.target.value)}
                      aria-label={`Department for ${qualification}`}
                    >
                      <option value="">Select Department</option>
                      {departments[
                        qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG'
                      ].length === 0 && (
                        <option value="" disabled>
                          No departments available
                        </option>
                      )}
                      {departments[
                        qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG'
                      ].map((dept, index) => (
                        <option key={`dept-${index}`} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  {currentDepartment === 'Others' && (
                    <input
                      type="text"
                      placeholder="Enter custom department"
                      className="custom-skill-input"
                      value={customDepartment}
                      onChange={e => setCustomDepartment(e.target.value)}
                      aria-label="Custom Department"
                    />
                  )}
                  <button
                    type="button"
                    className="add-skill-button"
                    onClick={() => addDepartment(qualification)}
                    disabled={!currentDepartment}
                  >
                    Add Department
                  </button>
                  <div className="selected-skills">
                    {selectedDepartments[
                      qualification === 'UG (Bachelor Degrees)' ? 'UG' : 'PG'
                    ].map((dept, index) => (
                      <p key={`dept-${index}`}>
                        {dept}
                        <button
                          className="remove-skill"
                          type="button"
                          onClick={() => removeDepartment(qualification, dept)}
                        >
                          X
                        </button>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {errors.department && (
                <p id="department-error" className="error-message">
                  {errors.department}
                </p>
              )}
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Designation
              </h2>
              <input
                type="text"
                placeholder="Ex: HR"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-[12px] rounded-[4px]"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                aria-label="Designation"
              />
            </div>
            <div className="w-full relative">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Skills <span className="text-[#EC5F70]">*</span>
              </h2>
              <select
                className="w-full border border-[#00007F] text-[16px] p-4 mt-4 pr-8 rounded-[4px] appearance-none text-gray-500"
                value={currentSkill}
                onChange={e => {
                  setCurrentSkill(e.target.value);
                  setErrors(prev => ({ ...prev, skills: '' }));
                }}
                aria-label="Skills"
                aria-describedby="skills-error"
              >
                <option value="">Select Skill</option>
                {skills.map((skill, index) => (
                  <option
                    key={`skill-${index}`}
                    value={skill}
                    disabled={selectedSkills.includes(skill)}
                  >
                    {skill}
                  </option>
                ))}
                <option value="Other">Others</option>
              </select>

              {currentSkill === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom skill"
                  className="custom-skill-input"
                  value={customSkill}
                  onChange={e => {
                    setCustomSkill(e.target.value);
                    setErrors(prev => ({ ...prev, skills: '' }));
                  }}
                  aria-label="Custom Skill"
                />
              )}
              <button
                type="button"
                className="add-skill-button"
                onClick={addSkill}
                disabled={
                  !currentSkill ||
                  (currentSkill === 'Other' && !customSkill.trim())
                }
              >
                Add Skill
              </button>
              <div className="selected-skills">
                {selectedSkills.map((skill, index) => (
                  <p key={`skill-${index}`}>
                    {skill}
                    <button
                      className="remove-skill"
                      type="button"
                      onClick={() => removeSkill(skill)}
                    >
                      X
                    </button>
                  </p>
                ))}
              </div>
              {errors.skills && (
                <p id="skills-error" className="error-message">
                  {errors.skills}
                </p>
              )}
            </div>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 pt-[22px] gap-12">
            <div className="w-full relative">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Mode of Interview <span className="text-[#EC5F70]">*</span>
              </h2>
              <select
                className="w-full border border-[#00007F] text-[16px] p-4 mt-4 pr-8 rounded-[4px] appearance-none text-gray-500"
                value={interviewMode}
                onChange={e => {
                  setInterviewMode(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    interviewMode: e.target.value
                      ? e.target.value === 'Others' &&
                        !customInterviewMode.trim()
                        ? 'Custom interview mode cannot be empty.'
                        : ''
                      : 'Mode of Interview field could not be empty.',
                  }));
                }}
                aria-label="Interview Mode"
                aria-describedby="interviewMode-error"
                required
              >
                <option value="">Select Interview Mode</option>
                {interviewModes.map((mode, index) => (
                  <option key={`mode-${index}`} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>

              {interviewMode === 'Others' && (
                <input
                  type="text"
                  placeholder="Enter custom interview mode"
                  className="custom-skill-input"
                  value={customInterviewMode}
                  onChange={e => {
                    setCustomInterviewMode(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      interviewMode: e.target.value.trim()
                        ? ''
                        : 'Custom interview mode cannot be empty.',
                    }));
                  }}
                  aria-label="Custom Interview Mode"
                />
              )}
              {errors.interviewMode && (
                <p id="interviewMode-error" className="error-message">
                  {errors.interviewMode}
                </p>
              )}
            </div>
            <div className="w-full">
              <h2 className="text-[20px] font-medium text-[#00007F]">
                Special Note <span className="text-[#EC5F70]">*</span>
              </h2>
              <textarea
                placeholder="Ex: Immediate recruitment"
                className="w-full border border-[#00007F] text-[16px] p-4 mt-4 rounded-[4px]"
                rows="4"
                value={specialNote}
                onChange={e => {
                  setSpecialNote(e.target.value);
                  setErrors(prev => ({
                    ...prev,
                    specialNote: e.target.value
                      ? ''
                      : 'Special note is required',
                  }));
                }}
                required
                aria-label="Special Note"
                aria-describedby="specialNote-error"
              />
              {errors.specialNote && (
                <p id="specialNote-error" className="error-message">
                  {errors.specialNote}
                </p>
              )}
            </div>
          </div>
          <div className="w-full pt-[22px]">
            <button
              type="submit"
              disabled={buttonClicked}
              className="w-full border rounded-[10px] border-[#00007F] py-3 bg-[#00007F] text-[18px] text-[#FFFFFF] font-medium hover:bg-[#0000cc] disabled:opacity-50"
            >
              {buttonClicked ? 'Submitting...' : 'Add Job >'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
