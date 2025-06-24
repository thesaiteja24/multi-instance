import React, { useState, useEffect } from 'react';
import { write, utils } from 'xlsx';
import { saveAs } from 'file-saver';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../reducers/batchesSlice.js';
import { getStudentsList } from '../reducers/studentsListSlice.js'; // Import the thunk

export default function StudentsList() {
  const dispatch = useDispatch();
  const { studentsList, studentsListLoading, studentsListError } = useSelector(
    state => state.studentsList
  );
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );
  const { userInfo } = useSelector(state => state.auth);
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchStudentName, setSearchStudentName] = useState('');
  const [searchBatchNo, setSearchBatchNo] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [page, setPage] = useState(1);

  const { book_new, book_append_sheet, json_to_sheet } = utils;

  const location = userInfo?.location;
  const studentsPerPage = 6;

  // Fetch students and batches
  useEffect(() => {
    dispatch(getStudentsList());
    if (batchesList.length === 0 && location) {
      dispatch(getBatches(location));
    }
  }, [dispatch, location, batchesList.length]);

  // Filtering logic
  const filteredStudents = (studentsList || []).filter(student => {
    const studentName = student?.name || '';
    const studentId = student?.studentId || '';
    const batchNo = student?.BatchNo || '';
    const studentLocation = student?.location || '';

    return (
      (searchStudentId === '' ||
        studentId.toLowerCase().includes(searchStudentId.toLowerCase())) &&
      (searchStudentName === '' ||
        studentName.toLowerCase().includes(searchStudentName.toLowerCase())) &&
      (searchBatchNo === '' ||
        batchNo.toLowerCase() === searchBatchNo.toLowerCase()) &&
      (searchLocation === '' ||
        studentLocation.toLowerCase().includes(searchLocation.toLowerCase()))
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

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageChange = value => {
    setPage(value);
  };

  const exportToExcel = () => {
    const wb = book_new();
    const studentsWithoutPassword = filteredStudents.map(
      ({ password, ...rest }) => rest
    );
    const ws = json_to_sheet(studentsWithoutPassword);
    book_append_sheet(wb, ws, 'Students');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'students-list.xlsx');
  };

  // Pagination logic for compact style
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 4;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (page > 3) {
        items.push('...');
      }
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);
      if (page > totalPages - 3) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }
      for (let i = startPage; i <= endPage; i++) {
        if (!items.includes(i)) {
          items.push(i);
        }
      }
      if (endPage < totalPages - 1) {
        items.push('...');
      }
      if (!items.includes(totalPages)) {
        items.push(totalPages);
      }
    }

    return items;
  };

  return (
    <div className="p-5 font-[Inter]">
      <div>
        <h2 className="font-semibold text-[#00007F] text-[24px] text-center">
          Students List (
          <span className="font-semibold text-[24px] text-[#ED1334]">
            {totalStudents}
          </span>
          )
        </h2>
      </div>

      {batchesListError || studentsListError ? (
        <p className="text-center text-red-500 mt-10">
          {batchesListError || studentsListError}
        </p>
      ) : (
        <>
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
                disabled={batchesListLoading || batchesList.length === 0}
                className="appearance-none bg-[#EFF0F7] rounded-[4px] w-full h-[46px] border-none px-4 pr-10 focus:outline-none text-[14px] sm:text-[16px]"
              >
                <option value="">All Batches</option>
                {batchesList.map(batch => (
                  <option key={batch._id} value={batch.Batch}>
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
              placeholder="Location"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              className="border rounded p-3 text-sm sm:text-base placeholder:text-black bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-center gap-4 bg-[#00007F] text-white p-3 rounded-md text-sm sm:text-base hover:bg-blue-800 transition">
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
              <button onClick={exportToExcel}>Download Excel</button>
            </div>
          </div>

          {studentsListLoading || batchesListLoading ? (
            <p className="text-center text-gray-600 mt-10">Loading...</p>
          ) : totalStudents > 0 ? (
            <div
              className="overflow-x-auto mt-10 rounded-[20px]"
              style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
            >
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#00007F] text-white font-semibold text-[16px]">
                    <th className="px-6 py-6 text-left">Student Id</th>
                    <th className="px-6 py-3 text-center">BatchNO</th>

                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email Id</th>
                    <th className="px-6 py-3 text-left">Phone Number</th>
                    <th className="px-6 py-3 text-left">College Name</th>
                    <th className="px-6 py-3 text-left">Highest Graduation</th>
                    <th className="px-6 py-3 text-left">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={
                        index % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#EFF0F7]'
                      }
                    >
                      <td className="px-6 py-5">{student.studentId || '__'}</td>
                      <td className="px-6 py-5">{student.BatchNo || '__'}</td>

                      <td className="px-6 py-5">{student.name || '__'}</td>
                      <td className="px-6 py-5">{student.email || '__'}</td>
                      <td className="px-6 py-5">
                        {student.studentPhNumber || '__'}
                      </td>
                      <td className="px-6 py-5">
                        {student.collegeName || '__'}
                      </td>
                      <td className="px-6 py-5">
                        {student.qualification || '__'}
                      </td>
                      <td className="px-6 py-5">
                        {student.department || '__'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-10">
              No students found.
            </p>
          )}

          {totalStudents > 0 && (
            <div className="w-full flex justify-end max-w-full mt-1 px-4">
              <div className="text-black font-medium text-[16px] font-['Inter'] leading-[70px] space-x-2">
                <button
                  onClick={handlePrevPage}
                  className={`font-semibold ${
                    page === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#0C1BAA] hover:text-blue-800'
                  }`}
                  disabled={page === 1}
                >
                  {'<'} PREV
                </button>
                {getPaginationItems().map((item, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof item === 'number' && handlePageChange(item)
                    }
                    className={
                      typeof item === 'number' && page === item
                        ? 'text-[#0C1BAA] font-semibold'
                        : 'hover:text-[#0C1BAA]'
                    }
                    disabled={typeof item !== 'number'}
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  className={`font-semibold ${
                    page === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-[#0C1BAA] hover:text-blue-800'
                  }`}
                  disabled={page === totalPages}
                >
                  NEXT {'>'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
