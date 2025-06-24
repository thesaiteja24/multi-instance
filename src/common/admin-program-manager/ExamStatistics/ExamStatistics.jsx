import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ExamStatisticsCalendar from './ExamStatisticsCalendar';
import { Link } from 'react-router-dom';
import {
  ADMIN,
  COLLEGE_CODE,
  SUPER_ADMIN,
} from '../../../constants/AppConstants';
import { useSelector, useDispatch } from 'react-redux';
import {
  getExamReport,
  setBatchFilter,
  setLocationFilter,
  setSelectedDate,
} from '../../../reducers/examReportSlice.js';

const ProgressCard = ({
  title,
  gradient,
  percentage,
  allocated,
  attempted,
  notAttempted,
}) => {
  const getProgressColor = percentage => {
    if (percentage > 75) return '#22c55e'; // Green
    if (percentage >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const progressColor = getProgressColor(percentage);
  const allocatedPercentage = allocated.total
    ? (allocated.current / allocated.total) * 100
    : 0;
  const attemptedPercentage = attempted.total
    ? (attempted.current / attempted.total) * 100
    : 0;
  const notAttemptedPercentage = notAttempted.total
    ? (notAttempted.current / notAttempted.total) * 100
    : 0;

  return (
    <div
      className="rounded-[20px]"
      style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
    >
      <div className={`border rounded-t-[20px] ${gradient}`}>
        <h2 className="font-[Inter] font-medium text-[16px] text-white text-center p-3">
          {title}
        </h2>
      </div>
      <div className="border bg-[#FFFFFF] p-3 sm:p-4 md:p-6 h-auto min-h-[280px] rounded-b-[20px] sm:min-h-[200px] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-6 h-full">
          {/* Circular Progress */}
          <div className="flex items-center justify-center h-full">
            <div className="relative w-[120px] sm:w-[140px] md:w-[120px] lg:w-[140px]">
              <CircularProgressbar
                value={percentage}
                strokeWidth={4}
                circleRatio={0.7}
                styles={buildStyles({
                  rotation: 0.65,
                  strokeLinecap: 'round',
                  pathColor: progressColor,
                  trailColor: '#e5e7eb',
                  pathTransition: 'none',
                })}
                aria-label={`${title} performance progress`}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-[16px] font-[Inter] font-bold text-[#000000]">
                  {attempted.current}/{attempted.total}
                </span>
                <br />
                <span className="text-[13px] inline-block text-nowrap font-[Inter] font-medium text-[#000000]">
                  Total Allocation
                </span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bars */}
          <div className="flex items-center justify-center h-[110px]">
            <div className="space-y-3 sm:space-y-4 w-full">
              {/* Allocated */}
              <div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-[Inter] font-medium text-[#000000]">
                    Allocated
                  </span>
                  <span className="font-[Inter]">{allocated.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-[5px] overflow-hidden mt-1">
                  <div
                    className="h-[5px]"
                    style={{
                      width: `${allocatedPercentage}%`,
                      backgroundColor: getProgressColor(allocatedPercentage),
                    }}
                  />
                </div>
              </div>

              {/* Attempted */}
              <div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-[Inter] font-medium text-[#000000]">
                    Attempted
                  </span>
                  <span className="font-[Inter]">
                    {attempted.current}/{attempted.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-[5px] overflow-hidden mt-1">
                  <div
                    className="h-[5px]"
                    style={{
                      width: `${attemptedPercentage}%`,
                      backgroundColor: getProgressColor(attemptedPercentage),
                    }}
                  />
                </div>
              </div>

              {/* Not Attempted */}
              <div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-[Inter] font-medium text-[#000000]">
                    Not-Attempted
                  </span>
                  <span className="font-[Inter]">
                    {notAttempted.current}/{notAttempted.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-[5px] overflow-hidden mt-1">
                  <div
                    className="h-[5px]"
                    style={{
                      width: `${notAttemptedPercentage}%`,
                      backgroundColor: getProgressColor(notAttemptedPercentage),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamStatistics = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const {
    examReport,
    examReportLoading,
    examReportError,
    noData,
    batchFilter,
    locationFilter,
    selectedDate,
    reportDate,
  } = useSelector(state => state.examReport);
  const { userType, location } = userInfo;
  const Location = location;

  const [allBatches, setAllBatches] = useState([]);

  // Load data if needed on mount or when selectedDate/Location changes
  useEffect(() => {
    if (
      !examReportLoading &&
      (!reportDate ||
        reportDate !== selectedDate ||
        (!examReportError && !examReport?.location_stats))
    ) {
      dispatch(getExamReport({ date: selectedDate, location: Location }));
    }
  }, [
    dispatch,
    selectedDate,
    Location,
    reportDate,
    examReportLoading,
    examReportError,
    examReport?.location_stats,
  ]);

  // Update allBatches when examReport changes
  useEffect(() => {
    if (examReport && !noData) {
      setAllBatches(examReport.batches);
    } else {
      setAllBatches([]);
    }
  }, [examReport, noData]);

  // Handle date selection
  const handleDayClick = date => {
    dispatch(setSelectedDate(date));
    dispatch(getExamReport({ date, location: Location }));
  };

  const handleBatchFilter = value => {
    dispatch(setBatchFilter(value));
  };

  const handleLocationFilter = value => {
    dispatch(setLocationFilter(value));
  };

  if (examReportLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[var(--color-secondary)]"></div>
      </div>
    );
  }

  if (examReportError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: {examReportError}</p>
      </div>
    );
  }

  if (
    noData ||
    !examReport ||
    Object.keys(examReport.location_stats).length === 0
  ) {
    return (
      <div className="w-full p-6 sm:p-4 md:p-6 lg:p-8 font-[Inter]">
        <h2 className="font-[Inter] font-semibold p-4 text-2xl sm:text-3xl">
          Exam Reports Dashboard
        </h2>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Data Found
          </h2>
          <p className="text-gray-600">
            No exam statistics available for the selected date
            {Location !== 'all' ? ` in ${Location}` : ''}.
          </p>
        </div>
        <ExamStatisticsCalendar
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </div>
    );
  }

  // Filter batches based on batchFilter, locationFilter, and Location
  let filteredBatches = examReport.batches;
  if (batchFilter) {
    filteredBatches = filteredBatches.filter(
      batch => batch.batch === batchFilter
    );
  }
  if (locationFilter) {
    filteredBatches = filteredBatches.filter(
      batch => batch.location === locationFilter
    );
  }
  // Filter by user's Location if not 'all'
  if (Location !== 'all') {
    filteredBatches = filteredBatches.filter(
      batch => batch.location === Location
    );
  }

  // Compute aggregated stats for filtered batches
  const total_allocated_students = filteredBatches.reduce(
    (sum, batch) => sum + batch.allocated,
    0
  );
  const total_attempted_students = filteredBatches.reduce(
    (sum, batch) => sum + batch.attempted,
    0
  );
  const total_not_attempted = filteredBatches.reduce(
    (sum, batch) => sum + batch.non_attempted,
    0
  );
  const total_batches = filteredBatches.length;

  const filteredData = {
    total_allocated_students,
    total_attempted_students,
    total_not_attempted,
    total_batches,
    location_stats: examReport.location_stats,
    batches: filteredBatches,
  };

  const animatedPercentage =
    Math.min(
      (filteredData.total_attempted_students /
        filteredData.total_allocated_students) *
        100,
      100
    ) || 0;

  // Create cardData for ProgressCard
  const cardData = [
    ...(Location === 'all'
      ? [
          {
            title: 'Overall Performance',
            gradient: 'bg-[linear-gradient(270deg,_#ED1334_0%,_#00007F_100%)]',
            percentage: animatedPercentage,
            allocated: {
              current: filteredData.total_allocated_students || 0,
              total: filteredData.total_allocated_students || 1,
            },
            attempted: {
              current: filteredData.total_attempted_students || 0,
              total: filteredData.total_allocated_students || 1,
            },
            notAttempted: {
              current: filteredData.total_not_attempted || 0,
              total: filteredData.total_allocated_students || 1,
            },
          },
        ]
      : []),
    ...(Location === 'all'
      ? [COLLEGE_CODE].map(loc => {
          const stats = filteredData.location_stats[loc] || {
            allocated: 0,
            attempted: 0,
            non_attempted: 0,
          };
          const locAnimatedPercentage = stats.allocated
            ? Math.min((stats.attempted / stats.allocated) * 100, 100)
            : 0;
          return {
            title: loc.charAt(0).toUpperCase() + loc.slice(1),
            gradient: 'bg-[var(--color-secondary)]',
            percentage: locAnimatedPercentage,
            allocated: {
              current: stats.allocated || 0,
              total: stats.allocated || 1,
            },
            attempted: {
              current: stats.attempted || 0,
              total: stats.allocated || 1,
            },
            notAttempted: {
              current: stats.non_attempted || 0,
              total: stats.allocated || 1,
            },
          };
        })
      : [
          {
            title: Location.charAt(0).toUpperCase() + Location.slice(1),
            gradient: 'bg-[var(--color-secondary)]',
            percentage: filteredData.location_stats[Location]?.allocated
              ? Math.min(
                  (filteredData.location_stats[Location].attempted /
                    filteredData.location_stats[Location].allocated) *
                    100,
                  100
                )
              : 0,
            allocated: {
              current: filteredData.location_stats[Location]?.allocated || 0,
              total: filteredData.location_stats[Location]?.allocated || 1,
            },
            attempted: {
              current: filteredData.location_stats[Location]?.attempted || 0,
              total: filteredData.location_stats[Location]?.allocated || 1,
            },
            notAttempted: {
              current:
                filteredData.location_stats[Location]?.non_attempted || 0,
              total: filteredData.location_stats[Location]?.allocated || 1,
            },
          },
        ]),
  ].filter(card => card.allocated.total > 0);

  return (
    <div className="w-full p-6 sm:p-4 md:p-6 lg:p-8 font-[Inter]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
        <h2 className="font-[Inter] font-semibold text-2xl sm:text-3xl">
          Exam Reports Dashboard
        </h2>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#22c55e] rounded-sm" />
            <span className="text-xs text-[#434343]">Above 75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#f97316] rounded-sm" />
            <span className="text-xs text-[#434343]">50% - 75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ef4444] rounded-sm" />
            <span className="text-xs text-[#434343]">Below 50%</span>
          </div>
        </div>
      </div>

      {/* Exam Reports Cards */}
      <div className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
        {cardData.length > 0 ? (
          cardData.map((card, index) => (
            <ProgressCard
              key={index}
              title={card.title}
              gradient={card.gradient}
              percentage={card.percentage}
              allocated={card.allocated}
              attempted={card.attempted}
              notAttempted={card.notAttempted}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600">
            No valid performance data available.
          </div>
        )}
      </div>

      {/* Calendar */}
      <ExamStatisticsCalendar
        onDayClick={handleDayClick}
        selectedDate={selectedDate}
      />

      {/* Batch Details */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-[Inter] font-semibold text-2xl sm:text-3xl">
            Batch Details
          </span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <select
              name="batch"
              className="border shadow-md px-3 py-2 text-sm sm:text-base w-full sm:w-40 rounded-md"
              value={batchFilter}
              onChange={e => handleBatchFilter(e.target.value)}
            >
              <option value="">All Batches</option>
              {[
                ...new Set(
                  (Location === 'all'
                    ? allBatches
                    : allBatches.filter(batch => batch.location === Location)
                  ).map(item => item.batch)
                ),
              ].map(batch => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            {Location === 'all' ? (
              <select
                name="location"
                className="border shadow-md px-3 py-2 text-sm sm:text-base w-full sm:w-40 rounded-md"
                value={locationFilter}
                onChange={e => handleLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value={COLLEGE_CODE}>{COLLEGE_CODE}</option>
              </select>
            ) : (
              <span className="border shadow-md px-3 py-2 text-sm sm:text-base w-full sm:w-40 rounded-md bg-gray-100 text-gray-700">
                {Location.charAt(0).toUpperCase() + Location.slice(1)}
              </span>
            )}
          </div>
        </div>
        <div className="border-t border-gray-300 mt-4 mb-6"></div>

        {/* Table for Larger Screens */}
        <div className="hidden sm:block max-h-[400px] overflow-y-auto">
          <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
            <thead className="sticky top-0 bg-[var(--color-secondary)] text-white">
              <tr>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  S No.
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Batch
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Allocated
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Attempted
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Not Attempted
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Last Exam End Date
                </th>
                {Location === 'all' && (
                  <th className="py-3 px-4 text-left text-sm sm:text-base">
                    Location
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length > 0 ? (
                filteredBatches.map((item, index) => (
                  <tr
                    key={index}
                    className="border even:bg-gray-50 odd:bg-white"
                  >
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {item.batch}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {item.allocated}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {item.attempted}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {item.non_attempted}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base">
                      {item.last_exam_end_time}
                    </td>
                    {Location === 'all' && (
                      <td className="py-3 px-4 text-sm sm:text-base capitalize">
                        {item.location}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={Location === 'all' ? 7 : 6}
                    className="py-3 px-4 text-center text-gray-600"
                  >
                    No batches found for{' '}
                    {Location !== 'all' ? Location : 'selected filters'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Layout for Mobile */}
        <div className="sm:hidden max-h-[400px] overflow-y-auto space-y-4">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-white shadow-md"
              >
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">S No.:</span>
                  <span>{index + 1}</span>
                  <span className="font-medium">Batch:</span>
                  <span>{item.batch}</span>

                  <span className="font-medium">Allocated:</span>
                  <span>{item.allocated}</span>
                  <span className="font-medium">Attempted:</span>
                  <span>{item.attempted}</span>
                  <span className="font-medium">Not Attempted:</span>
                  <span>{item.non_attempted}</span>
                  <span className="font-medium">Exam End:</span>
                  <span>{item.last_exam_end_time}</span>
                  {Location === 'all' && (
                    <>
                      <span className="font-medium">Location:</span>
                      <span className="capitalize">{item.location}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="border rounded-lg p-4 bg-white shadow-md text-center text-gray-600">
              No batches found for{' '}
              {Location !== 'all' ? Location : 'selected filters'}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamStatistics;
