import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem'; // Added import
import Stack from '@mui/material/Stack';
import { getBatches } from '../reducers/batchesSlice.js';
import { getStudentsByLoc } from '../reducers/studentsListSlice.js';

export default function StudentsList() {
  const dispatch = useDispatch();
  const {
    studentsByLoc = [],
    studentsListLoading = false,
    studentsListError = null,
  } = useSelector(state => state.studentsList || {});
  const {
    batchesList = [],
    batchesListLoading = false,
    batchesListError = null,
  } = useSelector(state => state.batches || {});
  const { userInfo = {} } = useSelector(state => state.auth || {});
  const [page, setPage] = useState(1);
  const [studentsList, setStudentsList] = useState([]);
  const location = userInfo?.location || '';

  // Filters
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchBatchNo, setSearchBatchNo] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchHighestGraduation, setSearchHighestGraduation] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [searchYop, setSearchYop] = useState('');
  const [searchBacklogs, setSearchBacklogs] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    if (location && !studentsByLoc.length) {
      dispatch(getBatches(location));
      dispatch(getStudentsByLoc(location));
    }
  }, [dispatch, location]);

  useEffect(() => {
    if (studentsByLoc.length > 0) {
      setStudentsList(studentsByLoc);
    }
  }, [studentsByLoc]);

  const studentsPerPage = 5;

  const handleChange = (event, value) => {
    setPage(value);
  };

  const exportToExcel = async () => {
    try {
      const [{ write, utils }, { saveAs }] = await Promise.all([
        import('xlsx'),
        import('file-saver'),
      ]);
      const { book_new, book_append_sheet, json_to_sheet } = utils;
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
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  // Filtering Logic
  const filteredStudents = (studentsList || []).filter(student => {
    const studentPercentage = student?.highestGraduationpercentage || 0;
    const enteredDepartments = searchDepartment
      ? searchDepartment.split(',').map(dept => dept.trim().toLowerCase())
      : [];
    const departmentMatch =
      searchDepartment === '' ||
      enteredDepartments.some(dept =>
        (student?.department || '').toLowerCase().includes(dept)
      );

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
      departmentMatch &&
      (searchHighestGraduation === '' ||
        (student?.qualification || '')
          .toLowerCase()
          .includes(searchHighestGraduation.toLowerCase())) &&
      (minPercentage === '' ||
        studentPercentage >= parseFloat(minPercentage)) &&
      (searchYop === '' ||
        (student?.yearOfPassing || '').toString().includes(searchYop)) &&
      (searchBacklogs === '' ||
        (student?.ArrearsCount || '').toString().includes(searchBacklogs)) &&
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

  // Pagination items for compact style
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 4;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (page > 3) items.push('...');
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);
      if (page > totalPages - 3) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }
      for (let i = startPage; i <= endPage; i++) {
        if (!items.includes(i)) items.push(i);
      }
      if (endPage < totalPages - 1) items.push('...');
      if (!items.includes(totalPages)) items.push(totalPages);
    }
    return items;
  };

  return (
    <div className="flex flex-col mx-auto p-6 min-h-[89vh] font-[Inter]">
      <h2 className="text-[var(--color-secondary)] text-2xl font-bold text-center mb-4">
        Students List (<span className="text-[#ED1334]">{totalStudents}</span>)
      </h2>
      <div className="flex flex-col items-center space-y-4 mb-4">
        <button
          className="bg-[var(--color-secondary)] hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded flex items-center gap-2"
          onClick={exportToExcel}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.4945 13.2011V17.0725C18.4945 17.5858 18.2906 18.0782 17.9276 18.4412C17.5646 18.8042 17.0722 19.0082 16.5588 19.0082H3.00894C2.49556 19.0082 2.00321 18.8042 1.6402 18.4412C1.27718 18.0782 1.07324 17.5858 1.07324 17.0725V13.2011M4.94464 8.3618L9.78389 13.2011M9.78389 13.2011L14.6231 8.3618M9.78389 13.2011V1.58685"
              stroke="white"
              strokeWidth="1.9357"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download Excel
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-4 p-4 bg-white shadow-md rounded-2xl">
        <input
          type="text"
          value={searchStudentId}
          onChange={e => setSearchStudentId(e.target.value)}
          placeholder="Student ID"
          className="border rounded p-3 text-sm bg-[#EFF0F7] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={searchStudentName}
          onChange={e => setSearchStudentName(e.target.value)}
          placeholder="Student Name"
          className="border rounded p-3 text-sm bg-[#EFF0F7] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative w-full">
          <select
            value={searchBatchNo}
            onChange={e => setSearchBatchNo(e.target.value)}
            className="appearance-none bg-[#EFF0F7] rounded p-3 w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={batchesListLoading}
          >
            <option value="">All Batches</option>
            {batchesList.map((batch, index) => (
              <option key={batch._id || index} value={batch.Batch}>
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
                d="M11.2319 0.272237L12.2315 1.27283L6.78345 6.72279C6.69615 6.81064 6.59234 6.88036 6.478 6.92793C6.36365 6.97551 6.24103 7 6.11718 7C5.99333 7 5.8707 6.97551 5.75636 6.92793C5.64201 6.88036 5.5382 6.81064 5.4509 6.72279L0 1.27283L0.999647 0.27318L6.11576 5.38835L11.2319 0.272237Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
        <input
          type="text"
          value={searchDepartment}
          onChange={e => setSearchDepartment(e.target.value)}
          placeholder="Department (Comma separated)"
          className="border rounded p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={searchHighestGraduation}
          onChange={e => setSearchHighestGraduation(e.target.value)}
          placeholder="Highest Graduation"
          className="border rounded p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={minPercentage}
          onChange={e => setMinPercentage(e.target.value)}
          placeholder="Minimum Graduation %"
          className="border rounded p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={searchYop}
          onChange={e => setSearchYop(e.target.value)}
          placeholder="YOP"
          className="border rounded p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={searchBacklogs}
          onChange={e => setSearchBacklogs(e.target.value)}
          placeholder="Backlogs"
          className="border rounded p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={searchLocation}
          onChange={e => setSearchLocation(e.target.value)}
          placeholder="Location"
          className="border rounded p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {studentsListLoading || batchesListLoading ? (
        <p className="text-center text-gray-600 mt-10">Loading...</p>
      ) : studentsListError || batchesListError ? (
        <p className="text-center text-red-500 mt-10">
          {studentsListError || batchesListError}
        </p>
      ) : totalStudents > 0 ? (
        <div
          className="overflow-x-auto w-full mb-4 mt-10 rounded-[20px]"
          style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
        >
          <table className="w-full border-collapse">
            <thead className="bg-[var(--color-secondary)] text-white">
              <tr>
                <th className="px-6 py-3 text-center">StudentId</th>
                <th className="px-6 py-3 text-center">Student Name</th>
                <th className="px-6 py-3 text-center">BatchNO</th>
                <th className="px-6 py-3 text-center">Email</th>
                <th className="px-6 py-3 text-center">Phone</th>
                <th className="px-6 py-3 text-center">College Name</th>
                <th className="px-6 py-3 text-center">Highest Graduation</th>
                <th className="px-6 py-3 text-center">Department</th>
                <th className="px-6 py-3 text-center">Graduation Percentage</th>
                <th className="px-6 py-3 text-center">
                  Graduation Passout Year
                </th>
                <th className="px-6 py-3 text-center">Skills</th>
                <th className="px-6 py-3 text-center">Backlogs</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr
                  key={student.id || index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#EFF0F7]'}
                >
                  <td className="px-6 py-5 text-center">
                    {student.studentId || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.name || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.BatchNo || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.email || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.studentPhNumber || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.collegeName || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.qualification || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.department || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.highestGraduationpercentage
                      ? `${student.highestGraduationpercentage}%`
                      : '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.yearOfPassing || '__'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.studentSkills?.length > 0
                      ? student.studentSkills.join(', ')
                      : 'No skills listed'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.ArrearsCount || '__'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChange}
                variant="outlined"
                shape="rounded"
                renderItem={item => {
                  const paginationItems = getPaginationItems();
                  if (
                    item.type === 'page' &&
                    paginationItems.includes('...') &&
                    paginationItems.indexOf(item.page) === -1
                  ) {
                    return <span>...</span>;
                  }
                  return <PaginationItem {...item} />;
                }}
              />
            </Stack>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-10">No students found.</p>
      )}
    </div>
  );
}
