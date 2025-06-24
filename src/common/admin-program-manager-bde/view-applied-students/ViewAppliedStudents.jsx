import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { writeFile, utils } from 'xlsx';
import Select from 'react-select';
import {
  fetchAppliedStudents,
  fetchJobDetails,
  downloadResume,
  updateJobApplicants,
  setSelectedDepartments,
  setCustomDepartments,
  setSelectedPercentage,
  setSelectedSkills,
  setJsZipLoaded,
  addBatchBlob,
  clearBatchBlobs,
  setSelectedLocations,
  setSelectedPassoutYears,
} from '../../../reducers/jobApplicationSlice';
import { COLLEGE_CODE } from '../../../constants/AppConstants';

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

const ViewAppliedStudents = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    appliedStudents = [],
    jobSkills = [],
    departments,
    selectedStudents = [],
    rejectedStudents = [],
    resumeName,
    excelName,
    loading = false,
    selectedDepartments = [],
    customDepartments = [],
    selectedPercentage = '',
    selectedSkills = [],
    batchBlobs = [],
    jsZipLoaded = false,
    selectedLocations = [],
    passoutYears = [],
    selectedPassoutYears = [],
  } = useSelector(state => state.jobApplication);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [checkedStudents, setCheckedStudents] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const { book_new, book_append_sheet, json_to_sheet } = utils;

  const splitDepartmentIntoParts = dept => {
    if (!dept) return [];
    return dept
      .toLowerCase()
      .replace(/[\-\(\),]/g, ' ')
      .split(/\s+/)
      .map(part => part.trim())
      .filter(part => part.length > 0);
  };

  const availableLocations = [COLLEGE_CODE];

  const availableDepartments = useMemo(() => {
    const deptSet = new Set(
      departments.filter(dept => dept && typeof dept === 'string')
    );
    deptSet.add('Others');
    return ['All Departments', ...Array.from(deptSet)];
  }, [departments]);

  const departmentOptions = availableDepartments.map(dept => ({
    value: dept,
    label: dept,
  }));

  const passoutYearOptions = useMemo(() => {
    return ['All Years', ...passoutYears].map(year => ({
      value: year,
      label: year,
    }));
  }, [passoutYears]);

  const selectedPassoutYearOptions = selectedPassoutYears.map(year => ({
    value: year,
    label: year,
  }));

  const selectedDepartmentOptions = selectedDepartments.map(dept => ({
    value: dept,
    label: dept,
  }));

  const locationOptions = availableLocations.map(location => ({
    value: location,
    label: location,
  }));
  const selectedLocationOptions = selectedLocations.map(location => ({
    value: location,
    label: location,
  }));

  useEffect(() => {
    let isMounted = true;
    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      script.async = true;
      script.onload = () => {
        if (isMounted) dispatch(setJsZipLoaded(true));
      };
      script.onerror = () => {
        if (isMounted) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load JSZip library.',
          });
        }
      };
      document.body.appendChild(script);
      return () => {
        isMounted = false;
        document.body.removeChild(script);
      };
    } else {
      dispatch(setJsZipLoaded(true));
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          dispatch(fetchJobDetails(job_id)).unwrap(),
          dispatch(fetchAppliedStudents(job_id)).unwrap(),
        ]);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to fetch job or student data. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [job_id, dispatch]);

  useEffect(() => {
    setPage(1);
  }, [
    selectedDepartments,
    selectedPercentage,
    selectedSkills,
    selectedLocations,
    selectedPassoutYears,
  ]);

  const handleCheckboxChange = studentId => {
    if (!studentId) return;
    setCheckedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = event => {
    if (event.target.checked) {
      const validStudentIds = filteredStudents
        .map(student => student.id || student.student_id)
        .filter(Boolean);
      setCheckedStudents(validStudentIds);
    } else {
      setCheckedStudents([]);
    }
  };

  const handleDepartmentChange = selectedOptions => {
    const selectedValues = selectedOptions
      ? selectedOptions.map(option => option.value)
      : [];
    const includesOthers = selectedValues.includes('Others');
    const includesAll = selectedValues.includes('All Departments');

    if (includesAll) {
      dispatch(setSelectedDepartments(['All Departments']));
      setShowCustomInput(false);
      setCustomDeptInput('');
      dispatch(setCustomDepartments([]));
      return;
    }

    const filteredOptions = selectedValues.filter(
      option => option !== 'All Departments'
    );
    setShowCustomInput(includesOthers);
    if (!includesOthers) {
      setCustomDeptInput('');
      dispatch(setCustomDepartments([]));
    }
    dispatch(setSelectedDepartments(filteredOptions));
  };

  const handleCustomDeptChange = event => {
    setCustomDeptInput(event.target.value);
  };

  const addCustomDepartment = () => {
    if (
      customDeptInput.trim() &&
      !customDepartments.includes(customDeptInput.trim())
    ) {
      const updatedDept =
        customDeptInput.charAt(0).toUpperCase() +
        customDeptInput.slice(1).trim();
      dispatch(setCustomDepartments([...customDepartments, updatedDept]));
      setCustomDeptInput('');
    }
  };

  const removeCustomDepartment = dept => {
    dispatch(setCustomDepartments(customDepartments.filter(d => d !== dept)));
  };

  const handleLocationChange = selectedOptions => {
    const selectedValues = selectedOptions
      ? selectedOptions.map(option => option.value)
      : [];
    const includesAll = selectedValues.includes('All Locations');

    if (includesAll) {
      dispatch(setSelectedLocations(['All Locations']));
      return;
    }

    const filteredOptions = selectedValues.filter(
      option => option !== 'All Locations'
    );
    dispatch(setSelectedLocations(filteredOptions));
  };

  const handlePassoutYearChange = selectedOptions => {
    const selectedValues = selectedOptions
      ? selectedOptions.map(option => option.value)
      : [];
    const includesAll = selectedValues.includes('All Years');

    if (includesAll) {
      dispatch(setSelectedPassoutYears(['All Years']));
      return;
    }

    const filteredOptions = selectedValues.filter(
      option => option !== 'All Years'
    );
    dispatch(setSelectedPassoutYears(filteredOptions));
  };

  const percentages = [...Array(10)].map((_, index) => 50 + index * 5);

  const handlePercentageChange = event => {
    dispatch(setSelectedPercentage(event.target.value));
  };

  const skillOptions = jobSkills.map(skill => ({ value: skill, label: skill }));
  const selectedSkillOptions = selectedSkills.map(skill => ({
    value: skill,
    label: skill,
  }));

  const handleSkillChange = selectedOptions => {
    const selectedValues = selectedOptions
      ? selectedOptions.map(option => option.value)
      : [];
    dispatch(setSelectedSkills(selectedValues));
  };

  const filteredStudents = useMemo(() => {
    return appliedStudents
      .filter(student => {
        if (!student.department) {
          console.warn(
            `Student ${student.student_id || student.id} has no department specified.`
          );
          return false;
        }

        let departmentMatch = true;
        if (
          selectedDepartments.length > 0 &&
          !selectedDepartments.includes('All Departments')
        ) {
          const studentDeptParts = splitDepartmentIntoParts(student.department);

          departmentMatch = selectedDepartments.some(dept => {
            if (dept === 'Others' && customDepartments.length > 0) {
              return customDepartments.some(customDept => {
                const customDeptParts = splitDepartmentIntoParts(customDept);
                return studentDeptParts.some(studentPart =>
                  customDeptParts.some(
                    customPart =>
                      studentPart.includes(customPart) ||
                      customPart.includes(studentPart)
                  )
                );
              });
            }
            const deptParts = splitDepartmentIntoParts(dept);
            return studentDeptParts.some(studentPart =>
              deptParts.some(
                deptPart =>
                  studentPart.includes(deptPart) ||
                  deptPart.includes(studentPart)
              )
            );
          });
        }

        let passoutYearMatch = true;
        if (
          selectedPassoutYears.length > 0 &&
          !selectedPassoutYears.includes('All Years')
        ) {
          const studentPassoutYear = student.yearOfPassing
            ? student.yearOfPassing.toString().trim()
            : '';
          passoutYearMatch = studentPassoutYear
            ? selectedPassoutYears.includes(studentPassoutYear)
            : false;
        }

        let locationMatch = true;
        if (
          selectedLocations.length > 0 &&
          !selectedLocations.includes('All Locations')
        ) {
          const studentLocation = student.location
            ? student.location.trim().toLowerCase()
            : '';
          const normalizedSelectedLocations = selectedLocations.map(loc =>
            loc.toLowerCase()
          );
          locationMatch = studentLocation
            ? normalizedSelectedLocations.includes(studentLocation)
            : false;
        }

        const percentageMatch =
          !selectedPercentage ||
          (student.highestGraduationpercentage &&
            parseInt(student.highestGraduationpercentage) >=
              parseInt(selectedPercentage));

        let skillMatch = true;
        if (selectedSkills.length > 0) {
          const skillsArray = Array.isArray(student.studentSkills)
            ? student.studentSkills
            : typeof student.studentSkills === 'string'
              ? student.studentSkills.split(',')
              : [];
          skillMatch = selectedSkills.every(skill =>
            skillsArray.includes(skill)
          );
        }

        return (
          departmentMatch &&
          percentageMatch &&
          skillMatch &&
          locationMatch &&
          passoutYearMatch
        );
      })
      .sort(
        (a, b) =>
          parseInt(b.highestGraduationpercentage || 0) -
          parseInt(a.highestGraduationpercentage || 0)
      );
  }, [
    appliedStudents,
    selectedDepartments,
    customDepartments,
    selectedPercentage,
    selectedSkills,
    selectedLocations,
    selectedPassoutYears,
  ]);

  const formattedStudents = useMemo(() => {
    return filteredStudents.map((student, index) => ({
      ...student,
      sNo: index + 1,
      studentSkills: Array.isArray(student.studentSkills)
        ? student.studentSkills.join(', ')
        : typeof student.studentSkills === 'string'
          ? student.studentSkills
          : '',
      location: student.location || 'N/A',
      passoutYear: student.yearOfPassing || 'N/A',
    }));
  }, [filteredStudents]);

  const totalStudents = formattedStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const indexOfLastStudent = page * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = formattedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const getPaginationItems = () => {
    const items = [];
    const isMobile = window.innerWidth < 640;
    const maxPagesToShow = isMobile ? 2 : 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const offset = isMobile ? 1 : 2;
      const leftBound = Math.max(1, page - offset);
      const rightBound = Math.min(totalPages, page + offset);

      if (leftBound > 1) {
        items.push(1);
        if (leftBound > 2) items.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        items.push(i);
      }

      if (rightBound < totalPages) {
        if (rightBound < totalPages - 1) items.push('...');
        items.push(totalPages);
      }
    }
    return items;
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePageChange = pageNumber => {
    setPage(pageNumber);
  };

  const downloadResumeHandler = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const studentIds = checkedStudents;
      if (studentIds.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No students selected for resume download.',
        });
        setIsDownloading(false);
        return;
      }

      if (!jsZipLoaded || !window.JSZip) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'JSZip library is not loaded. Please try again.',
        });
        setIsDownloading(false);
        return;
      }

      const BATCH_SIZE = 30;
      const batches = [];
      for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
        batches.push(studentIds.slice(i, i + BATCH_SIZE));
      }

      let currentBatch = 0;
      const totalBatches = batches.length;

      const loadingSwal = Swal.fire({
        title: 'Processing Resumes',
        html: `Processing batch ${currentBatch + 1} of ${totalBatches} (${batches[0]?.length || 0} resumes)...`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      dispatch(clearBatchBlobs());
      const localBatchBlobs = [];
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        currentBatch = i + 1;
        Swal.update({
          html: `Processing batch ${currentBatch} of ${totalBatches} (${batch.length} resumes)...`,
        });

        const result = await dispatch(downloadResume(batch)).unwrap();
        const blob = new Blob([result]);
        localBatchBlobs.push({
          blob,
          name: `${resumeName || 'resumes'}_part_${i + 1}.zip`,
        });
        dispatch(
          addBatchBlob({
            blob,
            name: `${resumeName || 'resumes'}_part_${i + 1}.zip`,
          })
        );
      }

      Swal.update({
        html: `Unzipping ${totalBatches} batch(es) and creating final ZIP with ${studentIds.length} resumes...`,
      });

      const JSZip = window.JSZip;
      const finalZip = new JSZip();
      for (let i = 0; i < localBatchBlobs.length; i++) {
        const { blob } = localBatchBlobs[i];
        const batchZip = new JSZip();
        await batchZip.loadAsync(blob);
        for (const [relativePath, zipObject] of Object.entries(
          batchZip.files
        )) {
          if (!zipObject.dir) {
            const fileData = await zipObject.async('arraybuffer');
            finalZip.file(relativePath, fileData);
          }
        }
      }

      const finalZipBlob = await finalZip.generateAsync({ type: 'blob' });
      const finalZipUrl = window.URL.createObjectURL(finalZipBlob);
      const finalZipLink = document.createElement('a');
      finalZipLink.href = finalZipUrl;
      finalZipLink.setAttribute(
        'download',
        `${resumeName || 'resumes'}_all.zip`
      );
      document.body.appendChild(finalZipLink);
      finalZipLink.click();
      window.URL.revokeObjectURL(finalZipUrl);
      document.body.removeChild(finalZipLink);

      loadingSwal.close();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Created and downloaded a final ZIP with ${studentIds.length} resumes!`,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to process resumes or create final ZIP. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);

    const loadingSwal = Swal.fire({
      title: 'Generating Excel',
      html: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const selectedFormattedStudents = formattedStudents.filter(student =>
        checkedStudents.includes(student.id || student.student_id)
      );
      if (selectedFormattedStudents.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No students selected for Excel download.',
        });
        loadingSwal.close();
        setIsExportingExcel(false);
        return;
      }
      const workbook = book_new();
      const worksheet = json_to_sheet(selectedFormattedStudents);
      book_append_sheet(workbook, worksheet, 'Students');
      writeFile(workbook, `${excelName || 'students'}.xlsx`);
      loadingSwal.close();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to generate Excel file',
      });
      loadingSwal.close();
    } finally {
      setIsExportingExcel(false);
    }
  };

  const acceptSelectedStudents = async () => {
    if (selectedStudents.length > 0) {
      Swal.fire({
        title: 'Already Students are selected',
        icon: 'info',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Acceptance',
      text: 'Are you sure you want to accept the selected students?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Accept',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const selectedStudentIds = checkedStudents;
        if (selectedStudentIds.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No students selected. Please check the selected list',
          });
          return;
        }

        const loadingSwal = Swal.fire({
          title: 'Accepting Students',
          html: 'Please wait while the students are being accepted...',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await dispatch(
          updateJobApplicants({ selectedStudentIds, job_id })
        ).unwrap();

        loadingSwal.close();

        await Swal.fire({
          title: 'Success',
          text: 'Selected students have been accepted successfully!',
          icon: 'success',
        });

        dispatch(fetchAppliedStudents(job_id));
        setCheckedStudents([]);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to accept selected students',
        });
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="w-full p-4 sm:p-6 font-poppins relative max-w-[1280px] mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-[#00007F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div
              className="absolute left-3 top-4 cursor-pointer sm:left-4 sm:top-6"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 38 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 sm:w-7 sm:h-7"
              >
                <path
                  d="M15.1518 9.88867L5.54102 19.4995L15.1518 29.1103"
                  stroke="#2333CB"
                  strokeWidth="2.375"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32.458 19.5H5.81055"
                  stroke="#2333CB"
                  strokeWidth="2.375"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-[#00007F] font-semibold text-center text-lg sm:text-2xl mb-6">
              Students Applied for Job
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
              <button
                onClick={downloadExcel}
                className={`w-full sm:w-auto min-w-[120px] px-4 py-2 bg-[#0049C6] text-white rounded-md text-sm sm:text-base font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isExportingExcel || checkedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0049C6]/90'}`}
                disabled={isExportingExcel || checkedStudents.length === 0}
                aria-label="Download Excel"
              >
                Download Excel
              </button>
              <button
                onClick={downloadResumeHandler}
                className={`w-full sm:w-auto min-w-[120px] px-4 py-2 bg-[#FF6000] text-white rounded-md text-sm sm:text-base font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isDownloading || checkedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF6000]/90'}`}
                disabled={isDownloading || checkedStudents.length === 0}
                aria-label="Get Resumes"
              >
                Get Resumes
              </button>
              <button
                onClick={acceptSelectedStudents}
                className={`w-full sm:w-auto min-w-[120px] px-4 py-2 bg-[#0E910C] text-white rounded-md text-sm sm:text-base font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${checkedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0E910C]/90'}`}
                disabled={checkedStudents.length === 0}
                aria-label="Accept Selected Students"
              >
                Accept Selected Students
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="w-full flex flex-col gap-2">
                <label
                  htmlFor="departments-select"
                  className="text-sm font-bold text-gray-700"
                >
                  Departments
                </label>
                <Select
                  id="departments-select"
                  isMulti
                  options={departmentOptions}
                  value={selectedDepartmentOptions}
                  onChange={handleDepartmentChange}
                  placeholder="Select Departments..."
                  className="text-sm sm:text-base max-w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: base => ({
                      ...base,
                      borderColor: '#d1d5db',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        borderColor: '#00007F',
                      },
                      '&:focus-within': {
                        borderColor: '#00007F',
                        boxShadow: '0 0 0 2px rgba(0, 0, 127, 0.3)',
                      },
                      minWidth: '150px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#00007F'
                        : state.isFocused
                          ? '#e6e6ff'
                          : 'white',
                      color: state.isSelected ? 'white' : 'black',
                      padding: '8px',
                    }),
                    menu: base => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
                {showCustomInput && (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="text"
                      value={customDeptInput}
                      onChange={handleCustomDeptChange}
                      placeholder="Custom Department"
                      className="w-full text-sm sm:text-base p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00007F] bg-white shadow-sm"
                      aria-label="Enter Custom Department"
                    />
                    <button
                      onClick={addCustomDepartment}
                      disabled={!customDeptInput.trim()}
                      className={`self-start px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium ${!customDeptInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                      aria-label="Add Custom Department"
                    >
                      Add Custom Department
                    </button>
                    <div className="flex flex-wrap gap-2">
                      {customDepartments.map((dept, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                        >
                          {dept}
                          <button
                            type="button"
                            onClick={() => removeCustomDepartment(dept)}
                            className="ml-2 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                            aria-label={`Remove ${dept}`}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full flex flex-col gap-2">
                <label
                  htmlFor="percentage-select"
                  className="text-sm font-bold text-gray-700"
                >
                  Percentage
                </label>
                <select
                  id="percentage-select"
                  value={selectedPercentage}
                  onChange={handlePercentageChange}
                  className="w-full text-sm sm:text-base p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00007F] bg-white shadow-sm"
                  aria-label="Select Minimum Percentage"
                >
                  <option value="" className="font-normal">
                    Minimum Percentage
                  </option>
                  {percentages.map(percentage => (
                    <option
                      key={percentage}
                      value={percentage.toString()}
                      className={`p-2 ${selectedPercentage === percentage.toString() ? 'font-medium' : 'font-normal'}`}
                    >
                      {percentage}%
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full flex flex-col gap-2">
                <label
                  htmlFor="skills-select"
                  className="text-sm font-bold text-gray-700"
                >
                  Skills
                </label>
                <Select
                  id="skills-select"
                  isMulti
                  options={skillOptions}
                  value={selectedSkillOptions}
                  onChange={handleSkillChange}
                  placeholder="Select Skills..."
                  className="text-sm sm:text-base max-w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: base => ({
                      ...base,
                      borderColor: '#d1d5db',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        borderColor: '#00007F',
                      },
                      '&:focus-within': {
                        borderColor: '#00007F',
                        boxShadow: '0 0 0 2px rgba(0, 0, 127, 0.3)',
                      },
                      minWidth: '150px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#00007F'
                        : state.isFocused
                          ? '#e6e6ff'
                          : 'white',
                      color: state.isSelected ? 'white' : 'black',
                      padding: '8px',
                    }),
                    menu: base => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <label
                  htmlFor="locations-select"
                  className="text-sm font-bold text-gray-700"
                >
                  Locations
                </label>
                <Select
                  id="locations-select"
                  isMulti
                  options={locationOptions}
                  value={selectedLocationOptions}
                  onChange={handleLocationChange}
                  placeholder="Select Locations..."
                  className="text-sm sm:text-base max-w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: base => ({
                      ...base,
                      borderColor: '#d1d5db',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        borderColor: '#00007F',
                      },
                      '&:focus-within': {
                        borderColor: '#00007F',
                        boxShadow: '0 0 0 2px rgba(0, 0, 127, 0.3)',
                      },
                      minWidth: '150px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#00007F'
                        : state.isFocused
                          ? '#e6e6ff'
                          : 'white',
                      color: state.isSelected ? 'white' : 'black',
                      padding: '8px',
                    }),
                    menu: base => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <label
                  htmlFor="passout-years-select"
                  className="text-sm font-bold text-gray-700"
                >
                  Passout Years
                </label>
                <Select
                  id="passout-years-select"
                  isMulti
                  options={passoutYearOptions}
                  value={selectedPassoutYearOptions}
                  onChange={handlePassoutYearChange}
                  placeholder="Select Passout Years..."
                  className="text-sm sm:text-base max-w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: base => ({
                      ...base,
                      borderColor: '#d1d5db',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        borderColor: '#00007F',
                      },
                      '&:focus-within': {
                        borderColor: '#00007F',
                        boxShadow: '0 0 0 2px rgba(0, 0, 127, 0.3)',
                      },
                      minWidth: '150px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#00007F'
                        : state.isFocused
                          ? '#e6e6ff'
                          : 'white',
                      color: state.isSelected ? 'white' : 'black',
                      padding: '8px',
                    }),
                    menu: base => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-5 sm:hidden">
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Total Applied
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {appliedStudents.length}
                </strong>
              </div>
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Filtered
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {filteredStudents.length}
                </strong>
              </div>
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Selected
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {selectedStudents.length}
                </strong>
              </div>
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Rejected
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {rejectedStudents.length}
                </strong>
              </div>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:flex-wrap gap-3 mb-5">
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Total Applied
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {appliedStudents.length}
                </strong>
              </div>
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Filtered
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {filteredStudents.length}
                </strong>
              </div>
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Selected
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {selectedStudents.length}
                </strong>
              </div>
              <div className="flex-1 min-w-[120px] bg-white rounded-lg p-3 text-center shadow">
                <span className="block text-sm font-bold text-gray-700">
                  Rejected
                </span>
                <strong className="block text-base text-[#0C1BAA]">
                  {rejectedStudents.length}
                </strong>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
                <thead>
                  <tr>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center min-w-[48px]">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer"
                          onChange={handleSelectAll}
                          checked={
                            filteredStudents.length > 0 &&
                            checkedStudents.length ===
                              filteredStudents.filter(
                                student => student.id || student.student_id
                              ).length
                          }
                          aria-label="Select all students"
                        />
                      </div>
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      S.No
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Student ID
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Name
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Email
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Phone
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Graduation %
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Department
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Location
                    </th>
                    <th className="bg-[#00007F] text-white text-sm font-bold p-3 text-center">
                      Passout Year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length > 0 ? (
                    currentStudents.map(student => (
                      <tr
                        key={
                          student.id ||
                          student.student_id ||
                          `student-${student.sNo}`
                        }
                        className="block sm:table-row mb-5 sm:mb-0 border sm:border-0 border-gray-200 rounded-lg sm:rounded-none bg-white sm:bg-transparent shadow sm:shadow-none even:bg-white sm:even:bg-[#F7F8FF] odd:bg-white"
                      >
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:min-w-[48px] sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Select
                          </span>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer"
                              checked={checkedStudents.includes(
                                student.id || student.student_id
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  student.id || student.student_id
                                )
                              }
                              aria-label={`Select student ${student.name || 'Unknown'}`}
                            />
                          </div>
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            S.No
                          </span>
                          {student.sNo}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Student ID
                          </span>
                          {student.student_id || 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Name
                          </span>
                          {student.name || 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Email
                          </span>
                          {student.email || 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Phone
                          </span>
                          {student.phone || 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Graduation %
                          </span>
                          {Number.isFinite(
                            parseInt(student.highestGraduationpercentage)
                          )
                            ? `${student.highestGraduationpercentage}%`
                            : 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Department
                          </span>
                          {student.department || 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Location
                          </span>
                          {student.location || 'N/A'}
                        </td>
                        <td className="flex sm:table-cell justify-between sm:justify-center items-center p-3 sm:p-3 border-b sm:border border-gray-200 sm:text-center">
                          <span className="block sm:hidden font-bold text-[#00007F] w-2/5 text-left">
                            Passout Year
                          </span>
                          {student.yearOfPassing || 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center p-4 text-gray-600 text-base"
                      >
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalStudents > 0 && (
              <div className="mt-6 w-full overflow-x-auto py-3">
                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 max-w-[95%] mx-auto sm:max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={handlePrevPage}
                    className={`min-w-[64px] px-3 py-2 text-base font-medium rounded-md shadow-sm transition-all ${page === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-[#0C1BAA] bg-white hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5'}`}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    Prev
                  </button>
                  {getPaginationItems().map((item, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof item === 'number' && handlePageChange(item)
                      }
                      className={`min-w-[40px] px-3 py-2 text-base font-medium rounded-md shadow-sm transition-all ${typeof item === 'number' && page === item ? 'text-white bg-[#0C1BAA] shadow-md' : typeof item === 'number' ? 'text-[#0C1BAA] bg-white hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5' : 'text-gray-400 cursor-default bg-white'}`}
                      disabled={typeof item !== 'number'}
                      aria-label={
                        typeof item === 'number' ? `Page ${item}` : 'Ellipsis'
                      }
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    onClick={handleNextPage}
                    className={`min-w-[64px] px-3 py-2 text-base font-medium rounded-md shadow-sm transition-all ${page === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-[#0C1BAA] bg-white hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5'}`}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ViewAppliedStudents;
