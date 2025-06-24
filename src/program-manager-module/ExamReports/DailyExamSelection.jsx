import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DailyExamSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batch, location: loc, examType } = location.state || {};
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [itemsPerRow, setItemsPerRow] = useState(20);

  // Fetch exam data on mount
  useEffect(() => {
    const fetchExams = async () => {
      if (!batch || !loc || !examType) {
        setError('Missing batch, location, or exam type data.');
        setLoading(false);
        toast.info('Please select an exam from the dashboard.', {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: true,
        });
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/exam-day-list`,
          {
            params: {
              batch,
              location: loc,
            },
          }
        );
        const data = response.data;
        // Ensure exams is an array and filter by examType
        const examsData = Array.isArray(data.exams) ? data.exams : [];
        const filteredExams = examsData.filter(exam =>
          exam.examName.startsWith(examType)
        );
        setExams(filteredExams);
        if (data.success !== true) {
          throw new Error('API response indicates failure.');
        }
        if (filteredExams.length === 0) {
          toast.warn(
            `No ${examType.replace('-Exam', ' Exam')} data available for this batch and location.`,
            {
              autoClose: 5000,
              closeOnClick: true,
              closeButton: true,
            }
          );
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || 'Error fetching exam data';
        setError(errorMessage);
        toast.error(errorMessage, {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: true,
        });
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [batch, loc, examType]);

  // Dynamically set items per row based on screen width
  useEffect(() => {
    const updateItemsPerRow = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setItemsPerRow(15); // Desktop
      } else if (width >= 992) {
        setItemsPerRow(15); // Large Tablet
      } else if (width >= 550) {
        setItemsPerRow(10); // Tablet
      } else {
        setItemsPerRow(5); // Mobile
      }
    };

    updateItemsPerRow(); // initial call
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);

  // Sort exams in descending order based on the numeric part of examName
  const sortedExams = Array.isArray(exams)
    ? exams.slice().sort((a, b) => {
        const numA = parseInt(a.examName.replace(/\D+/g, ''), 10) || 0;
        const numB = parseInt(b.examName.replace(/\D+/g, ''), 10) || 0;
        return numB - numA; // descending order
      })
    : [];

  // Split exams into rows
  const rows = [];
  for (let i = 0; i < sortedExams.length; i += itemsPerRow) {
    rows.push(sortedExams.slice(i, i + itemsPerRow));
  }

  const handleExamClick = async exam => {
    setLoadingId(exam.examName);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/exam-batch-reports`,
        {
          params: {
            batch: exam.batch,
            examName: exam.examName,
          },
        }
      );
      const data = response.data;
      navigate(`/program-manager/reports/daily/${exam.examName}`, {
        state: data,
      });
    } catch (error) {
      console.error('Error fetching exam details:', error);
      toast.error('Error fetching exam details');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-hidden flex flex-col items-center py-2 px-4 sm:px-6 md:px-8 relative">
      {/* Back button */}
      <div
        className="absolute top-4 left-4 flex items-center gap-2 cursor-pointer z-10"
        onClick={() => navigate(-1)}
      >
        <div className="w-6 h-6  flex items-center justify-center rounded text-sm">
          ←
        </div>
        <span className="text-base md:text-[20px] font-medium text-black leading-6 md:leading-[24px]">
          Back
        </span>
      </div>

      {/* Heading */}
      <h1 className="mt-2 text-xl md:text-[25px] font-semibold text-[#00007F] leading-7 md:leading-[30px] text-center">
        {examType
          ? `${examType.replace('-Exam', ' Exam')} Report`
          : 'Exam Report'}
      </h1>

      {/* Main card */}
      <div
        className="
          w-full max-w-[1500px]
          bg-white rounded-[20px]
          shadow-[0_4px_20px_#B3BAF7]
          p-10 overflow-y-auto mt-6
          flex-grow
          flex flex-col justify-start items-center mb-2
          max-h-[calc(100vh-160px)]
        "
      >
        {loading ? (
          <p className="text-center text-gray-600">Loading exam data...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : sortedExams.length > 0 ? (
          rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4"
            >
              {row.map(exam => (
                <div
                  key={exam.examName}
                  className={`
                    group
                    w-10 h-10 sm:w-[40px] sm:h-[40px] md:w-[52.53px] md:h-[52.53px]
                    bg-[#E1EFFF]
                    rounded-[10px]
                    flex items-center justify-center
                    cursor-pointer hover:bg-[#00007F] transition
                    ${loadingId === exam.examName ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  onClick={() => handleExamClick(exam)}
                >
                  <span className="text-sm sm:text-[16px] md:text-[20px] text-black group-hover:text-white">
                    {exam.examName.replace(/\D+/g, '') || exam.examName}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No exam performance data available.
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyExamSelection;
