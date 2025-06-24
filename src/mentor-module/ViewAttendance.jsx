import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getMentorStudentsThunk } from '../reducers/mentorStudentsSlice';

/** Convert "YY-MM-DD" => "YYYY-MM-DD". */
function convertDateYYMMDDtoYYYYMMDD(shortDate) {
  const parts = shortDate.split('-');
  if (parts.length !== 3) return '';

  const yy = parseInt(parts[0]);
  const mm = parts[1];
  const dd = parts[2];

  const fullYear = yy;

  return `${fullYear}-${mm}-${dd}`;
}

/** Return short weekday name from "YYYY-MM-DD" (e.g., "Mon"). */
function getDayName(isoDate) {
  const [yyyy, mm, dd] = isoDate.split('-');
  if (!yyyy || !mm || !dd) return '';
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
}

/** Check if "YYYY-MM-DD" is Sunday => override status with "-". */
function isSunday(isoDate) {
  const [yyyy, mm, dd] = isoDate.split('-');
  if (!yyyy || !mm || !dd) return false;
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.getDay() === 0; // 0 => Sunday
}

const ViewAttendance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const storedLocation = userInfo?.location;
  const mentorId = userInfo?.id;
  const { scheduleData } = useSelector(state => state.mentorStudents);

  // ----------- FILTER STATE -----------
  const [selectedLocation, setSelectedLocation] = useState(
    storedLocation || 'SelectLocation'
  );
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('SelectSubject');
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('SelectBatch');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Data from server
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [studentMap, setStudentMap] = useState({}); // subject => studentId => { name, daily }
  const [uniqueDates, setUniqueDates] = useState([]);
  const [datesWithRemarks, setDatesWithRemarks] = useState(new Set());

  // Initialize location from session storage
  useEffect(() => {
    if (storedLocation) {
      setSelectedLocation(storedLocation);
    }
  }, [storedLocation]);

  // Fetch mentor students if scheduleData is empty
  useEffect(() => {
    if (
      scheduleData.length === 0 &&
      selectedLocation !== 'SelectLocation' &&
      mentorId
    ) {
      dispatch(
        getMentorStudentsThunk({ location: selectedLocation, mentorId })
      );
    }
  }, [dispatch, selectedLocation, mentorId, scheduleData.length]);

  // Build subject drop-down from scheduleData
  useEffect(() => {
    const subjects = scheduleData.map(item => item.subject);
    setAvailableSubjects([...new Set(subjects)]);
    setSelectedSubject('SelectSubject');
    setFilteredBatches([]);
  }, [scheduleData]);

  // Filter batches when subject changes
  useEffect(() => {
    if (selectedSubject !== 'SelectSubject') {
      const validBatches = scheduleData
        .filter(item => item.subject === selectedSubject)
        .flatMap(item => item.batchNo);
      setFilteredBatches(validBatches);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, scheduleData]);

  // ------------- Fetch Data -------------
  const fetchAttendanceData = useCallback(async () => {
    if (
      selectedLocation === 'SelectLocation' ||
      selectedSubject === 'SelectSubject' ||
      selectedBatch === 'SelectBatch'
    ) {
      setRecords([]);
      setStudentMap({});
      setUniqueDates([]);
      setDatesWithRemarks(new Set());
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/getattends`,
        {
          params: {
            location: selectedLocation,
            subject: selectedSubject,
            batch: selectedBatch,
          },
        }
      );
      const data = response.data?.data || [];
      setRecords(data);
      transformDataToSpreadsheet(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setRecords([]);
      setStudentMap({});
      setUniqueDates([]);
      setDatesWithRemarks(new Set());
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedSubject, selectedBatch]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // ------------- Transform to a multi-day map -------------
  function transformDataToSpreadsheet(rawData) {
    const dateSet = new Set();
    const remarksSet = new Set();
    const map = {};

    // Step 1: Convert and sort dates to find latest record
    const sortedByDate = rawData
      .map(record => ({
        ...record,
        isoDate: convertDateYYMMDDtoYYYYMMDD(record.datetime),
      }))
      .sort((a, b) => (a.isoDate < b.isoDate ? 1 : -1)); // Descending

    const latestDate = sortedByDate[0]?.isoDate;
    const latestStudents = sortedByDate[0]?.students || [];

    // Step 2: Create studentId => name map from latest date
    const latestNamesMap = {};
    latestStudents.forEach(stu => {
      latestNamesMap[stu.studentId] = stu.name;
    });

    // Step 3: Group by subject
    const subject = selectedSubject;
    if (!map[subject]) {
      map[subject] = {};
    }

    // Step 4: Loop through all records
    rawData.forEach(record => {
      const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);
      dateSet.add(isoDate);

      record.students.forEach(stu => {
        const { studentId, status, remarks } = stu;

        if (!map[subject][studentId]) {
          map[subject][studentId] = {
            studentId,
            name: latestNamesMap[studentId] || 'Unknown',
            daily: {},
          };
        }

        map[subject][studentId].daily[isoDate] = {
          status: status || 'absent', // Default to absent
          remarks: remarks || '',
        };

        if (remarks && remarks.trim() !== '') {
          remarksSet.add(isoDate);
        }
      });
    });

    const sortedDates = Array.from(dateSet).sort();
    setUniqueDates(sortedDates);
    setDatesWithRemarks(remarksSet);
    setStudentMap(map);
  }

  // ------------- Build array of students, then apply search filter -------------
  const getDisplayedStudents = subject => {
    if (!studentMap[subject]) return [];
    const allStudents = Object.values(studentMap[subject]).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return allStudents.filter(stu => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = stu.name.toLowerCase().includes(q);
        const matchesId = stu.studentId.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      return true;
    });
  };

  // ------------- Totals -------------
  function getTotals(stu, dates) {
    let presentCount = 0;
    let absentCount = 0;
    let dayCount = 0;

    dates.forEach(dt => {
      if (isSunday(dt)) return; // Skip Sunday
      dayCount++;
      const info = stu.daily[dt] || {};
      let status = info.status?.toLowerCase() || 'absent';
      if (status === 'present') presentCount++;
      else if (status === 'absent' || status === 'ab') absentCount++;
    });

    return { presentCount, absentCount, dayCount };
  }

  // ------------- Excel Export -------------
  const handleExportToExcel = subject => {
    if (!records.length || !studentMap[subject]) {
      alert(`No attendance data to export for ${subject}!`);
      return;
    }

    const wb = XLSX.utils.book_new();
    const rows = getDisplayedStudents(subject).map((stu, idx) => {
      const row = {
        'S.No': idx + 1,
        'Student ID': stu.studentId,
        Name: stu.name,
      };

      uniqueDates.forEach(dt => {
        const dayName = getDayName(dt);
        if (isSunday(dt)) {
          row[`${dt} (${dayName}) - Status`] = '-';
          if (datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = '-';
          }
        } else {
          const info = stu.daily[dt] || {};
          let st = info.status || 'absent';
          let rm = info.remarks || '';
          row[`${dt} (${dayName}) - Status`] = st;
          if (datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = rm;
          }
        }
      });

      const { presentCount, absentCount, dayCount } = getTotals(
        stu,
        uniqueDates
      );
      row['Total Present'] = presentCount;
      row['Total Absent'] = absentCount;
      row['Total Days'] = dayCount;

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `${subject}_Attendance`);
    XLSX.writeFile(
      wb,
      `${subject}_Attendance_${selectedBatch}_${selectedLocation}.xlsx`
    );
  };

  return (
    <div className="p-4 font-[inter] w-full">
      <div className="text-center">
        <span className="text-[24px] font-medium text-[#000000]">
          Student Attendance
        </span>
      </div>

      {/* Back Button */}
      <div className="mb-6 flex justify-between items-center">
        <button
          className="bg-[#00007F] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[#00007F]/90 transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 xl:gap-20 p-4">
        {/* Subject Filter */}
        <div className="relative w-60">
          <label className="block text-[16px] font-medium text-[#000000] mb-1">
            Select Subject
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full p-3 text-[12px] rounded-md shadow-sm focus:outline-none focus:ring-0"
              style={{ boxShadow: '0px 4px 15px 0px #132EE026' }}
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              disabled={availableSubjects.length === 0}
            >
              <option value="SelectSubject" disabled>
                Select Subject
              </option>
              {availableSubjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-6 h-6 text-black"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Batch Filter */}
        <div className="relative w-60 mb-4">
          <label className="block text-[16px] font-medium text-[#000000] mb-1">
            Select Batch
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full p-3 border text-[12px] rounded-md shadow-sm focus:outline-none focus:ring-0"
              style={{ boxShadow: '0px 4px 15px 0px #132EE026' }}
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              disabled={filteredBatches.length === 0}
            >
              <option value="SelectBatch" disabled>
                Select Batch
              </option>
              {filteredBatches.map(batch => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-6 h-6 text-black"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-60">
          <label className="block text-[16px] font-medium text-[#000000] mb-1">
            Search by Student
          </label>
          <div className="relative">
            <input
              type="text"
              className="block w-full p-3 border text-[12px] rounded-md shadow-sm focus:outline-none focus:ring-0"
              style={{ boxShadow: '0px 4px 15px 0px #132EE026' }}
              placeholder="Name / ID"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value.toLowerCase())}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-[#00007F] font-semibold text-center mt-4">
          Loading data...
        </p>
      ) : Object.keys(studentMap).length === 0 ? (
        <p className="text-gray-500 font-semibold text-center mt-4">
          No attendance records found.
        </p>
      ) : (
        // Render table for each subject
        Object.keys(studentMap).map(subject => (
          <div key={subject} className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[20px] font-medium text-[#000000]">
                {subject} Attendance
              </h2>
              <button
                className="flex gap-3 border p-3 rounded-[4px] bg-[#129E00] text-[#FFFFFF] text-[16px] font-[Inter] font-medium"
                onClick={() => handleExportToExcel(subject)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 2.13C2.5 1.36 3.36 0.5 4.4 0.5H13.6C14.36 0.5 15.2 1.36 15.2 2.13V11.88C15.2 12.64 14.36 13.5 13.6 13.5H4.4C3.64 13.5 2.8 12.64 2.8 11.88M0.8 4.5L4.8 9.5M4.8 4.5L0.8 9.5"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 4.5V9.5M7.5 6.5H12.5M7.5 4.5H12.5V9.5H7.5V4.5Z"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Export to Excel
              </button>
            </div>

            {getDisplayedStudents(subject).length === 0 ? (
              <p className="text-gray-500 font-semibold">
                No students found for {subject}.
              </p>
            ) : (
              <div
                className="w-full border rounded-[20px] overflow-x-auto whitespace-nowrap"
                style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
              >
                <table className="min-w-full">
                  <thead className="text-[16px] font-[Inter] font-semibold text-[#FFFFFF] bg-[#00007F]">
                    <tr>
                      <th
                        className="p-4 sticky left-0 bg-[#00007F] z-10"
                        style={{ minWidth: '40px' }}
                        rowSpan={2}
                      >
                        S.no
                      </th>
                      <th
                        className={`p-4 sticky left-[40px] bg-[#00007F] z-10 ${
                          showDetails ? 'table-cell' : 'hidden md:table-cell'
                        }`}
                        style={{ minWidth: '100px' }}
                        rowSpan={2}
                      >
                        Student ID
                      </th>
                      <th
                        className={`p-4 sticky left-[140px] bg-[#00007F] z-10 ${
                          showDetails ? 'table-cell' : 'hidden md:table-cell'
                        }`}
                        style={{ minWidth: '150px' }}
                        rowSpan={2}
                      >
                        Name
                      </th>
                      {uniqueDates.map(dt => (
                        <th
                          key={dt}
                          colSpan={datesWithRemarks.has(dt) ? 2 : 1}
                          className="p-4 text-center"
                          style={{
                            minWidth: datesWithRemarks.has(dt)
                              ? '120px'
                              : '100px',
                          }}
                        >
                          {dt} ({getDayName(dt)})
                        </th>
                      ))}
                      <th
                        className="p-4 text-center"
                        rowSpan={2}
                        style={{ minWidth: '100px' }}
                      >
                        Total Present
                      </th>
                      <th
                        className="p-4 text-center"
                        rowSpan={2}
                        style={{ minWidth: '100px' }}
                      >
                        Total Absent
                      </th>
                      <th
                        className="p-4 text-center"
                        rowSpan={2}
                        style={{ minWidth: '100px' }}
                      >
                        Total Days
                      </th>
                    </tr>
                    <tr className="bg-[#00007F] text-[#FFFFFF]">
                      {uniqueDates.map(dt => (
                        <React.Fragment key={dt}>
                          <th
                            className="p-4 text-center"
                            style={{ minWidth: '60px' }}
                          >
                            Status
                          </th>
                          {datesWithRemarks.has(dt) && (
                            <th
                              className="p-4 text-center"
                              style={{ minWidth: '60px' }}
                            >
                              Remarks
                            </th>
                          )}
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="border rounded-b-[20px]">
                    {getDisplayedStudents(subject).map((stu, index) => {
                      const { presentCount, absentCount, dayCount } = getTotals(
                        stu,
                        uniqueDates
                      );

                      return (
                        <tr
                          key={stu.studentId}
                          className="text-[16px] font-normal text-[#000000] even:bg-white odd:bg-[#EFF0F7] hover:bg-[#E6E7ED]"
                        >
                          <td
                            className="p-4 text-center font-semibold sticky left-0 bg-inherit z-10"
                            style={{ minWidth: '40px' }}
                          >
                            {index + 1}
                          </td>
                          <td
                            className={`p-4 sticky left-[40px] bg-inherit z-10 ${
                              showDetails
                                ? 'table-cell'
                                : 'hidden md:table-cell'
                            }`}
                            style={{ minWidth: '100px' }}
                          >
                            {stu.studentId}
                          </td>
                          <td
                            className={`p-4 sticky left-[140px] bg-inherit z-10 ${
                              showDetails
                                ? 'table-cell'
                                : 'hidden md:table-cell'
                            }`}
                            style={{ minWidth: '150px' }}
                          >
                            {stu.name}
                          </td>
                          {uniqueDates.map(dt => {
                            if (isSunday(dt)) {
                              return (
                                <React.Fragment key={dt}>
                                  <td className="p-4 text-center font-semibold">
                                    -
                                  </td>
                                  {datesWithRemarks.has(dt) && (
                                    <td className="p-4 text-center">-</td>
                                  )}
                                </React.Fragment>
                              );
                            }
                            const info = stu.daily[dt] || {};
                            let status = info.status || 'absent';
                            let remarks = info.remarks || '';
                            const isAbsent =
                              status.toLowerCase() === 'absent' ||
                              status.toLowerCase() === 'ab';

                            return (
                              <React.Fragment key={dt}>
                                <td
                                  className={`p-4 text-center font-semibold ${
                                    isAbsent
                                      ? 'text-[#ED1334]'
                                      : 'text-[#129E00]'
                                  }`}
                                >
                                  {status}
                                </td>
                                {datesWithRemarks.has(dt) && (
                                  <td className="p-4 text-center">{remarks}</td>
                                )}
                              </React.Fragment>
                            );
                          })}
                          <td className="p-4 text-center font-semibold text-[#129E00]">
                            {presentCount}
                          </td>
                          <td className="p-4 text-center font-semibold text-[#ED1334]">
                            {absentCount}
                          </td>
                          <td className="p-4 text-center font-semibold text-[#00007F]">
                            {dayCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="md:hidden mt-2 text-center">
                  <button
                    className="bg-[#00007F] text-white px-4 py-2 rounded hover:bg-[#00007F]/90"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ViewAttendance;
