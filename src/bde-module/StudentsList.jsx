import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { write, utils } from 'xlsx';
import { saveAs } from 'file-saver';
import { getBatches } from '../reducers/batchesSlice.js';
import { getStudentsList } from '../reducers/studentsListSlice.js';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { useNavigate } from 'react-router-dom';

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

export default function StudentsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const {
    studentsList = [],
    studentsListLoading,
    studentsListError,
  } = useSelector(state => state.studentsList);
  const {
    batchesList = [],
    batchesListLoading,
    batchesListError,
  } = useSelector(state => state.batches);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const { book_new, book_append_sheet, json_to_sheet } = utils;
  const location = userInfo?.location || '';

  // Filters
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchBatchNo, setSearchBatchNo] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    if (studentsList.length === 0) {
      dispatch(getBatches('all'));
      dispatch(getStudentsList());
    }
  }, [dispatch, location]);

  const studentsPerPage = 6;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageChange = value => {
    setPage(value);
  };

  const exportToExcel = async () => {
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
      if (filteredStudents.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No students available to export.',
        });
        loadingSwal.close();
        setIsExportingExcel(false);
        return;
      }
      const wb = book_new();
      const filteredData = filteredStudents.map(
        ({ password, ...rest }) => rest
      );
      const ws = json_to_sheet(filteredData);
      book_append_sheet(wb, ws, 'Filtered Students');
      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/octet-stream',
      });
      saveAs(blob, 'filtered-students-list.xlsx');

      loadingSwal.close();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Excel file downloaded successfully!',
      });
    } catch (err) {
      console.error('Export error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to export data to Excel.',
      });
      loadingSwal.close();
      setError('Failed to export data to Excel.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Filtering Logic
  const filteredStudents = studentsList.filter(student => {
    return (
      (searchStudentId === '' ||
        (student?.studentId || '')
          .toLowerCase()
          .includes(searchStudentId.toLowerCase())) &&
      (searchStudentName === '' ||
        (student?.name || '')
          .toLowerCase()
          .includes(searchStudentName.toLowerCase())) &&
      (searchBatchNo === '' ||
        (student?.BatchNo || '').toLowerCase() ===
          searchBatchNo.toLowerCase()) &&
      (searchLocation === '' ||
        (student?.collegeName || '')
          .toLowerCase()
          .includes(searchLocation.toLowerCase()))
    );
  });

  const indexOfLastStudent = page * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  // Pagination logic for compact style
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

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 font-[Inter] relative max-w-[full] mx-auto">
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
        <h2 className="font-semibold text-[var(--color-secondary)] text-[24px] text-center mb-6">
          Students List (
          <span className="font-semibold text-[24px] text-[#ED1334]">
            {totalStudents}
          </span>
          )
        </h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 sm:p-6 mt-4 bg-white border rounded-2xl"
          style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
        >
          <input
            type="text"
            placeholder="Student ID"
            value={searchStudentId}
            onChange={e => setSearchStudentId(e.target.value)}
            className="border rounded p-3 text-sm sm:text-base placeholder:text-black bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Student Name"
            value={searchStudentName}
            onChange={e => setSearchStudentName(e.target.value)}
            className="border rounded p-3 text-sm sm:text-base placeholder:text-black bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative w-full">
            <select
              value={searchBatchNo}
              onChange={e => setSearchBatchNo(e.target.value)}
              className="appearance-none bg-[#EFF0F7] w-full h-[46px] border-none px-4 py-3 rounded-md focus:outline-none text-[14px] sm:text-[16px]"
              disabled={batchesListLoading}
            >
              <option value="">All Batches</option>
              {batchesList.map((batch, index) => (
                <option key={batch._id || `batch-${index}`} value={batch.Batch}>
                  {batch.Batch}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                width="13"
                height="7"
                viewBox="0 0 13 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.645 0.272237L12.6445 1.27283L7.01145 18.72279C6.9241 18.81064 6.82045 18.88036 6.70624 18.92793C6.5919 18.97551 6.46935 19 6.3455 19C6.22165 19 6.09905 18.97551 5.98465 18.92793C5.87035 18.88036 5.7665 18.81064 5.67925 18.72279L0.01325 1.29983L1.01285 0.26518L6.24585 5.38835L11.645 0.272237Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
          <input
            type="text"
            placeholder="Location"
            value={searchLocation}
            onChange={e => setSearchLocation(e.target.value)}
            className="border rounded p-3 text-sm sm:text-base placeholder:text-black bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={exportToExcel}
            className={`w-full sm:w-auto min-w-[120px] px-4 py-2 bg-[#0049C6] text-white rounded-md text-sm sm:text-base font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isExportingExcel || filteredStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0049C6]/90'}`}
            disabled={isExportingExcel || filteredStudents.length === 0}
            aria-label="Download Excel"
          >
            Download Excel
          </button>
        </div>

        {studentsListLoading || batchesListLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-[#00007F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : studentsListError || batchesListError || error ? (
          <p className="text-center text-red-500 mt-10">
            {studentsListError || batchesListError || error}
          </p>
        ) : totalStudents > 0 ? (
          <div
            className="overflow-x-auto mt-10 rounded-[20px]"
            style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
          >
            <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[var(--color-secondary)] text-white font-semibold text-[16px]">
                  <th className="px-4 py-2">StudentId</th>
                  <th className="px-4 py-2">BatchNO</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">College Name</th>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2">Graduation Percentage</th>
                  <th className="px-4 py-2">Skills</th>
                  <th className="px-4 py-2">Year of Passing</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student, index) => (
                  <tr
                    key={student.id || student.studentId || `student-${index}`}
                    className={
                      index % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#EFF0F7]'
                    }
                  >
                    <td className="px-4 py-2 text-center">
                      {student.studentId || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.BatchNo || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.name || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.email || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.studentPhNumber || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.location || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.collegeName || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.department || '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.highestGraduationpercentage
                        ? `${student.highestGraduationpercentage}%`
                        : '__'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.studentSkills?.length > 0
                        ? student.studentSkills.join(', ')
                        : 'No skills listed'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {student.yearOfPassing || '__'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-10">No students found.</p>
        )}

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
                  key={`page-${index}`}
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
      </div>
    </ErrorBoundary>
  );
}
