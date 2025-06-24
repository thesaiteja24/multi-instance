import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getStudentsReports } from '../services/studentService';
import { useSelector } from 'react-redux';

// ExamCard component to handle individual exam cards
const ExamCard = ({ exam, totalScore, maxScore, attempted }) => {
  const navigate = useNavigate();
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Calculate percentage and stroke color
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  let strokeColor = '#B4B4B4';
  if (percentage >= 80) strokeColor = '#129E00';
  else if (percentage >= 30) strokeColor = '#FF5900';
  else if (percentage > 0) strokeColor = '#FF0000';

  // Animate the percentage
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = percentage / (duration / 20);

    const animate = () => {
      start += increment;
      if (start >= percentage) {
        setAnimatedPercentage(percentage);
        return;
      }
      setAnimatedPercentage(start);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [percentage]);

  // Handle button click for navigation
  const handleViewReport = () => {
    // Ensure exam is valid before navigating
    if (!exam || !exam._id) {
      console.error('Invalid exam object:', exam);
      return;
    }
    navigate(`/student/reports/daily/${exam.examName}`, {
      state: { exam: { ...exam }, isReports: true },
    });
  };

  return (
    <div className="w-full bg-white shadow-[0px_4px_17px_rgba(19,46,224,0.2)] rounded-[26px] p-6 flex flex-col items-center">
      {/* Exam Name */}
      <div className="text-xl font-medium text-black mb-4 text-center">
        {exam.examName || 'Unnamed Exam'}
      </div>

      {/* Circular Progress Bar */}
      <div className="relative w-[270px] h-[160px] flex items-center justify-center">
        <div className="w-[180px] h-[180px]">
          <CircularProgressbar
            value={animatedPercentage}
            strokeWidth={5}
            circleRatio={0.7}
            styles={buildStyles({
              rotation: 0.65,
              strokeLinecap: 'round',
              pathColor: strokeColor,
              trailColor: '#B4B4B4',
              pathTransition: 'none',
            })}
          />
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <span
            className={`text-2xl font-bold ${attempted ? `text-[${strokeColor}]` : 'text-[#B4B4B4]'}`}
          >
            {attempted ? `${Math.round(animatedPercentage)}%` : '0%'}
          </span>
          <div className="text-base font-medium mt-1">
            <span className="text-[#777777]">Score :</span>{' '}
            <span className="text-[#4A4A4A]">
              {attempted ? `${totalScore}/${maxScore}` : '00/30'}
            </span>
          </div>
        </div>
      </div>

      {/* View Report Button */}
      <button
        onClick={handleViewReport}
        className="mt-4 px-4 py-2 w-[220px] h-[40px] bg-[var(--color-secondary)] rounded-[6px] text-white text-base font-medium"
      >
        View Detailed Report
      </button>
    </div>
  );
};

