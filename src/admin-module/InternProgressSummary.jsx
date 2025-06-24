import React, { useEffect, useState, useMemo } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

// Utility to get days in a month, accounting for leap years
const getDaysInMonth = (month, year) => {
  const monthIndex = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ].indexOf(month || 'May');
  return new Date(year || 2025, monthIndex + 1, 0).getDate();
};

// Utility to get day of the week for a given date
const getDayOfWeek = (year, month, day) => {
  const monthIndex = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ].indexOf(month || 'May');
  const date = new Date(year || 2025, monthIndex, day || 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const InternProgressSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default selectedDate to current date (May 29, 2025)
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`
  );
  const [selectedMonth, setSelectedMonth] = useState(
    [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][today.getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
  const [selectedName, setSelectedName] = useState(null);
  const [selectedSno, setSelectedSno] = useState(null);
  const [years, setYears] = useState([String(today.getFullYear())]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Adjust selected day if it exceeds days in new month
  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;
    const daysInSelectedMonth = getDaysInMonth(selectedMonth, selectedYear);
    const currentDay = selectedDate
      ? parseInt(selectedDate.split('-')[2] || '1', 10)
      : 1;
    if (currentDay > daysInSelectedMonth) {
      setSelectedDate(
        `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(
          2,
          '0'
        )}-${String(daysInSelectedMonth).padStart(2, '0')}`
      );
    }
  }, [selectedMonth, selectedYear, selectedDate]);

  // Fetch data based on selected date using API
  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/intern-progress-summary`,
        {
          params: { date: selectedDate },
        }
      )
      .then(resp => {
        if (resp?.data?.success) {
          const progressData = resp.data.progress || [];
          setData(progressData);
          const uniqueYears = [
            ...new Set(
              progressData
                .map(item => item?.date?.split('-')[0])
                .filter(year => year)
            ),
          ].sort();
          setYears(uniqueYears.length > 0 ? uniqueYears : ['2025']);
          if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
            setSelectedYear(uniqueYears[0]);
            setSelectedDate(
              `${uniqueYears[0]}-${String(
                months.indexOf(selectedMonth) + 1
              ).padStart(2, '0')}-${selectedDate?.split('-')[2] || '01'}`
            );
          }
        } else {
          throw new Error('Failed to fetch progress data');
        }
      })
      .catch(err =>
        setError(err.message || 'An error occurred while fetching data')
      )
      .finally(() => setLoading(false));
  }, [selectedDate]);

  // Filter data by selected name (if any)
  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const byName = selectedName
        ? (item?.name || '').toLowerCase() === selectedName.toLowerCase()
        : true;
      return byName;
    });
  }, [data, selectedName]);

  // Get unique names with sequential S/No
  const uniqueNames = useMemo(() => {
    const nameMap = new Map();
    (data || []).forEach(item => {
      const name = item?.name || 'Unknown';
      if (!nameMap.has(name)) {
        nameMap.set(name, {
          name,
          internId: item?.internId || `unknown-${nameMap.size}`,
          text: '#000000',
          bg: nameMap.size % 2 === 0 ? '#EEEFFF' : '#FFFFFF',
        });
      }
    });
    return Array.from(nameMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item, index) => ({
        ...item,
        sno: String(index + 1).padStart(3, '0'),
      }));
  }, [data]);

  // Calculate totals with fallback for null/undefined
  const totalCreated = useMemo(() => {
    return (filteredData || []).reduce(
      (sum, item) => sum + (item?.total_created || 0),
      0
    );
  }, [filteredData]);

  const totalVerified = useMemo(() => {
    return (filteredData || []).reduce(
      (sum, item) => sum + (item?.total_verified || 0),
      0
    );
  }, [filteredData]);

  const totalDumped = useMemo(() => {
    return (filteredData || []).reduce(
      (sum, item) => sum + (item?.total_dumped || 0),
      0
    );
  }, [filteredData]);

  // Group data for bottom table
  const groupedData = useMemo(() => {
    const map = {};
    (filteredData || []).forEach(item => {
      const dayPrefix = (item?.tag?.[0] || 'unknown').split(':')[0];
      const key = `${item?.name || 'Unknown'}|${item?.subject || 'unknown'}|${
        item?.date || 'unknown'
      }|${dayPrefix}`;
      if (!map[key]) {
        const sno =
          uniqueNames.find(
            n =>
              (n?.name || '').toLowerCase() === (item?.name || '').toLowerCase()
          )?.sno || '000';
        map[key] = {
          sno,
          name: item?.name || 'Unknown',
          subject: item?.subject || 'N/A',
          tag: dayPrefix || 'N/A',
          mcq_created: 0,
          mcq_verified: 0,
          code_created: 0,
          code_verified: 0,
          total_verified: 0,
          mcq_dumped: 0,
          code_dumped: 0,
          total_dumped: 0,
          bg: Object.keys(map).length % 2 === 0 ? '#EEEFFF' : '#FFFFFF',
          text: '#000000',
        };
      }
      map[key].mcq_created += item?.mcq_created || 0;
      map[key].mcq_verified += item?.mcq_verified || 0;
      map[key].code_created += item?.code_created || 0;
      map[key].code_verified += item?.code_verified || 0;
      map[key].total_verified += item?.total_verified || 0;
      map[key].mcq_dumped += item?.mcq_dumped || 0;
      map[key].code_dumped += item?.code_dumped || 0;
      map[key].total_dumped += item?.total_dumped || 0;
    });
    return Object.values(map);
  }, [filteredData, uniqueNames]);

  const handleDateSelect = day => {
    const monthIndex = months.indexOf(selectedMonth || 'May') + 1;
    const formattedDate = `${selectedYear || '2025'}-${String(
      monthIndex
    ).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  };

  const handleNameSelect = (name, sno) => {
    setSelectedName(name || null);
    setSelectedSno(sno || null);
  };

  const handleResetFilter = () => {
    setSelectedName(null);
    setSelectedSno(null);
  };

  const daysInMonth =
    selectedYear && selectedMonth
      ? getDaysInMonth(selectedMonth, selectedYear)
      : 31;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 font-['Inter'] bg-gray-50 min-h-screen">
      <div className="w-full mx-auto flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-black font-semibold text-base sm:text-lg md:text-xl">
            Intern Progress Summary
          </h2>
          {selectedName && (
            <button
              onClick={handleResetFilter}
              className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm transition-colors"
            >
              Reset Name Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-[30%_68.5%] gap-6">
          {/* Calendar Section */}
          <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6 md:p-8 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4 lg:mb-6">
              <div className="relative w-32 sm:w-40">
                <select
                  value={selectedMonth || 'May'}
                  onChange={e => setSelectedMonth(e.target.value || 'May')}
                  className="w-full h-10 bg-white border-2 border-gray-300 rounded-xl px-3 text-lg sm:text-xl text-gray-500 font-normal appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all hover:border-gray-400"
                >
                  {months.map(month => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 border-b-2 border-r-2 border-gray-500 rotate-45 pointer-events-none" />
              </div>
              <div className="relative w-32 sm:w-40">
                <select
                  value={selectedYear || '2025'}
                  onChange={e => setSelectedYear(e.target.value || '2025')}
                  className="w-full h-10 bg-white border-2 border-gray-300 rounded-xl px-3 text-lg sm:text-xl text-gray-500 font-normal appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all hover:border-gray-400"
                >
                  {(years || []).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 border-b-2 border-r-2 border-gray-500 rotate-45 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 auto-rows-min">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isSelected =
                  selectedDate ===
                  `${selectedYear || '2025'}-${String(
                    months.indexOf(selectedMonth || 'May') + 1
                  ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayOfWeek = getDayOfWeek(
                  selectedYear || '2025',
                  selectedMonth || 'May',
                  day
                );
                return (
                  <div
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className="w-10 h-12 rounded-md flex flex-col items-center justify-center text-xs font-normal cursor-pointer hover:bg-blue-100 transition-colors"
                    style={{
                      backgroundColor: isSelected ? '#129E00' : '#DFDFDF',
                      color: isSelected ? 'white' : 'black',
                    }}
                  >
                    <span className="text-[10px]">{dayOfWeek}</span>
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Names and Progress Section */}
          <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6 flex items-center justify-center">
            <div className="w-full flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-4">
                {/* Name Table with Custom Scroll */}
                <div className="w-full min-w-[180px] flex flex-col border rounded-md shadow-md">
                  <div className="bg-[#19216F] rounded-t-lg h-12 flex items-center px-4">
                    <span className="text-white font-['Inter'] font-semibold text-[12.28px] w-[66px]">
                      S/No
                    </span>
                    <span className="text-white font-['Inter'] font-semibold text-[12.28px] w-[66px] ml-auto">
                      Names
                    </span>
                  </div>
                  <div className="max-h-[235px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#19216F] scrollbar-track-gray-100 scrollbar-w-2">
                    {(uniqueNames || []).length === 0 ? (
                      <div className="text-gray-500 text-center py-4">
                        No names available
                      </div>
                    ) : (
                      uniqueNames.map((row, index) => (
                        <div
                          key={row?.internId || index}
                          onClick={() => handleNameSelect(row?.name, row?.sno)}
                          className={`h-[47px] flex items-center px-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedSno === row?.sno
                              ? 'bg-blue-100 border-l-4 border-blue-500'
                              : ''
                          }`}
                          style={{ backgroundColor: row?.bg || '#FFFFFF' }}
                        >
                          <span
                            className="font-['Inter'] font-normal text-[12.28px] w-[66px]"
                            style={{ color: row?.text || '#000000' }}
                          >
                            {row?.sno || '000'}
                          </span>
                          <span
                            className="font-['Inter'] font-normal text-[12.28px] w-[66px] ml-auto capitalize"
                            style={{ color: row?.text || '#000000' }}
                          >
                            {row?.name || 'Unknown'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Progress Circles */}
                <div className="w-full bg-white rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 justify-center items-center h-full">
                    {/* Total Questions Created */}
                    <div className="relative flex items-center justify-center">
                      <div className="md:w-1/2 lg:w-full">
                        <CircularProgressbar
                          value={Math.min(
                            (totalCreated || 0) * (100 / 100),
                            100
                          )}
                          strokeWidth={5}
                          circleRatio={0.7}
                          styles={buildStyles({
                            rotation: 0.65,
                            strokeLinecap: 'round',
                            pathColor: '#129E00',
                            trailColor: '#BCBCBC',
                          })}
                        />
                      </div>
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-[18.37px] font-['Inter'] font-medium text-[#707070]">
                          {totalCreated || 0}
                        </span>
                      </div>
                      <div className="absolute top-20 text-[13.78px] font-['Inter'] font-medium text-[#707070] text-center w-[103px]">
                        Total Questions Created
                      </div>
                    </div>

                    {/* Total Questions Verified */}
                    <div className="relative flex items-center justify-center">
                      <div className="md:w-1/2 lg:w-full">
                        <CircularProgressbar
                          value={
                            (totalCreated || 0) === 0
                              ? 0
                              : ((totalVerified || 0) / (totalCreated || 1)) *
                                100
                          }
                          strokeWidth={5}
                          circleRatio={0.7}
                          styles={buildStyles({
                            rotation: 0.65,
                            strokeLinecap: 'round',
                            pathColor: '#FF5900',
                            trailColor: '#BCBCBC',
                          })}
                        />
                      </div>
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/3 flex flex-col items-center">
                        <span className="text-[18.37px] font-['Inter'] font-medium text-[#707070]">
                          {totalVerified || 0}
                        </span>
                      </div>
                      <div className="absolute top-20 text-[13.78px] font-['Inter'] font-medium text-[#707070] text-center w-[103px]">
                        Total Questions Verified
                      </div>
                    </div>

                    {/* Total Questions Dumped */}
                    <div className="relative flex items-center justify-center">
                      <div className="md:w-1/2 lg:w-full">
                        <CircularProgressbar
                          value={
                            (totalCreated || 0) === 0
                              ? 0
                              : ((totalDumped || 0) / (totalCreated || 1)) * 100
                          }
                          strokeWidth={5}
                          circleRatio={0.7}
                          styles={buildStyles({
                            rotation: 0.65,
                            strokeLinecap: 'round',
                            pathColor: '#FF0000',
                            trailColor: '#BCBCBC',
                          })}
                        />
                      </div>
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/3 flex flex-col items-center">
                        <span className="text-[18.37px] font-['Inter'] font-medium text-[#707070]">
                          {totalDumped || 0}
                        </span>
                      </div>
                      <div className="absolute top-20 text-[13.78px] font-['Inter'] font-medium text-[#707070] text-center w-[103px]">
                        Total Questions Dumped
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Table */}
        <div className="w-full bg-white rounded-2xl shadow-md p-4">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="w-full min-w-[800px] bg-white rounded-lg">
              <div className="grid grid-cols-11 bg-[#19216F] text-white text-xs font-semibold rounded-t-lg h-12 items-center px-4 text-center">
                <div>S/No</div>
                <div>Subject</div>
                <div>Tag</div>
                <div>MCQ Created</div>
                <div>MCQ Verified</div>
                <div>Code Created</div>
                <div>Code Verified</div>
                <div>Total Verified</div>
                <div>MCQ Dumped</div>
                <div>Code Dumped</div>
                <div>Total Dumped</div>
              </div>
              <div className="max-h-[330px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#19216F] scrollbar-track-gray-100 scrollbar-w-2">
                {(groupedData || []).length === 0 ? (
                  <div className="text-black text-center py-4">
                    No progress data available.
                  </div>
                ) : (
                  groupedData.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-11 text-xs h-11 items-center px-4 capitalize text-center"
                      style={{
                        backgroundColor: row?.bg || '#FFFFFF',
                        color: row?.text || '#000000',
                      }}
                    >
                      <div>{row?.sno || '000'}</div>
                      <div>{row?.subject || 'N/A'}</div>
                      <div>{row?.tag || 'N/A'}</div>
                      <div>{row?.mcq_created || 0}</div>
                      <div>{row?.mcq_verified || 0}</div>
                      <div>{row?.code_created || 0}</div>
                      <div>{row?.code_verified || 0}</div>
                      <div>{row?.total_verified || 0}</div>
                      <div>{row?.mcq_dumped || 0}</div>
                      <div>{row?.code_dumped || 0}</div>
                      <div>{row?.total_dumped || 0}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="block sm:hidden space-y-4 max-h-[330px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#19216F] scrollbar-track-gray-100 scrollbar-w-2">
            {(groupedData || []).length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No progress data available.
              </div>
            ) : (
              groupedData.map((row, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-4 border capitalize"
                  style={{
                    backgroundColor: row?.bg || '#FFFFFF',
                    color: row?.text || '#000000',
                  }}
                >
                  <div className="text-md font-semibold mb-2">
                    S/No:{' '}
                    <span className="font-normal">{row?.sno || '000'}</span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    Subject:{' '}
                    <span className="font-normal">{row?.subject || 'N/A'}</span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    Tag:{' '}
                    <span className="font-normal">{row?.tag || 'N/A'}</span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    MCQ Created:{' '}
                    <span className="font-normal">{row?.mcq_created || 0}</span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    MCQ Verified:{' '}
                    <span className="font-normal">
                      {row?.mcq_verified || 0}
                    </span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    Code Created:{' '}
                    <span className="font-normal">
                      {row?.code_created || 0}
                    </span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    Code Verified:{' '}
                    <span className="font-normal">
                      {row?.code_verified || 0}
                    </span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    Total Verified:{' '}
                    <span className="font-normal">
                      {row?.total_verified || 0}
                    </span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    MCQ Dumped:{' '}
                    <span className="font-normal">{row?.mcq_dumped || 0}</span>
                  </div>
                  <div className="text-md font-semibold mb-2">
                    Code Dumped:{' '}
                    <span className="font-normal">{row?.code_dumped || 0}</span>
                  </div>
                  <div className="text-md font-semibold">
                    Total Dumped:{' '}
                    <span className="font-normal">
                      {row?.total_dumped || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #19216f #e5e7eb;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 1px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #19216f;
          border-radius: 1px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #1e3a8a;
        }
      `}</style>
    </div>
  );
};

export default InternProgressSummary;
