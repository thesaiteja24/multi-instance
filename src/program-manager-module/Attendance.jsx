import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../reducers/batchesSlice.js';
import Select from 'react-select';
import { COLLEGE_CODE, COLLEGE_SUBJECTS } from '../constants/AppConstants.js';

const subjects = COLLEGE_SUBJECTS.map(subject => ({
  value: subject,
  label: subject,
}));

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
  if (!isoDate) return '';
  const [yyyy, mm, dd] = isoDate.split('-');
  if (!yyyy || !mm || !dd) return '';
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
}

function isSunday(isoDate) {
  if (!isoDate) return false;
  const [yyyy, mm, dd] = isoDate.split('-');
  if (!yyyy || !mm || !dd) return false;
  const dateObj = new Date(+yyyy, +mm - 1, +dd);
  return dateObj.getDay() === 0;
}

const techStackSubjects = {
  DIET: [COLLEGE_CODE],
};

const Attendance = () => {
  const dispatch = useDispatch();
  const {
    batchesList = [],
    batchesListLoading = false,
    batchesListError = null,
  } = useSelector(state => state.batches || {});
  const { userInfo } = useSelector(state => state.auth);
  const { location, userType } = userInfo || {};
  const [selectedLocation, setSelectedLocation] = useState('SelectLocation');
  const [selectedTechStack, setSelectedTechStack] = useState('SelectTechStack');
  const [availableTechStacks, setAvailableTechStacks] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('SelectBatch');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminOrSuper, setIsAdminOrSuper] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [subjectWiseData, setSubjectWiseData] = useState({});

  useEffect(() => {
    if (batchesList.length === 0 && location) {
      dispatch(getBatches(location));
    }
  }, [location, dispatch, batchesList.length]);

  useEffect(() => {
    const isAdmin = userType === 'superAdmin' || userType === 'super';
    const isAllLocation = location === 'all';

    if (isAdmin || isAllLocation) {
      setIsAdminOrSuper(true);
      setSelectedLocation('SelectLocation');
    } else if (location && techStackSubjects[location]) {
      setSelectedLocation(location);
    }
  }, [location, userType]);

  useEffect(() => {
    const normalizedLocation = selectedLocation;
    if (
      normalizedLocation !== 'selectlocation' &&
      techStackSubjects[normalizedLocation]
    ) {
      setAvailableTechStacks(techStackSubjects[normalizedLocation]);
    } else {
      setAvailableTechStacks([]);
      setFilteredBatches([]);
      setSelectedTechStack('SelectTechStack');
      setSelectedBatch('SelectBatch');
      setSelectedSubjects([]);
      setAttendanceRecords([]);
      setSubjectWiseData({});
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (
      selectedTechStack !== 'SelectTechStack' &&
      selectedLocation !== 'SelectLocation' &&
      Array.isArray(batchesList)
    ) {
      const filtered = batchesList.filter(
        b =>
          b?.Course?.trim() === selectedTechStack.trim() &&
          b?.location === selectedLocation
      );
      setFilteredBatches(filtered);
      setSelectedBatch('SelectBatch');
      setSelectedSubjects([]);
    } else {
      setFilteredBatches([]);
      setSelectedBatch('SelectBatch');
      setSelectedSubjects([]);
    }
  }, [selectedTechStack, batchesList, selectedLocation]);

  const fetchAttendanceData = useCallback(async () => {
    if (
      selectedLocation === 'SelectLocation' ||
      selectedBatch === 'SelectBatch'
    ) {
      setAttendanceRecords([]);
      setSubjectWiseData({});
      return;
    }

    setLoading(true);
    try {
      const subjectValues = selectedSubjects.map(s => s.value).join(',');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/batchwiseattends`,
        {
          params: {
            location: selectedLocation,
            batch: selectedBatch,
            subjects: subjectValues || undefined,
          },
        }
      );

      const data = response.data?.data || [];
      setAttendanceRecords(data);
      transformData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceRecords([]);
      setSubjectWiseData({});
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedBatch, selectedSubjects]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  function transformData(rawData) {
    const subjectMap = {};
    const nameByDate = {};

    // Filter records by selected subjects
    const selectedSubjectValues = selectedSubjects.map(s => s.value);
    const filteredData = selectedSubjectValues.length
      ? rawData.filter(record => selectedSubjectValues.includes(record.course))
      : rawData;

    filteredData.forEach(record => {
      const subject = record.course;
      const isoDate = convertDateYYMMDDtoYYYYMMDD(record.datetime);

      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          studentMap: {},
          uniqueDates: new Set(),
          datesWithRemarks: new Set(),
        };
      }

      subjectMap[subject].uniqueDates.add(isoDate);

      let hasRemarksOnDate = false;
      record.students.forEach(stu => {
        if (stu.remarks && stu.remarks.trim() !== '') {
          hasRemarksOnDate = true;
        }
        if (stu.name) {
          const isEmail = stu.name.includes('@');
          const currentName = nameByDate[stu.studentId]?.name || '';
          const currentIsEmail = currentName.includes('@');
          if (
            !nameByDate[stu.studentId] ||
            isoDate > nameByDate[stu.studentId].date ||
            (currentIsEmail && !isEmail)
          ) {
            nameByDate[stu.studentId] = {
              date: isoDate,
              name: stu.name.trim(),
            };
          }
        }
      });
      if (hasRemarksOnDate) {
        subjectMap[subject].datesWithRemarks.add(isoDate);
      }

      record.students.forEach(stu => {
        const studentId = stu.studentId;

        if (!subjectMap[subject].studentMap[studentId]) {
          subjectMap[subject].studentMap[studentId] = {
            studentId,
            name: nameByDate[stu.studentId]?.name,
            daily: {},
          };
        } else {
          if (
            nameByDate[stu.studentId] &&
            (isoDate >= nameByDate[stu.studentId].date ||
              (nameByDate[stu.studentId].name.includes('@') &&
                !stu.name.includes('@')))
          ) {
            subjectMap[subject].studentMap[studentId].name =
              nameByDate[stu.studentId].name;
          }
        }

        subjectMap[subject].studentMap[studentId].daily[isoDate] = {
          status: stu.status || 'absent',
          remarks: stu.remarks || '',
        };
      });
    });

    Object.keys(subjectMap).forEach(subject => {
      subjectMap[subject].uniqueDates = Array.from(
        subjectMap[subject].uniqueDates
      ).sort();
      subjectMap[subject].datesWithRemarks = new Set(
        subjectMap[subject].datesWithRemarks
      );
    });

    setSubjectWiseData(subjectMap);
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

  const generateSubjectSheetData = (subject, subjectData) => {
    const students = Object.values(subjectData.studentMap).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return students.map((stu, i) => {
      const row = {
        'S.No': i + 1,
        'Student ID': stu.studentId,
        Name: stu.name,
      };

      subjectData.uniqueDates.forEach(dt => {
        const dayName = getDayName(dt);
        if (isSunday(dt)) {
          row[`${dt} (${dayName}) - Status`] = '-';
          if (subjectData.datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = '-';
          }
        } else {
          const info = stu.daily[dt];
          let status = info?.status || 'absent';
          let remarks = info?.remarks || '';
          row[`${dt} (${dayName}) - Status`] = status;
          if (subjectData.datesWithRemarks.has(dt)) {
            row[`${dt} (${dayName}) - Remarks`] = remarks;
          }
        }
      });

      const { presentCount, absentCount, dayCount } = getTotals(
        stu,
        subjectData.uniqueDates
      );
      row['Total Present'] = presentCount;
      row['Total Absent'] = absentCount;
      row['Total Days'] = dayCount;

      return row;
    });
  };

  const handleExportToExcel = subject => {
    const subjectData = subjectWiseData[subject];
    if (!subjectData || !Object.keys(subjectData.studentMap).length) {
      alert(`No attendance data to export for ${subject}!`);
      return;
    }

    const wb = XLSX.utils.book_new();
    const rows = generateSubjectSheetData(subject, subjectData);
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `${subject}_Attendance`);
    XLSX.writeFile(wb, `${subject}_Attendance_Spreadsheet.xlsx`);
  };

  const handleExportAllToExcel = () => {
    if (!Object.keys(subjectWiseData).length) {
      alert('No attendance data to export!');
      return;
    }

    const wb = XLSX.utils.book_new();

    Object.keys(subjectWiseData).forEach(subject => {
      const subjectData = subjectWiseData[subject];
      if (Object.keys(subjectData.studentMap).length > 0) {
        const rows = generateSubjectSheetData(subject, subjectData);
        const safeSubjectName = subject
          .replace(/[:*?\/\\[\]]/g, '_')
          .substring(0, 31);
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, safeSubjectName);
      }
    });

    if (wb.SheetNames.length === 0) {
      alert('No valid attendance data to export!');
      return;
    }

    XLSX.writeFile(
      wb,
      `All_Subjects_Attendance_${selectedBatch}_${selectedLocation}.xlsx`
    );
  };

  // Handle case when batchesList is undefined or empty
  if (!batchesList || batchesListError) {
    return (
      <div className="p-4 font-[inter] w-full">
        <div className="text-center">
          <span className="text-[24px] font-medium text-[#000000]">
            Students Attendance
          </span>
        </div>
        <p className="text-center text-red-500 font-semibold mt-4">
          {batchesListError ||
            'Failed to load batches. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 font-[inter] w-full">
      <div className="text-center">
        <span className="text-[24px] font-medium text-[#000000]">
          Students Attendance
        </span>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {isAdminOrSuper && (
          <div className="relative w-full max-w-[300px]">
            <label className="block text-[16px] font-medium text-[#000000] mb-1">
              Select Location
            </label>
            <div className="relative">
              <select
                className="block appearance-none w-full p-3 text-[12px] rounded-md shadow-sm focus:outline-none focus:ring-0"
                style={{ boxShadow: '0px 4px 15px 0px #132EE026' }}
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                disabled={batchesListLoading}
              >
                <option value="SelectLocation" disabled>
                  Select Location
                </option>
                {[COLLEGE_CODE].map(loc => (
                  <option key={loc} value={loc}>
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
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
        )}

        <div className="relative w-full max-w-[300px]">
          <label className="block text-[16px] font-medium text-[#000000] mb-1">
            Student Tech Stack
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full p-3 text-[12px] rounded-md shadow-sm focus:outline-none focus:ring-0"
              style={{ boxShadow: '0px 4px 15px 0px #132EE026' }}
              value={selectedTechStack}
              onChange={e => setSelectedTechStack(e.target.value)}
              disabled={availableTechStacks.length === 0 || batchesListLoading}
            >
              <option value="SelectTechStack" disabled>
                Select Tech Stack
              </option>
              {availableTechStacks.map(ts => (
                <option key={ts} value={ts}>
                  {ts}
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

        <div className="relative w-full max-w-[300px] mb-4">
          <label className="block text-[16px] font-medium text-[#000000] mb-1">
            Select Batch
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full p-3 border text-[12px] rounded-md shadow-sm focus:outline-none focus:ring-0"
              style={{ boxShadow: '0px 4px 15px 0px #132EE026' }}
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              disabled={filteredBatches.length === 0 || batchesListLoading}
            >
              <option value="SelectBatch" disabled>
                Select Batch
              </option>
              {filteredBatches.map(b => (
                <option key={b.id || b.Batch} value={b.Batch}>
                  {b.Batch}
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

        <div className="relative w-full max-w-[300px] mb-4">
          <label className="block text-[16px] font-medium text-[#000000] mb-1">
            Select Subjects
          </label>
          <Select
            isMulti
            options={subjects}
            value={selectedSubjects}
            onChange={setSelectedSubjects}
            placeholder="Select Subjects"
            className="text-[12px]"
            classNamePrefix="select"
            isDisabled={selectedBatch === 'SelectBatch'}
            styles={{
              control: base => ({
                ...base,
                border: '1px solid #000000',
                borderRadius: '0.375rem',
                padding: '0.25rem',
                boxShadow: '0px 4px 15px 0px #132EE026',
                '&:hover': { borderColor: '#000000' },
              }),
              menu: base => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        </div>

        <div className="relative w-full max-w-[300px]">
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

      <div className="flex justify-end p-4">
        {Object.keys(subjectWiseData).length > 0 && (
          <div className="flex gap-5 justify-center items-center">
            <button
              className="flex gap-3 border p-3 rounded-[4px] bg-[var(--color-secondary)] text-[#FFFFFF] text-[16px] font-[Inter] font-medium"
              onClick={handleExportAllToExcel}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.4213 12.6142V16.4856C18.4213 16.999 18.2174 17.4913 17.8543 17.8543C17.4913 18.2174 16.999 18.4213 16.4856 18.4213H2.9357C2.42232 18.4213 1.92997 18.2174 1.56695 17.8543C1.20394 17.4913 1 16.999 1 16.4856V12.6142M4.8714 7.77495L9.71065 12.6142M9.71065 12.6142L14.5499 7.77495M9.71065 12.6142V1"
                  stroke="white"
                  strokeWidth="1.9357"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download All Subjects
            </button>
          </div>
        )}
      </div>

      {loading || batchesListLoading ? (
        <p className="text-[var(--color-secondary)] font-semibold text-center mt-4">
          Loading data...
        </p>
      ) : Object.keys(subjectWiseData).length === 0 &&
        selectedBatch !== 'SelectBatch' ? (
        <p className="text-gray-500 font-semibold text-center mt-4">
          No attendance records found for the selected batch and subjects.
        </p>
      ) : (
        Object.keys(subjectWiseData).map(subject => {
          const { studentMap, uniqueDates, datesWithRemarks } =
            subjectWiseData[subject];
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
            <div key={subject} className="px-4 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-[20px] font-medium text-[#000000]">
                    {subject} Attendance
                  </h2>
                </div>
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
                      d="M2.5 2.13C2.5 1.36 3.36 0.5 4.12 0.5H13.88C14.64 0.5 15.5 1.36 15.5 2.13V11.88C15.5 12.64 14.64 13.5 13.88 13.5H4.13C3.36 13.5 2.5 12.64 2.5 11.88M0.5 4.5L4.5 9.5M4.5 4.5L0.5 9.5"
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
                  Export the Excel
                </button>
              </div>

              {displayedStudents.length === 0 ? (
                <p className="text-gray-500 font-semibold">
                  No students found for {subject}.
                </p>
              ) : (
                <div
                  className="w-full border rounded-[20px] overflow-x-auto overflow-y-auto max-h-[500px] whitespace-nowrap"
                  style={{
                    boxShadow: '0px 4px 20px 0px #B3BAF7',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#000077 #E5E7EB',
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 8px;
                      height: 8px;
                    }
                    div::-webkit-scrollbar-track {
                      background: #000077;
                      border-radius: 4px;
                    }
                    div::-webkit-scrollbar-thumb {
                      background: #000077;
                      border-radius: 4px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: #000077;
                    }
                  `}</style>
                  <table className="min-w-full">
                    <thead className="text-[16px] font-[Inter] font-semibold text-[#FFFFFF] bg-[var(--color-secondary)]">
                      <tr>
                        <th
                          className="p-4 sticky left-0 bg-[var(--color-secondary)] z-10"
                          style={{ minWidth: '40px' }}
                          rowSpan={2}
                        >
                          S.no
                        </th>
                        <th
                          className={`p-4 sticky left-[40px] bg-[var(--color-secondary)] z-10 ${
                            showDetails ? 'table-cell' : 'hidden md:table-cell'
                          }`}
                          style={{ minWidth: '100px' }}
                          rowSpan={2}
                        >
                          Student ID
                        </th>
                        <th
                          className={`p-4 sticky left-[140px] bg-[var(--color-secondary)] z-10 ${
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
                      <tr className="bg-[var(--color-secondary)] text-[#FFFFFF]">
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
                      {displayedStudents.map((stu, index) => {
                        const { presentCount, absentCount, dayCount } =
                          getTotals(stu, uniqueDates);

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
                                    <td className="p-4 text-center">
                                      {remarks}
                                    </td>
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
                            <td className="p-4 text-center font-semibold text-[var(--color-secondary)]">
                              {dayCount}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="md:hidden mt-2 text-center">
                    <button
                      className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded hover:bg-[var(--color-secondary)]/90"
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
    </div>
  );
};

export default Attendance;
