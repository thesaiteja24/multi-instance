import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarMonthColumn = ({ label, days, onDayClick, selectedDate }) => {
  return (
    <div className="flex flex-col justify-between h-full min-w-[90%] sm:min-w-[20%] lg:min-w-[15%] xl:min-w-0 snap-center overflow-hidden">
      <div className="flex flex-wrap gap-1" style={{ maxWidth: '100%' }}>
        {days.map(({ day, date }, idx) => (
          <button
            key={idx}
            className={`w-[18px] h-[18px] sm:w-[15px] sm:h-[15px] rounded-sm flex items-center justify-center text-[7px] sm:text-[6px] leading-[8px] sm:leading-[7px] transition-colors duration-200 ${
              date === selectedDate
                ? 'bg-blue-500 text-white'
                : 'bg-[#D9D9D9] text-[#252525] hover:bg-blue-100'
            }`}
            style={{ flex: '0 0 auto' }}
            onClick={() => onDayClick(date)}
          >
            {day}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center mt-3">
        <div className="w-full h-[1.5px] bg-[rgba(217,217,217,0.5)]" />
        <span className="text-[12px] leading-[15px] text-black font-normal mt-1">
          {label}
        </span>
      </div>
    </div>
  );
};

const ExamStatisticsCalendar = ({ onDayClick, selectedDate }) => {
  const monthRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const years = Array.from({ length: 21 }, (_, i) => selectedYear - 10 + i);

  const isLeapYear = year => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getDaysForMonth = (monthIndex, year) => {
    const daysInMonth = [
      31,
      isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    return Array.from({ length: daysInMonth[monthIndex] }, (_, i) => {
      const day = i + 1;
      const month = (monthIndex + 1).toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const date = `${year}-${month}-${dayStr}`;
      return { day: day.toString(), date };
    });
  };

  const months = [
    { name: 'Jan', days: getDaysForMonth(0, selectedYear) },
    { name: 'Feb', days: getDaysForMonth(1, selectedYear) },
    { name: 'Mar', days: getDaysForMonth(2, selectedYear) },
    { name: 'Apr', days: getDaysForMonth(3, selectedYear) },
    { name: 'May', days: getDaysForMonth(4, selectedYear) },
    { name: 'Jun', days: getDaysForMonth(5, selectedYear) },
    { name: 'Jul', days: getDaysForMonth(6, selectedYear) },
    { name: 'Aug', days: getDaysForMonth(7, selectedYear) },
    { name: 'Sep', days: getDaysForMonth(8, selectedYear) },
    { name: 'Oct', days: getDaysForMonth(9, selectedYear) },
    { name: 'Nov', days: getDaysForMonth(10, selectedYear) },
    { name: 'Dec', days: getDaysForMonth(11, selectedYear) },
  ];

  const scrollToCurrentMonth = () => {
    if (monthRef.current && window.innerWidth < 1280) {
      // xl breakpoint
      const currentMonthIndex = new Date().getMonth(); // 0 for Jan, 1 for Feb, etc.
      const monthElement =
        monthRef.current.querySelectorAll('.snap-center')[currentMonthIndex];
      if (monthElement) {
        const cardWidth = monthElement.offsetWidth;
        const scrollPosition = currentMonthIndex * cardWidth;
        monthRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  useEffect(() => {
    scrollToCurrentMonth();
    // Re-run on window resize to handle dynamic screen size changes
    window.addEventListener('resize', scrollToCurrentMonth);
    return () => window.removeEventListener('resize', scrollToCurrentMonth);
  }, []);

  const scroll = dir => {
    if (monthRef.current) {
      const cardWidth =
        monthRef.current.querySelector('.snap-center').offsetWidth;
      const cardsPerView =
        window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 5 : 1;
      const scrollAmount = cardWidth * cardsPerView;
      monthRef.current.scrollBy({
        left: dir === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleYearSelect = year => {
    setSelectedYear(year);
    setIsYearDropdownOpen(false);
  };

  return (
    <div className="flex mt-4 mb-4 font-[Inter]">
      <div className="flex flex-col flex-grow min-h-[273px] bg-white rounded-md shadow-[0px_4px_17px_rgba(19,46,224,0.2)] p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-[#333333] font-medium text-sm leading-[17px]">
            Contributions
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#129E00] rounded-sm" />
              <span className="text-xs text-[#434343]">Attempted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#D9D9D9] rounded-sm" />
              <span className="text-xs text-[#434343]">None</span>
            </div>
            <div className="relative">
              <button
                className="flex items-center justify-between gap-1 bg-white px-2 py-1 min-w-[78px] h-[23px] rounded shadow-[0px_4px_17px_rgba(19,46,224,0.2)]"
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              >
                <span className="text-xs font-medium text-[#434343]">
                  {selectedYear}
                </span>
                <ChevronDown
                  size={12}
                  color="#434343"
                  strokeWidth={1.5}
                  className="border border-[#434343] rounded-sm"
                />
              </button>
              {isYearDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded shadow-lg max-h-[150px] overflow-y-auto z-10">
                  {years.map(year => (
                    <button
                      key={year}
                      className="block w-full text-left px-2 py-1 text-xs text-[#434343] hover:bg-gray-100"
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 h-px w-full bg-[#D9D9D9]" />
        <div className="flex justify-between items-center mt-4 mb-2 xl:hidden">
          <button
            onClick={() => scroll('left')}
            className="p-1 rounded bg-gray-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 rounded bg-gray-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div
          ref={monthRef}
          className="mt-2 xl:grid xl:grid-cols-12 xl:gap-4 flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 hide-scrollbar xl:overflow-x-hidden"
        >
          {months.map(month => (
            <CalendarMonthColumn
              key={month.name}
              label={month.name}
              days={month.days}
              onDayClick={onDayClick}
              selectedDate={selectedDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamStatisticsCalendar;
