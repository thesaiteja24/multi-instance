import React, { useMemo, useState, useCallback } from 'react';
import './ExamsDetailsManager.css'; // Your custom scrollbar CSS

import { IoIosArrowDown } from 'react-icons/io';

// Reusable StatCard component
const StatCard = ({ label, value, color }) => (
  <div
    className="rounded-[10px] shadow-md bg-white border"
    style={{ borderColor: color }}
  >
    <div
      className="rounded-t-[10px] h-[54px] flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <p className="text-white text-[20px] font-semibold">{label}</p>
    </div>
    <div className="flex justify-center items-center h-[100px]">
      <p className="text-[36px] font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  </div>
);

// Reusable CalendarDay component
const CalendarDay = ({
  dayNumber,
  isAttempted,
  isUnattempted,
  dayOfWeekName,
}) => {
  let bgColor = 'bg-[#E1EFFF]';
  let textColor = 'text-gray-600';
  if (isAttempted) {
    bgColor = 'bg-[#129E00]';
    textColor = 'text-white';
  } else if (isUnattempted) {
    bgColor = 'bg-[#FF6000]';
    textColor = 'text-white';
  }

  return (
    <div
      className={`rounded-[8px] flex flex-col items-center justify-center aspect-square ${bgColor}`}
      role="gridcell"
      aria-label={`Day ${dayNumber}, ${isAttempted ? 'Attempted' : isUnattempted ? 'Unattempted' : 'No status'}`}
    >
      <span className={`text-[12px] leading-none ${textColor}`}>
        {dayOfWeekName}
      </span>
      <span className={`text-[18px] font-medium ${textColor}`}>
        {dayNumber}
      </span>
    </div>
  );
};

