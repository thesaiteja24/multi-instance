import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../reducers/batchesSlice';
import userIcon from '/user.png';
import folderIcon from '/folder-add.png';
import frame from '/frame.png';
import { FaUpload, FaDownload, FaBookOpen } from 'react-icons/fa';
import { getStudentsByLoc } from '../reducers/studentsListSlice.js';
import { COLLEGE_SUBJECTS } from '../constants/AppConstants.js';

const subjects = COLLEGE_SUBJECTS.map(subject => ({
  value: subject,
  label: subject,
}));

const StudentEnrollment = () => {
  const dispatch = useDispatch();
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );
  const { userInfo } = useSelector(state => state.auth);
  const [mode, setMode] = useState('manual'); // "manual" or "excel"
  const location = userInfo?.location;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentCountryCode, setStudentCountryCode] = useState({
    value: '+91',
    label: '+91',
  });
  const [parentCountryCode, setParentCountryCode] = useState({
    value: '+91',
    label: '+91',
  });
  const [countryCodes, setCountryCodes] = useState([]);
  const [studentPhoneError, setStudentPhoneError] = useState('');
  const [parentPhoneError, setParentPhoneError] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const emailRegex =
    /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[9876]\d{9}$/;

  // Fetch Country Codes
  useEffect(() => {
    const countryCodes = [
      { value: '+91', label: '+91' }, // India
      { value: '+1', label: '+1' }, // USA/Canada
      { value: '+44', label: '+44' }, // UK
      { value: '+61', label: '+61' }, // Australia
      { value: '+81', label: '+81' }, // Japan
      { value: '+49', label: '+49' }, // Germany
      { value: '+33', label: '+33' }, // France
      { value: '+86', label: '+86' }, // China
      { value: '+971', label: '+971' }, // UAE
      { value: '+65', label: '+65' }, // Singapore
      { value: '+27', label: '+27' }, // South Africa
    ];

    setCountryCodes(countryCodes);
    setStudentCountryCode({ value: '+91', label: '+91' });
    setParentCountryCode({ value: '+91', label: '+91' });
  }, []);

  // Fetch Batches
  useEffect(() => {
    if (location && batchesList.length === 0) {
      dispatch(getBatches(location));
    }
  }, [dispatch, location, batchesList.length]);

  // Handle Tab Switch
  const onTabClick = newMode => {
    setMode(newMode);
    setExcelData([]);
    reset();
    setSelectedSubjects([]);
  };

  // Handle Subjects Change
  const handleSubjectsChange = selectedOptions => {
    setSelectedSubjects(selectedOptions);
    setValue(
      'subjects',
      selectedOptions.map(option => option.value)
    );
  };

  // Handle Student Phone Validation
  const handleStudentPhoneBlur = value => {
    const studentPhone = value;
    const fullStudentPhone = studentCountryCode?.value + studentPhone;
    const parentPhone = document.getElementsByName('mobile2')[0]?.value;
    const fullParentPhone = parentCountryCode?.value + parentPhone;

    if (studentPhone && !phoneRegex.test(studentPhone)) {
      setStudentPhoneError(
        'Phone number must start with 9, 8, 7, or 6 and contain exactly 10 digits.'
      );
    } else if (
      studentPhone &&
      parentPhone &&
      fullStudentPhone === fullParentPhone
    ) {
      setStudentPhoneError(
        'Student and Parent WhatsApp numbers cannot be the same.'
      );
    } else {
      setStudentPhoneError('');
    }
  };

  // Handle Parent Phone Validation
  const handleParentPhoneBlur = value => {
    const parentPhone = value;
    const fullParentPhone = parentCountryCode?.value + parentPhone;
    const studentPhone = document.getElementsByName('mobile1')[0]?.value;
    const fullStudentPhone = studentCountryCode?.value + studentPhone;

    if (parentPhone && !phoneRegex.test(parentPhone)) {
      setParentPhoneError(
        'Phone number must start with 9, 8, 7, or 6 and contain exactly 10 digits.'
      );
    } else if (
      studentPhone &&
      parentPhone &&
      fullStudentPhone === fullParentPhone
    ) {
      setParentPhoneError(
        'Student and Parent WhatsApp numbers cannot be the same.'
      );
    } else {
      setParentPhoneError('');
    }
  };

  // Handle Excel File Upload
  const handleFileUpload = e => {
    setExcelData([]);
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = event => {
      const content = event.target.result;

      if (['xlsx', 'xls'].includes(fileExtension)) {
        const data = new Uint8Array(content);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length > 1) {
          const headers = rows[0].map(header => header.toLowerCase().trim());
          const formattedData = rows.slice(1).map(row => {
            const studentPh =
              row[headers.indexOf('studentphnumber')]?.toString().trim() || '';
            const parentPh =
              row[headers.indexOf('parentnumber')]?.toString().trim() || '';
            const batchNo =
              row[headers.indexOf('batchno')]?.toString().toUpperCase() || '';
            const modeOfStudy =
              row[headers.indexOf('modeofstudy')]?.toString().trim() ||
              'Offline';
            const subjectsStr =
              row[headers.indexOf('subjects')]?.toString().trim() || '';

            return {
              studentId:
                row[headers.indexOf('studentid')]?.toString().toUpperCase() ||
                '',
              batchNo,
              email:
                row[headers.indexOf('email')]?.toString().toLowerCase() || '',
              studentPhNumber: studentPh.startsWith('+91')
                ? studentPh
                : studentPh.length === 10 && /^[6789]\d{9}$/.test(studentPh)
                  ? `+91${studentPh}`
                  : studentPh,
              parentNumber: parentPh.startsWith('+91')
                ? parentPh
                : parentPh.length === 10 && /^[6789]\d{9}$/.test(parentPh)
                  ? `+91${parentPh}`
                  : parentPh,
              location: row[headers.indexOf('location')]?.toString() || '',
              modeOfStudy: ['Online', 'Offline'].includes(modeOfStudy)
                ? modeOfStudy
                : 'Offline',
              subjects: subjectsStr
                ? subjectsStr.split(',').map(s => s.trim())
                : [],
            };
          });

          const validBatchNos = batchesList.map(batch => batch.Batch);
          const invalidEntries = formattedData.filter(
            entry => !validBatchNos.includes(entry.batchNo)
          );
          if (invalidEntries.length > 0) {
            Swal.fire({
              title: 'Invalid Batch Numbers Found!',
              text: `The following batch numbers are invalid: ${invalidEntries
                .map(e => e.batchNo)
                .join(', ')}`,
              icon: 'error',
            });
            setExcelData([]);
            return;
          }

          const invalidEmails = formattedData.filter(
            entry => !emailRegex.test(entry.email)
          );
          if (invalidEmails.length > 0) {
            Swal.fire({
              title: 'Invalid Email Format!',
              text: `The following emails are not valid: ${invalidEmails
                .map(e => e.email)
                .join(', ')}`,
              icon: 'error',
            });
            setExcelData([]);
            return;
          }

          const validSubjectValues = subjects.map(s => s.value);
          const invalidSubjects = formattedData.filter(entry =>
            entry.subjects.some(s => !validSubjectValues.includes(s))
          );
          if (invalidSubjects.length > 0) {
            Swal.fire({
              title: 'Invalid Subjects Found!',
              text: `The following subjects are invalid: ${invalidSubjects
                .map(e => e.subjects.join(', '))
                .join(', ')}`,
              icon: 'error',
            });
            setExcelData([]);
            return;
          }

          setExcelData(formattedData);
        } else {
          Swal.fire({
            title: 'Invalid Excel File',
            text: 'The file is empty or missing headers.',
            icon: 'error',
          });
        }
      } else {
        Swal.fire({
          title: 'Invalid File',
          text: 'Unsupported file type. Please upload Excel files (.xlsx, .xls).',
          icon: 'error',
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle Template Download
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        studentId: 'CG112',
        batchNo: 'PFS-100',
        email: 'example@gmail.com',
        studentPhNumber: '+918688031605',
        parentNumber: '+918688031603',
        location,
        modeOfStudy: 'Offline',
        subjects: 'C,Python',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Student_Enrollment_Template.xlsx');
  };

  // Handle Form Submission
  const onSubmit = async data => {
    const studentPhone = studentCountryCode?.value + data.mobile1;
    const parentPhone = parentCountryCode?.value + data.mobile2;

    if (studentPhoneError || parentPhoneError) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix phone number errors before submitting.',
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/v1/addstudent`;
      let response;

      if (mode === 'manual') {
        if (!emailRegex.test(data.email)) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Email!',
            text: 'Please enter a valid email address (no consecutive dots, proper format).',
          });
          setLoading(false);
          return;
        }

        if (!phoneRegex.test(data.mobile1) || !phoneRegex.test(data.mobile2)) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Phone Number',
            text: 'Phone number must start with 9, 8, 7, or 6 and contain exactly 10 digits.',
          });
          setLoading(false);
          return;
        }

        if (!data.subjects || data.subjects.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'No Subjects Selected!',
            text: 'Please select at least one subject.',
          });
          setLoading(false);
          return;
        }

        response = await axios.post(endpoint, {
          studentId: data.studentId.toUpperCase(),
          batchNo: data.batch.toUpperCase(),
          email: data.email.toLowerCase(),
          studentPhNumber: studentPhone,
          parentNumber: parentPhone,
          location,
          modeOfStudy: data.modeOfStudy || 'Offline',
          subjects: data.subjects,
          profileStatus: false,
        });
      } else {
        const updatedExcelData = excelData.map(entry => ({
          ...entry,
          profileStatus: false,
        }));
        response = await axios.post(endpoint, { excelData: updatedExcelData });
      }

      if (response.status === 200) {
        dispatch(getStudentsByLoc(location));
        Swal.fire({
          title:
            mode === 'excel'
              ? 'Students Enrolled Successfully'
              : 'Student Enrolled Successfully',
          icon: 'success',
        });

        setExcelData([]);
        reset();
        setSelectedSubjects([]);
        setMode('manual');
        const excelUploadElement = document.getElementById('excelUpload');
        if (excelUploadElement) {
          excelUploadElement.value = '';
        }
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          'Something went wrong!';

        if (status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'Bad Request!',
            text: errorMessage,
          });
        } else if (status === 404) {
          Swal.fire({
            icon: 'error',
            title: 'Already Exist!',
            text: errorMessage,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed!',
            text: errorMessage,
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Network Error!',
          text: 'Unable to connect to the server. Please try again later.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 items-center min-h-[80vh] font-[inter]">
      {/* STUDENT ENROLLMENT */}
      <div className="w-[95%] mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h2 className="text-2xl font-semibold mb-6 text-center text-[var(--color-secondary)]">
          Student Enrollment
        </h2>

        {/* Error Display */}
        {batchesListError ? (
          <p className="text-center text-red-500 font-semibold">
            {batchesListError}
          </p>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-col gap-2 md:flex-row justify-center md:space-x-4 mb-8">
              <button
                type="button"
                onClick={() => onTabClick('manual')}
                className={`flex items-center px-5 py-2 rounded-md transition ${
                  mode === 'manual'
                    ? 'bg-[var(--color-secondary)] text-white'
                    : 'bg-[#8D8D8D] text-white'
                }`}
              >
                <img src={userIcon} alt="" className="w-5 h-5 mr-2" />
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => onTabClick('excel')}
                className={`flex items-center px-5 py-2 rounded-md transition ${
                  mode === 'excel'
                    ? 'bg-[var(--color-secondary)] text-white'
                    : 'bg-[#8D8D8D] text-white'
                }`}
              >
                <img src={folderIcon} alt="" className="w-5 h-5 mr-2" />
                Excel Upload
              </button>
            </div>

            {/* Loading State */}
            {batchesListLoading ? (
              <p className="text-center text-gray-600">Loading batches...</p>
            ) : (
              <>
                {/* Form */}
                {mode === 'manual' && (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Student ID */}
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-secondary)]">
                          Student ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('studentId', { required: true })}
                          type="text"
                          placeholder="Enter Student ID"
                          className="mt-1 block w-full border border-[var(--color-secondary)] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                        />
                        {errors.studentId && (
                          <p className="text-red-500 text-xs mt-1">Required</p>
                        )}
                      </div>

                      {/* Batch */}
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-secondary)]">
                          Batch <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('batch', { required: true })}
                          className="mt-1 block w-full border border-[var(--color-secondary)] rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                          disabled={batchesList.length === 0}
                        >
                          <option value="">Select Batch</option>
                          {batchesList.map(batch => (
                            <option key={batch.id} value={batch.Batch}>
                              {batch.Batch}
                            </option>
                          ))}
                        </select>
                        {errors.batch && (
                          <p className="text-red-500 text-xs mt-1">Required</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-secondary)]">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('email', {
                            required: true,
                            pattern: emailRegex,
                          })}
                          type="email"
                          placeholder="Enter Email"
                          className="mt-1 block w-full border border-[var(--color-secondary)] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email.type === 'pattern'
                              ? 'Invalid email'
                              : 'Required'}
                          </p>
                        )}
                      </div>

                      {/* Subjects */}
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-secondary)]">
                          Subjects <span className="text-red-500">*</span>
                        </label>
                        <Select
                          isMulti
                          options={subjects}
                          value={selectedSubjects}
                          onChange={handleSubjectsChange}
                          placeholder="Select Subjects"
                          className="mt-1"
                          classNamePrefix="select"
                          styles={{
                            control: base => ({
                              ...base,
                              border: '1px solid var(--color-secondary)',
                              borderRadius: '0.375rem',
                              padding: '0.25rem',
                              '&:hover': {
                                borderColor: 'var(--color-secondary)',
                              },
                            }),
                            menu: base => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                        {errors.subjects && (
                          <p className="text-red-500 text-xs mt-1">
                            At least one subject is required
                          </p>
                        )}
                      </div>

                      {/* Mode of Study */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[var(--color-secondary)]">
                          Mode of Study <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center mt-1 border border-[var(--color-secondary)] rounded-md p-[9px]">
                          <FaBookOpen className="text-[var(--color-secondary)] mr-2" />
                          <select
                            {...register('modeOfStudy', { required: true })}
                            className="w-full px-4 text-gray-800 font-medium focus:outline-none"
                          >
                            <option value="" disabled>
                              Select Mode
                            </option>
                            <option value="Offline">Offline</option>
                            <option value="Online">Online</option>
                          </select>
                        </div>
                        {errors.modeOfStudy && (
                          <p className="text-red-500 text-xs mt-1">Required</p>
                        )}
                      </div>

                      {/* Mobile #1 (Student) */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          <span className="text-[var(--color-secondary)] font-medium">
                            Mobile
                          </span>{' '}
                          (Student) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex mt-1">
                          <Select
                            options={countryCodes}
                            value={studentCountryCode}
                            onChange={setStudentCountryCode}
                            placeholder="Code"
                            className="w-1/4 mr-2"
                          />
                          <input
                            {...register('mobile1', {
                              required: true,
                              pattern: phoneRegex,
                            })}
                            type="tel"
                            placeholder="Enter 10-digit number"
                            className="flex-1 border border-[var(--color-secondary)] rounded-md pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            onBlur={e => handleStudentPhoneBlur(e.target.value)}
                          />
                        </div>
                        {errors.mobile1 && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.mobile1.type === 'pattern'
                              ? 'Must be 10 digits starting with 9, 8, 7, or 6'
                              : 'Required'}
                          </p>
                        )}
                        {studentPhoneError && (
                          <p className="text-red-500 text-xs mt-1">
                            {studentPhoneError}
                          </p>
                        )}
                      </div>

                      {/* Mobile #2 (Parent) */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          <span className="text-[var(--color-secondary)] font-medium">
                            Mobile
                          </span>{' '}
                          (Parent) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex mt-1">
                          <Select
                            options={countryCodes}
                            value={parentCountryCode}
                            onChange={setParentCountryCode}
                            placeholder="Code"
                            className="w-1/4 mr-2"
                          />
                          <input
                            {...register('mobile2', {
                              required: true,
                              pattern: phoneRegex,
                            })}
                            type="tel"
                            placeholder="Enter 10-digit number"
                            className="flex-1 border border-[var(--color-secondary)] rounded-md pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                            onBlur={e => handleParentPhoneBlur(e.target.value)}
                          />
                        </div>
                        {errors.mobile2 && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.mobile2.type === 'pattern'
                              ? 'Must be 10 digits starting with 9, 8, 7, or 6'
                              : 'Required'}
                          </p>
                        )}
                        {parentPhoneError && (
                          <p className="text-red-500 text-xs mt-1">
                            {parentPhoneError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className={`mt-8 w-full rounded-lg py-3 font-medium text-white ${
                        loading
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-[var(--color-secondary)] hover:bg-blue-800'
                      } transition`}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit >'}
                    </button>
                  </form>
                )}

                {mode === 'excel' && (
                  <div className="py-8">
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center px-5 py-2 bg-[var(--color-secondary)] text-white rounded-md hover:bg-blue-900 transition"
                      >
                        <FaDownload className="mr-2" />
                        Download Template
                      </button>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-[var(--color-secondary)] mb-2">
                        Upload Excel <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border border-[var(--color-secondary)] rounded-md p-2">
                        <FaUpload className="text-[var(--color-secondary)] mr-2" />
                        <input
                          id="excelUpload"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          className="flex-1 px-2 py-1 text-gray-800 outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      className={`w-full rounded-lg py-3 font-medium text-white ${
                        loading || !excelData.length
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-blue-900 hover:bg-blue-800'
                      } transition`}
                      disabled={loading || !excelData.length}
                    >
                      {loading ? 'Submitting...' : 'Submit >'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      {/* IMAGE */}
      <div className="hidden lg:flex lg:flex-col w-full 2xl:px-8 justify-center items-center">
        <img src={frame} alt="" />
      </div>
    </div>
  );
};

export default StudentEnrollment;