const DailyReportsOverview = () => {
  const [dailyExam, setDailyExam] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const examsPerPage = 8;
  const inputRef = useRef(null);
  const { userInfo } = useSelector(state => state.auth);
  const { id } = userInfo;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getStudentsReports(id);
        setDailyExam(response.results['Daily-Exam']);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching student reports:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateMaximumMarks = paper => {
    let maximumScore = 0;
    if (!paper || paper.length === 0) return 0;

    paper.forEach(subjectPaper => {
      if (subjectPaper.MCQs?.length > 0) {
        maximumScore += subjectPaper.MCQs.reduce(
          (sum, mcq) => sum + Number(mcq.Score),
          0
        );
      }
      if (subjectPaper.Coding?.length > 0) {
        maximumScore += subjectPaper.Coding.reduce(
          (sum, code) => sum + Number(code.Score),
          0
        );
      }
    });

    return maximumScore;
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (e) {
        inputRef.current.focus();
      }
    }
  };

  // Handle date change from input
  const handleDateChange = e => {
    setSelectedDate(e.target.value);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Clear the date filter
  const handleClearFilter = () => {
    setSelectedDate('');
    setCurrentPage(1); // Reset pagination
  };

  // Render header with back button and date picker
  const renderHeader = () => (
    <>
      {/* CSS for Date Picker */}
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            display: none !important;
            opacity: 0;
          }
          input[type="date"] {
            -moz-appearance: textfield;
            appearance: none;
          }
          .custom-date-input {
            position: relative;
            background: #EFF0F7;
            border: 1px solid #00007F;
            border-radius: 6px;
            padding: 6px 40px 6px 12px;
            width: 180px;
            font-size: 14px;
            color: #000;
            line-height: 1.5;
            cursor: pointer;
            z-index: 1;
          }
          .custom-date-icon {
            pointer-events: auto;
            cursor: pointer;
            z-index: 2;
          }
          .custom-date-input-wrapper {
            position: relative;
            display: inline-block;
          }
        `}
      </style>

      <div className="w-full px-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
        <div
          onClick={() => navigate('/student/reports/type')}
          className="flex flex-row items-center gap-2 cursor-pointer"
        >
          <div className="w-[33px] h-[25px] flex items-center justify-center rounded">
            <FiArrowLeft size={22} color="#181D27" />
          </div>
          <span className="text-black text-[18px] sm:text-[20px] font-medium leading-[24px]">
            Back
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-black hidden sm:block">
            Select Date
          </label>
          <div className="custom-date-input-wrapper">
            <input
              type="date"
              ref={inputRef}
              className="custom-date-input"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <FiCalendar
              className="custom-date-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)]"
              size={18}
              onClick={handleIconClick}
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderExamCards = () => {
    if (!dailyExam || dailyExam.length === 0) {
      return (
        <>
          {renderHeader()}
          <div className="text-center text-lg font-medium text-[#777777] mt-10">
            No exams available
          </div>
        </>
      );
    }

    // Filter exams by selected date
    const filteredExams = selectedDate
      ? dailyExam.filter(exam => {
          if (!exam.startDate) return false;
          const examDate = new Date(exam.startDate).toISOString().split('T')[0];
          return examDate === selectedDate;
        })
      : dailyExam;

    if (filteredExams.length === 0) {
      return (
        <>
          {renderHeader()}
          <div className="text-center text-lg font-medium text-[#777777] mt-10">
            No exams found for this date
            <button
              onClick={handleClearFilter}
              className="ml-2 px-3 py-1 bg-[var(--color-secondary)] text-white text-sm font-medium rounded-[6px] hover:bg-[#000066]"
            >
              Clear Filter
            </button>
          </div>
        </>
      );
    }

    const reversedExams = filteredExams.slice().reverse();
    const totalPages = Math.ceil(reversedExams.length / examsPerPage);
    const startIndex = (currentPage - 1) * examsPerPage;
    const paginatedExams = reversedExams.slice(
      startIndex,
      startIndex + examsPerPage
    );

    return (
      <>
        {renderHeader()}
        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full px-4">
          {paginatedExams.map(exam => {
            const totalScore = exam.analysis?.totalScore || 0;
            const maxScore = calculateMaximumMarks(exam.paper);
            const attempted = exam['attempt-status'];

            return (
              <ExamCard
                key={exam._id}
                exam={exam}
                totalScore={totalScore}
                maxScore={maxScore}
                attempted={attempted}
              />
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 w-full px-4 flex justify-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-[16px] font-medium">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="text-black"
              >
                {'< Back'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[28px] h-[28px] flex items-center justify-center rounded transition
                    ${
                      currentPage === page
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white text-black shadow-[0px_4px_17px_rgba(19,46,224,0.2)]'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                className="text-black"
              >
                {'Next >'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="font-[inter]">
      <main className="flex flex-col items-center">
        {loading ? (
          <div className="flex items-center justify-center mt-10">
            <Loader className="animate-spin" />
          </div>
        ) : (
          renderExamCards()
        )}
      </main>
    </div>
  );
};

export default DailyReportsOverview;
