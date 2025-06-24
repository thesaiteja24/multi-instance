import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { getBatches } from '../reducers/batchesSlice.js';
import { COLLEGE_CODE } from '../constants/AppConstants.js';

function convertDateYYMMDDtoYYYYMMDD(shortDate) {
  if (!shortDate) {
    console.error('No date string provided to convertDateYYMMDDtoYYYYMMDD');
    return '';
  }
  const parts = shortDate.split('-');
  if (parts.length !== 3) return '';
  const yy = parseInt(parts[0], 10);
  const mm = parts[1];
  const dd = parts[2];
  const fullYear = yy;
  return `${fullYear.toString().padStart(4, '0')}-${mm}-${dd}`;
}

function getDayName(isoDate) {
  const [yyyy, mm, dd] = isoDate.split('-');
  if (!yyyy || !mm || !dd) return '';
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
}

function isSunday(isoDate) {
  const [yyyy, mm, dd] = isoDate.split('-');
  if (!yyyy || !mm || !dd) return false;
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.getDay() === 0;
}

const SubjectAdminAttendance = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { usrType, loc } = userInfo;
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );
  const [selectedLocation, setSelectedLocation] = useState('SelectLocation');
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('SelectBatch');
  const [selectedCourse, setSelectedCourse] = useState('AllCourses');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState(null);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courseWiseData, setCourseWiseData] = useState({});

  const locations = [
    { value: 'SelectLocation', label: 'Select Location', disabled: true },
    { value: COLLEGE_CODE, label: COLLEGE_CODE },
  ];

  // Decrypt userType and location from sessionStorage
  useEffect(() => {
    // Handle userType
    if (usrType) {
      if (usrType === 'Python' || usrType === 'Java') {
        setUserType(usrType);
      } else {
        console.error('Invalid userType:', usrType);
        setError('Invalid user type. Please log in again.');
      }
    } else {
      console.error('No userType found');
      setError('No user type found. Please log in again.');
    }

    // Handle location
    if (loc) {
      if (loc === 'all') {
        setIsAdmin(true);
        setSelectedLocation(COLLEGE_CODE);
      } else if ([COLLEGE_CODE].includes(loc)) {
        setSelectedLocation(loc);
      } else {
        console.error('Invalid location:', loc);
        setError('Invalid location. Please log in again.');
      }
    } else {
      console.error('No location found');
      setError('No location found. Please log in again.');
    }
  }, []);

  // Fetch batches based on selectedLocation using Redux
  useEffect(() => {
    if (
      userType &&
      selectedLocation !== 'SelectLocation' &&
      batchesList.length === 0
    ) {
      dispatch(getBatches(selectedLocation));
    }
  }, [userType, selectedLocation, batchesList.length, dispatch]);

  // Filter batches based on userType and location
  useEffect(() => {
    if (!userType || selectedLocation === 'SelectLocation') {
      setFilteredBatches([]);
      return;
    }

    const batchPrefix = userType === 'Python' ? 'PFS-' : 'JFS-';
    let filtered = batchesList.filter(batch => {
      if (!batch.Batch || typeof batch.Batch !== 'string') {
        console.warn(`Missing or invalid Batch for batch ID: ${batch.id}`);
        return false;
      }
      if (!batch.Batch.startsWith(batchPrefix)) {
        console.warn(
          `Invalid batch prefix for ${userType}: ${batch.Batch} (ID: ${batch.id})`
        );
        return false;
      }
      return true;
    });

    filtered = filtered.filter(
      batch => batch.location?.toLowerCase() === selectedLocation.toLowerCase()
    );

    setFilteredBatches(filtered);
    setSelectedBatch('SelectBatch');
    setSelectedCourse('AllCourses');
  }, [batchesList, userType, selectedLocation]);

  // Update available courses
  useEffect(() => {
    if (
      selectedBatch !== 'SelectBatch' &&
      Object.keys(courseWiseData).length > 0
    ) {
      const courses = ['AllCourses', ...Object.keys(courseWiseData)];
      setAvailableCourses(courses);
      setSelectedCourse('AllCourses');
    } else {
      setAvailableCourses([]);
      setSelectedCourse('AllCourses');
    }
  }, [selectedBatch, courseWiseData]);

  const fetchAttendanceData = useCallback(async () => {
    if (
      selectedBatch === 'SelectBatch' ||
      !userType ||
      selectedLocation === 'SelectLocation'
    ) {
      setAttendanceRecords([]);
      setCourseWiseData({});
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/batchwiseattends`,
        {
          params: {
            batch: selectedBatch,
            location: selectedLocation,
          },
        }
      );

      const data = response.data?.data || [];
      setAttendanceRecords(data);
      transformData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceRecords([]);
      setCourseWiseData({});
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, userType, selectedLocation]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  function transformData(rawData) {
    const courseMap = {};
    const nameByDate = {};

    rawData.forEach(record => {
      const course = record.course || 'Unknown';
      const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);

      if (!courseMap[course]) {
        courseMap[course] = {
          studentMap: {},
          uniqueDates: new Set(),
          datesWithRemarks: new Set(),
        };
      }

      courseMap[course].uniqueDates.add(isoDate);

      let hasRemarksOnDate = false;
      record.students.forEach(stu => {
        if (stu.remarks && stu.remarks.trim() !== '') {
          hasRemarksOnDate = true;
        }
        if (stu.name) {
          if (
            !nameByDate[stu.studentId] ||
            isoDate > nameByDate[stu.studentId].date
          ) {
            nameByDate[stu.studentId] = {
              date: isoDate,
              name: stu.name.trim(),
            };
          }
        }
      });
      if (hasRemarksOnDate) {
        courseMap[course].datesWithRemarks.add(isoDate);
      }

      record.students.forEach(stu => {
        const studentId = stu.studentId;

        if (!courseMap[course].studentMap[studentId]) {
          courseMap[course].studentMap[studentId] = {
            studentId,
            name: nameByDate[stu.studentId]?.name || 'Unknown',
            daily: {},
          };
        } else {
          if (
            nameByDate[stu.studentId] &&
            isoDate >= nameByDate[stu.studentId].date
          ) {
            courseMap[course].studentMap[studentId].name =
              nameByDate[stu.studentId].name;
          }
        }

        courseMap[course].studentMap[studentId].daily[isoDate] = {
          status: stu.status || '',
          remarks: stu.remarks || '',
        };
      });
    });

    Object.keys(courseMap).forEach(course => {
      courseMap[course].uniqueDates = Array.from(
        courseMap[course].uniqueDates
      ).sort();
      courseMap[course].datesWithRemarks = new Set(
        courseMap[course].datesWithRemarks
      );
    });

    setCourseWiseData(courseMap);
  }

  function getTotals(stu, uniqueDates) {
    let presentCount = 0;
    let absentCount = 0;
    let dayCount = 0;

    uniqueDates.forEach(dt => {
      if (isSunday(dt)) return;
      dayCount++;

      const info = stu.daily[dt];
      let st = (info?.status || '').toLowerCase();
      if (!st) st = 'absent';
      if (st === 'present') presentCount++;
      else if (st === 'absent' || st === 'ab') absentCount++;
    });
    return { presentCount, absentCount, dayCount };
  }

  const generateCourseSheetData = (course, courseData) => {
    const students = Object.values(courseData.studentMap).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return students.map((stu, i) => {
      const row = {
        'S.No': i + 1,
        'Student ID': stu.studentId,
        Name: stu.name,
      };

      courseData.uniqueDates.forEach(dt => {
        const dayName = getDayName(dt);
        if (isSunday(dt)) {
          row[`${dt} (${dayName}) - Status`] = '-';
          if (courseData.datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = '-';
          }
        } else {
          const info = stu.daily[dt];
          let status = info?.status || 'absent';
          let remarks = info?.remarks || '';
          row[`${dt} (${dayName}) - Status`] = status;
          if (courseData.datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = remarks;
          }
        }
      });

      const { presentCount, absentCount, dayCount } = getTotals(
        stu,
        courseData.uniqueDates
      );
      row['Total Present'] = presentCount;
      row['Total Absent'] = absentCount;
      row['Total Days'] = dayCount;

      return row;
    });
  };

  const handleExportToExcel = course => {
    const courseData = courseWiseData[course];
    if (!courseData || !Object.keys(courseData.studentMap).length) {
      alert(`No attendance data to export for ${course}!`);
      return;
    }

    const wb = XLSX.utils.book_new();
    const rows = generateCourseSheetData(course, courseData);
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `${course}_Attendance`);
    XLSX.writeFile(wb, `${course}_Attendance_Spreadsheet.xlsx`);
  };

  const handleExportAllToExcel = () => {
    if (!Object.keys(courseWiseData).length) {
      alert('No attendance data to export!');
      return;
    }

    const wb = XLSX.utils.book_new();

    Object.keys(courseWiseData).forEach(course => {
      const courseData = courseWiseData[course];
      if (Object.keys(courseData.studentMap).length > 0) {
        const rows = generateCourseSheetData(course, courseData);
        const safeCourseName = course
          .replace(/[:*?\/\\[\]]/g, '_')
          .substring(0, 31);
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, safeCourseName);
      }
    });

    if (wb.SheetNames.length === 0) {
      alert('No valid attendance data to export!');
      return;
    }

    XLSX.writeFile(
      wb,
      `All_Courses_Attendance_${selectedBatch}_${
        userType === 'Python' ? 'PFS' : 'JFS'
      }_${selectedLocation}.xlsx`
    );
  };

  return (
    <div className="bg-gradient-to-b p-4 md:p-6 mt-0 font-[inter]">
      <h1 className="text-2xl md:text-3xl font-medium text-center text-gray-800 mb-4 md:mb-8">
        <span className="text-black bg-clip-text">
          {userType
            ? `${
                userType === 'Python'
                  ? 'Python Full Stack (PFS)'
                  : 'Java Full Stack (JFS)'
              } Attendance`
            : 'Student Attendance'}
        </span>
      </h1>

      {error || batchesListError ? (
        <p className="text-center text-red-500 font-semibold">
          {error || batchesListError}
        </p>
      ) : (
        <>
          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            <div>
              <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
                Select Location
              </label>
              <select
                className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                disabled={!isAdmin}
              >
                {locations.map(({ value, label, disabled }) => (
                  <option key={value} value={value} disabled={disabled}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
                Select Batch
              </label>
              <select
                className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                disabled={filteredBatches.length === 0 || batchesListLoading}
              >
                <option value="SelectBatch" disabled>
                  Select Batch
                </option>
                {filteredBatches.map(b => (
                  <option key={b.id} value={b.Batch}>
                    {b.Batch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
                Select Course
              </label>
              <select
                className="w-full px-2 py-1 md:px-4 md:py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                disabled={availableCourses.length === 0}
              >
                {availableCourses.map(course => (
                  <option key={course} value={course}>
                    {course === 'AllCourses' ? 'All Courses' : course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 md:mb-2 font-semibold text-gray-700 text-xs md:text-sm">
                Search by Student
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                placeholder="Name / ID"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>
          </div>

          {/* Download All Button */}
          {Object.keys(courseWiseData).length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 text-white py-1 px-3 md:py-2 md:px-4 rounded text-xs md:text-sm hover:bg-blue-700"
                onClick={handleExportAllToExcel}
              >
                Download All Courses
              </button>
            </div>
          )}

          {loading || batchesListLoading ? (
            <p className="text-blue-600 font-semibold mt-4 md:mt-6">
              Loading data...
            </p>
          ) : Object.keys(courseWiseData).length === 0 ? (
            <p className="text-gray-500 font-semibold mt-4 md:mt-6">
              {userType && selectedLocation !== 'SelectLocation'
                ? `No ${
                    userType === 'Python' ? 'PFS' : 'JFS'
                  } attendance records found for ${
                    selectedLocation.charAt(0).toUpperCase() +
                    selectedLocation.slice(1)
                  }.`
                : `No ${
                    userType === 'Python' ? 'PFS' : 'JFS'
                  } attendance records found for ${COLLEGE_CODE}.`}
            </p>
          ) : (
            Object.keys(courseWiseData)
              .filter(
                course =>
                  selectedCourse === 'AllCourses' || course === selectedCourse
              )
              .map(course => {
                const { studentMap, uniqueDates, datesWithRemarks } =
                  courseWiseData[course];
                const allStudents = Object.values(studentMap).sort((a, b) =>
                  a.name.localeCompare(b.name)
                );
                const displayedStudents = allStudents.filter(stu => {
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                      stu.studentId.toLowerCase().includes(q) ||
                      stu.name.toLowerCase().includes(q)
                    );
                  }
                  return true;
                });

                return (
                  <div key={course} className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        {course} Attendance
                      </h2>
                      <button
                        className="bg-green-600 text-white py-1 px-3 md:py-2 md:px-4 rounded text-xs md:text-sm hover:bg-green-700"
                        onClick={() => handleExportToExcel(course)}
                      >
                        Export to Excel
                      </button>
                    </div>

                    {displayedStudents.length === 0 ? (
                      <p className="text-gray-500 font-semibold">
                        No students found for {course}.
                      </p>
                    ) : (
                      <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
                        <table className="border-collapse min-w-full text-xs md:text-sm">
                          <thead>
                            <tr className="bg-blue-500 text-white">
                              <th
                                className="p-1 md:p-2 border sticky left-0 bg-blue-500 z-10 table-cell md:sticky"
                                rowSpan={2}
                                style={{ minWidth: '40px', left: '0' }}
                              >
                                S.no
                              </th>
                              <th
                                className={`p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-blue-500 z-10 ${
                                  showDetails
                                    ? 'table-cell md:sticky'
                                    : 'hidden md:table-cell'
                                }`}
                                rowSpan={2}
                                style={{
                                  minWidth: '70px',
                                  left: showDetails ? '40px' : '-100%',
                                }}
                              >
                                Student ID
                              </th>
                              <th
                                className={`p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-blue-500 z-10 ${
                                  showDetails
                                    ? 'table-cell md:sticky'
                                    : 'hidden md:table-cell'
                                }`}
                                rowSpan={2}
                                style={{
                                  minWidth: '120px',
                                  left: showDetails ? '110px' : '-100%',
                                }}
                              >
                                Name
                              </th>
                              {uniqueDates.map(dt => (
                                <th
                                  key={dt}
                                  colSpan={datesWithRemarks.has(dt) ? 2 : 1}
                                  className="p-1 md:p-2 border text-center"
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
                                className="p-1 md:p-2 border text-center"
                                rowSpan={2}
                                style={{ minWidth: '80px' }}
                              >
                                Total Present
                              </th>
                              <th
                                className="p-1 md:p-2 border text-center"
                                rowSpan={2}
                                style={{ minWidth: '80px' }}
                              >
                                Total Absent
                              </th>
                              <th
                                className="p-1 md:p-2 border text-center"
                                rowSpan={2}
                                style={{ minWidth: '70px' }}
                              >
                                Total Days
                              </th>
                            </tr>
                            <tr className="bg-blue-400 text-white">
                              {uniqueDates.map(dt => (
                                <React.Fragment key={dt}>
                                  <th
                                    className="p-1 md:p-2 border text-center"
                                    style={{ minWidth: '60px' }}
                                  >
                                    Status
                                  </th>
                                  {datesWithRemarks.has(dt) && (
                                    <th
                                      className="p-1 md:p-2 border text-center"
                                      style={{ minWidth: '60px' }}
                                    >
                                      Remarks
                                    </th>
                                  )}
                                </React.Fragment>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {displayedStudents.map((stu, index) => {
                              const { presentCount, absentCount, dayCount } =
                                getTotals(stu, uniqueDates);

                              return (
                                <tr
                                  key={stu.studentId}
                                  className="hover:bg-blue-50"
                                >
                                  <td
                                    className="p-1 md:p-2 border text-center font-semibold sticky left-0 bg-gray-100 z-10 table-cell md:sticky"
                                    style={{ minWidth: '40px', left: '0' }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td
                                    className={`p-1 md:p-2 border sticky left-[40px] md:left-[50px] bg-gray-100 z-10 ${
                                      showDetails
                                        ? 'table-cell md:sticky'
                                        : 'hidden md:table-cell'
                                    }`}
                                    style={{
                                      minWidth: '70px',
                                      left: showDetails ? '40px' : '-100%',
                                    }}
                                  >
                                    {stu.studentId}
                                  </td>
                                  <td
                                    className={`p-1 md:p-2 border sticky left-[110px] md:left-[120px] bg-gray-100 z-10 ${
                                      showDetails
                                        ? 'table-cell md:sticky'
                                        : 'hidden md:table-cell'
                                    }`}
                                    style={{
                                      minWidth: '120px',
                                      left: showDetails ? '110px' : '-100%',
                                    }}
                                  >
                                    {stu.name}
                                  </td>
                                  {uniqueDates.map(dt => {
                                    if (isSunday(dt)) {
                                      return (
                                        <React.Fragment key={dt}>
                                          <td className="p-1 md:p-2 border text-center font-semibold">
                                            -
                                          </td>
                                          {datesWithRemarks.has(dt) && (
                                            <td className="p-1 md:p-2 border text-center">
                                              -
                                            </td>
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
                                          className={`p-1 md:p-2 border text-center font-semibold ${
                                            isAbsent
                                              ? 'text-red-600'
                                              : 'text-green-600'
                                          }`}
                                        >
                                          {status}
                                        </td>
                                        {datesWithRemarks.has(dt) && (
                                          <td className="p-1 md:p-2 border text-center">
                                            {remarks}
                                          </td>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                  <td className="p-1 md:p-2 border text-green-700 font-semibold text-center">
                                    {presentCount}
                                  </td>
                                  <td className="p-1 md:p-2 border text-red-600 font-semibold text-center">
                                    {absentCount}
                                  </td>
                                  <td className="p-1 md:p-2 border text-purple-700 font-semibold text-center">
                                    {dayCount}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="md:hidden mt-2 text-center">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={() => setShowDetails(!showDetails)}
                          >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </>
      )}
    </div>
  );
};

export default SubjectAdminAttendance;
