import React, { useEffect, useMemo, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const AttendenceOverviewManager = ({ data }) => {
  // Fallback UI if data is missing or empty.
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <img
          src="https://img.freepik.com/free-vector/calendar-with-user-glyph-style_78370-7208.jpg?semt=ais_hybrid.png"
          alt="No Attendance Data"
          className="w-28 h-28 mb-4 opacity-80"
        />
        <p className="text-xl font-bold text-gray-600 mb-1">
          No Attendance Data Available
        </p>
        <p className="text-gray-500 text-sm">
          Search for a student to see their details here.
        </p>
      </div>
    );
  }

  // Memoize the unique subjects to prevent unnecessary recalculations.
  const uniqueSubjects = useMemo(() => {
    return [...new Set(data.map(item => item.course))];
  }, [data]);

  // Initialize states
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Set the default subject on mount or when data changes
  useEffect(() => {
    if (!selectedSubject && uniqueSubjects.length > 0) {
      setSelectedSubject(uniqueSubjects[0]);
    }
  }, [selectedSubject, uniqueSubjects]);

  // Filtering attendance data
  let filteredData;
  if (!selectedDate) {
    // When no date is selected, include all records for the selected subject
    filteredData = data.filter(item => item.course === selectedSubject);
  } else {
    // When a date is selected, filter by subject and by the selected month and year
    const selectedMonth = new Date(selectedDate).getMonth() + 1;
    const selectedYear = new Date(selectedDate).getFullYear();
    filteredData = data.filter(item => {
      // Assuming item.datetime is in "YYYY-MM-DD" format
      const [yearStr, monthStr] = item.datetime.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr, 10);
      return (
        item.course === selectedSubject &&
        month === selectedMonth &&
        year === selectedYear
      );
    });
  }

  // Determine calendar display month and year
  const displayDate = selectedDate ? new Date(selectedDate) : new Date();
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth() + 1; // 1-based month
  const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();
  const displayMonthName = displayDate.toLocaleString('default', {
    month: 'long',
  });

  // Calculate attendance stats and group by day for the displayed month
  const attendanceByDay = {};
  filteredData.forEach(item => {
    const [yearStr, monthStr, dayStr] = item.datetime.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    // Only include data for the displayed month
    if (year === displayYear && month === displayMonth) {
      if (!attendanceByDay[day]) attendanceByDay[day] = [];
      attendanceByDay[day].push(item.status);
    }
  });

  const totalDays = Object.keys(attendanceByDay).length;
  const presentCount = Object.values(attendanceByDay).filter(statuses =>
    statuses.includes('present')
  ).length;
  const absentCount = totalDays - presentCount;

  // Custom calendar icon
  const calendarIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <div className="w-full flex justify-center items-center p-0 md:p-6 lg:p-10 font-[inter]">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px]">
        {/* Left Section: Attendance Overview */}
        <div className="flex-1 bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg px-4 sm:px-6 md:px-8 py-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Subject Dropdown */}
            <div className="w-full md:w-1/2">
              <h3 className="text-[var(--color-primary)] font-semibold text-[18px] mb-2">
                Select a Subject
              </h3>
              <div className="relative w-full h-[46px] bg-white shadow-md rounded flex items-center">
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full bg-transparent appearance-none text-black text-[16px] outline-none cursor-pointer p-4"
                >
                  {uniqueSubjects.map((subject, i) => (
                    <option key={i} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <IoIosArrowDown className="absolute right-4 z-50 text-black text-lg pointer-events-none" />
              </div>
            </div>

            {/* Date Picker */}
            <div className="w-full md:w-1/2">
              <h3 className="text-[var(--color-primary)] font-semibold text-[18px] mb-2">
                Select a Date
              </h3>
              <div className="relative w-full h-[46px] bg-white shadow-md rounded flex items-center px-4">
                <DatePicker
                  value={selectedDate ? dayjs(selectedDate) : null}
                  onChange={date =>
                    setSelectedDate(date ? date.format('YYYY-MM-DD') : '')
                  }
                  className="w-full h-full border-none text-[var(--color-primary)] text-[16px] outline-none cursor-pointer"
                  suffixIcon={calendarIcon}
                  allowClear={true}
                  popupStyle={{ zIndex: 1050 }}
                />
              </div>
            </div>
          </div>

          <div className="w-full border-t border-[#303C60] mb-6"></div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Days', value: totalDays, color: '#19216F' },
              { label: 'Present', value: presentCount, color: '#129E00' },
              { label: 'Absent', value: absentCount, color: '#FF6000' },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-[10px] shadow-md bg-white border"
                style={{ borderColor: item.color }}
              >
                <div
                  className="rounded-t-[10px] h-[54px] flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <p className="text-white text-[20px] font-semibold">
                    {item.label}
                  </p>
                </div>
                <div className="flex justify-center items-center h-[100px]">
                  <p
                    className="text-[36px] font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Calendar */}
        <div className="w-full lg:w-[456px] h-auto bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-4 md:p-6">
          {/* Month Header */}
          <div className="text-center text-2xl font-bold text-[var(--color-primary)] mb-4">
            {displayMonthName} {displayYear}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-[10px]">
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(displayYear, displayMonth - 1, day);
              const weekday = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
              });
              const statuses = attendanceByDay[day] || [];
              const isPresent = statuses.includes('present');
              const isAbsent = statuses.includes('absent');

              let bgColor = 'bg-[#E1EFFF]';
              let textColor = 'text-gray-600';
              if (isPresent) {
                bgColor = 'bg-[#129E00]';
                textColor = 'text-white';
              } else if (isAbsent) {
                bgColor = 'bg-[#FF6000]';
                textColor = 'text-white';
              }

              return (
                <div
                  key={day}
                  className={`rounded-[8px] flex flex-col items-center justify-center aspect-square ${bgColor}`}
                >
                  <span className={`text-[18px] font-medium ${textColor}`}>
                    {day}
                  </span>
                  <span className={`text-[12px] ${textColor}`}>{weekday}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendenceOverviewManager;