const ExamsDetailsManager = ({ data }) => {
  // =================== 0) Initial Validation ===================
  if (
    !data ||
    !data.reports ||
    !Array.isArray(data.reports) ||
    data.reports.length === 0
  ) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <img
          src="https://img.freepik.com/free-vector/appointment-booking-with-calendar_23-2148553008.jpg?semt=ais_hybrid.png"
          alt="No Student"
          className="w-28 h-28 mb-4 opacity-80"
        />
        <p className="text-xl font-semibold text-gray-600 mb-1">
          No Exam Details Available
        </p>
        <p className="text-gray-500 text-sm">
          Search for a student to see their details here.
        </p>
      </div>
    );
  }

  // =================== 1) Sort exams descending by exam number ===================
  const allExams = useMemo(() => {
    return [...data.reports].sort((a, b) => {
      const numA = parseInt(a.examDetails.examName.match(/\d+/)[0], 10) || 0;
      const numB = parseInt(b.examDetails.examName.match(/\d+/)[0], 10) || 0;
      return numB - numA; // Most recent first
    });
  }, [data.reports]);

  // =================== 2) STAT CARDS ===================
  const totalExams = allExams.length;
  const attemptCount = allExams.filter(exam => {
    // An exam is attempted if at least one subject has non-zero marks
    return Object.values(exam.subjects).some(
      details =>
        (details.max_mcq_marks || 0) > 0 ||
        (details.obtained_mcq_marks || 0) > 0 ||
        (details.max_code_marks || 0) > 0 ||
        (details.obtained_code_marks || 0) > 0
    );
  }).length;
  const unattemptedCount = totalExams - attemptCount;

  const statCards = [
    { label: 'Total Exams', value: totalExams, color: '#19216F' },
    { label: 'Attempt', value: attemptCount, color: '#129E00' },
    { label: 'Unattempted', value: unattemptedCount, color: '#FF6000' },
  ];

  // =================== 3) FILTER STATES ===================
  const [selectedSubject, setSelectedSubject] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Collect unique subjects
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set();
    allExams.forEach(exam => {
      Object.keys(exam.subjects).forEach(subject => subjects.add(subject));
    });
    return Array.from(subjects);
  }, [allExams]);

  // =================== 4) CALENDAR NAVIGATION ===================
  const [calendarDate, setCalendarDate] = useState(() => {
    const initialDate = singleDate ? new Date(singleDate) : new Date();
    return Number.isNaN(initialDate.getTime()) ? new Date() : initialDate;
  });

  const handlePrevMonth = useCallback(() => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const displayedMonth = calendarDate.getMonth();
  const displayedYear = calendarDate.getFullYear();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const monthYearHeader = calendarDate.toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  });

  const attemptedDays = new Set();
  const unattemptedDays = new Set();

  allExams.forEach(exam => {
    if (!exam.examDetails.startDate) return;
    const dt = new Date(exam.examDetails.startDate);
    if (Number.isNaN(dt.getTime())) return;

    if (
      dt.getMonth() === displayedMonth &&
      dt.getFullYear() === displayedYear
    ) {
      const day = dt.getDate();
      const isAttempted = Object.values(exam.subjects).some(
        details =>
          (details.max_mcq_marks || 0) > 0 ||
          (details.obtained_mcq_marks || 0) > 0 ||
          (details.max_code_marks || 0) > 0 ||
          (details.obtained_code_marks || 0) > 0
      );
      if (isAttempted) {
        attemptedDays.add(day);
      } else if (!attemptedDays.has(day)) {
        unattemptedDays.add(day);
      }
    }
  });

  // =================== 5) FILTER LOGIC ===================
  const isWithinRange = useCallback((dateString, minString, maxString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return false;
    const min = minString ? new Date(minString) : null;
    const max = maxString ? new Date(maxString) : null;
    return (!min || d >= min) && (!max || d <= max);
  }, []);

  const filteredExams = useMemo(() => {
    return allExams.filter(exam => {
      const subjectMatch =
        !selectedSubject ||
        Object.keys(exam.subjects).length === 0 ||
        Object.keys(exam.subjects).includes(selectedSubject);
      const inRange = isWithinRange(
        exam.examDetails.startDate,
        fromDate,
        toDate
      );
      return subjectMatch && (!fromDate || !toDate || inRange);
    });
  }, [allExams, selectedSubject, fromDate, toDate, isWithinRange]);

  // =================== 6) TABLE ROWS ===================
  const tableRows = useMemo(() => {
    return filteredExams.map((exam, index) => {
      const allSubs = Object.keys(exam.subjects).join(', ') || 'N/A';
      const marks =
        Object.entries(exam.subjects)
          .map(([subject, details]) => {
            const mcqScore = details.obtained_mcq_marks || 0;
            const mcqTotal = details.max_mcq_marks || 0;
            const codeScore = details.obtained_code_marks || 0;
            const codeTotal = details.max_code_marks || 0;
            const totalScore = mcqScore + codeScore;
            const totalMax = mcqTotal + codeTotal;
            return totalMax === 0 && totalScore === 0
              ? `${subject}: N/A`
              : `${subject}: ${totalScore}/${totalMax}`;
          })
          .join(', ') || 'N/A';

      return {
        sno: index + 1,
        date: exam.examDetails.startDate || 'N/A',
        subject: allSubs,
        examName: exam.examDetails.examName || 'N/A',
        marks,
      };
    });
  }, [filteredExams]);

  // =================== 7) DOWNLOAD HANDLER ===================
  const handleDownload = useCallback(() => {
    const header = '"S.No","Date","Subject","Exam Name","Marks"\n';
    const rows = tableRows.map(row => {
      const sanitize = value =>
        typeof value === 'string'
          ? `"${value.replace(/"/g, '""').replace(/^([=+@-])/g, "'$1")}"`
          : value;
      const columns = [
        row.sno,
        sanitize(row.date),
        sanitize(row.subject),
        sanitize(row.examName),
        sanitize(row.marks),
      ];
      return columns.join(',');
    });
    const csvContent = header + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exams_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [tableRows]);

  // =================== 8) RESET FILTERS ===================
  const handleResetFilters = useCallback(() => {
    setSelectedSubject('');
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setCalendarDate(new Date());
  }, []);

  // =================== RENDER ===================
  return (
    <>
      <div className="w-full flex justify-center items-center p-4 md:p-6 lg:p-10 font-[inter]">
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-full">
          <div className="flex-1 bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg px-4 sm:px-6 md:px-8 py-6">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="w-full md:w-1/2">
                <h3 className="text-[var(--color-primary)] font-semibold text-[18px] mb-2">
                  Select a Subject
                </h3>
                <div className="relative w-full h-[46px] bg-white shadow-md rounded flex items-center ">
                  <select
                    className="w-full bg-transparent appearance-none text-black text-[16px] outline-none cursor-pointer p-4"
                    onChange={e => setSelectedSubject(e.target.value)}
                    value={selectedSubject}
                    aria-label="Select a subject"
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <IoIosArrowDown className="absolute right-4 z-50 text-black text-lg pointer-events-none" />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-[var(--color-primary)] font-semibold text-[18px] mb-2">
                  Select a Date
                </h3>
                <div className="relative w-full h-[46px] bg-white shadow-md rounded flex items-center px-4">
                  <input
                    type="date"
                    className="w-full bg-transparent text-[var(--color-primary)] text-[16px] outline-none cursor-pointer"
                    value={singleDate}
                    onChange={e => {
                      setSingleDate(e.target.value);
                      if (e.target.value)
                        setCalendarDate(new Date(e.target.value));
                    }}
                    aria-label="Select a date for calendar"
                  />
                  <div className="absolute right-4 text-[var(--color-primary)] pointer-events-none">
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
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full border-t border-[#303C60] mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-[456px] h-auto bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-4 md:p-6">
            <div className="w-full flex justify-between items-center mb-4">
              <button
                onClick={handlePrevMonth}
                className="text-[var(--color-primary)] hover:text-[#10164b]"
                aria-label="Previous month"
              >
                ←
              </button>
              <h3 className="text-lg font-bold text-gray-700">
                {monthYearHeader}
              </h3>
              <button
                onClick={handleNextMonth}
                className="text-[var(--color-primary)] hover:text-[#10164b]"
                aria-label="Next month"
              >
                →
              </button>
            </div>
            <div
              className="grid grid-cols-7 gap-[10px]"
              role="grid"
              aria-label="Calendar"
            >
              {[...Array(daysInMonth)].map((_, i) => {
                const dayNumber = i + 1;
                const dateObj = new Date(
                  displayedYear,
                  displayedMonth,
                  dayNumber
                );
                const dayOfWeekName = dateObj.toLocaleDateString('en', {
                  weekday: 'short',
                });
                return (
                  <CalendarDay
                    key={dayNumber}
                    dayNumber={dayNumber}
                    isAttempted={attemptedDays.has(dayNumber)}
                    isUnattempted={unattemptedDays.has(dayNumber)}
                    dayOfWeekName={dayOfWeekName}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-10">
        <div className="w-[1373px] border-t border-black"></div>
      </div>
      <div className="w-full flex flex-col items-center font-[inter] py-10 px-4 md:px-8 lg:px-16">
        <div className="flex flex-col md:flex-row  gap-6 mb-10 w-full max-w-[1373px] items-center">
          <div>
            <h3 className="text-[var(--color-primary)] font-semibold text-[24px] mb-2">
              From Date
            </h3>
            <div className="w-[263px] h-[46px]  bg-white shadow-lg rounded-md  flex items-center">
              <input
                type="date"
                className="w-full text-[var(--color-primary)] p-4  text-[16px] outline-none bg-transparent cursor-pointer"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                aria-label="Select start date"
              />
            </div>
          </div>
          <div>
            <h3 className="text-[var(--color-primary)] font-semibold text-[24px] mb-2">
              To Date
            </h3>
            <div className="w-[263px] h-[46px] bg-white shadow-lg rounded-md px-4 flex items-center">
              <input
                type="date"
                className="w-full text-[var(--color-primary)] text-[16px] outline-none bg-transparent cursor-pointer"
                value={toDate}
                onChange={e => {
                  const newToDate = e.target.value;
                  if (
                    fromDate &&
                    newToDate &&
                    new Date(newToDate) < new Date(fromDate)
                  ) {
                    alert('To Date cannot be before From Date');
                    return;
                  }
                  setToDate(newToDate);
                }}
                aria-label="Select end date"
              />
            </div>
          </div>
          <div className="ml-auto mt-6 md:mt-10 flex gap-4">
            <button
              className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-md shadow-md hover:bg-[#10164b] transition-all"
              onClick={handleDownload}
              aria-label="Download exam data as CSV"
            >
              Download
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition-all"
              onClick={handleResetFilters}
              aria-label="Reset all filters"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="w-full max-w-[1373px] bg-white shadow-[0px_4px_20px_#B3BAF7]">
          <div
            className="w-full bg-[var(--color-primary)] text-white flex justify-between items-center px-4 h-[53px] text-[16px] font-semibold"
            role="row"
          >
            <div className="w-[50px]" role="columnheader">
              S.No
            </div>
            <div className="w-[120px]" role="columnheader">
              Date
            </div>
            <div className="w-[180px]" role="columnheader">
              Subject
            </div>
            <div className="w-[200px]" role="columnheader">
              Exam Name
            </div>
            <div className="w-[300px]" role="columnheader">
              Marks
            </div>
          </div>
          <div
            className="max-h-[515px] overflow-y-auto custom-scrollbar"
            role="rowgroup"
          >
            {tableRows.length === 0 ? (
              <div className="w-full h-[53px] flex justify-center items-center bg-white text-gray-500">
                No exams match the selected filters.
              </div>
            ) : (
              tableRows.map((row, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`w-full px-4 h-[53px] flex justify-between items-center ${
                      isEven ? 'bg-[#EFF0F7]' : 'bg-white'
                    } text-[#000000] text-[16px] font-semibold`}
                    role="row"
                  >
                    <div className="w-[50px]" role="cell">
                      {row.sno}
                    </div>
                    <div className="w-[120px]" role="cell">
                      {row.date}
                    </div>
                    <div className="w-[180px]" role="cell">
                      {row.subject}
                    </div>
                    <div className="w-[200px]" role="cell">
                      {row.examName}
                    </div>
                    <div className="w-[300px]" role="cell">
                      {row.marks}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamsDetailsManager;
