import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { getMentorStudentsThunk } from '../../reducers/mentorStudentsSlice';

const DailyExamSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const loc = userInfo?.location;
  const mentorId = userInfo?.id;
  const { batch } = useParams();
  const { examType, exams: passedExams } = location.state || {};
  const { scheduleData } = useSelector(state => state.mentorStudents);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [itemsPerRow, setItemsPerRow] = useState(20);

  // Compute unique batches
  const uniqueBatches = useMemo(() => {
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const allBatches = scheduleData.map(entry => entry.batchNo).flat();
      return [...new Set(allBatches)];
    }
    return [];
  }, [scheduleData]);

  // Validate and set exams from location.state
  useEffect(() => {
    const validateExams = () => {
      if (!batch || !loc || !examType || !Array.isArray(passedExams)) {
        setError('Missing batch, location, exam type, or exams data.');
        toast.info('Please select an exam from the dashboard.', {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: true,
        });
        setLoading(false);
        return;
      }

      if (!uniqueBatches.includes(batch)) {
        setError('Selected batch is not valid for this mentor.');
        toast.error('Invalid batch selected.', {
          autoClose: 5000,
          closeOnClick: true,
          closeButton: true,
        });
        setLoading(false);
        return;
      }

      // Filter exams to ensure they match examType and batch
      const filteredExams = passedExams
        .filter(exam => exam.examName.startsWith(examType))
        .filter(exam => exam.batch === batch);

      setExams(filteredExams);
      if (filteredExams.length === 0) {
        toast.warn(
          `No ${examType.replace(
            '-Exam',
            ' Exam'
          )} data available for this batch and location.`,
          {
            autoClose: 5000,
            closeOnClick: true,
            closeButton: true,
          }
        );
      }
      setLoading(false);
    };

    if (scheduleData.length === 0) {
      dispatch(
        getMentorStudentsThunk({
          location: loc,
          mentorId,
        })
      );
    }

    if (scheduleData.length !== 0) {
      validateExams();
    }
  }, [batch, loc, examType, passedExams, uniqueBatches]);

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

    updateItemsPerRow();
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);

  // Sort exams in descending order
  const sortedExams = Array.isArray(exams)
    ? exams.slice().sort((a, b) => {
        const numA = parseInt(a.examName.replace(/\D+/g, ''), 10) || 0;
        const numB = parseInt(b.examName.replace(/\D+/g, ''), 10) || 0;
        return numB - numA;
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
      navigate(`/mentor/reports/${batch}/${loc}/daily/${exam.examName}`, {
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
        <div className="w-6 h-6 flex items-center justify-center rounded text-sm">
          ←
        </div>
        <span className="text-base md:text-[20px] font-medium text-black leading-6 md:leading-[24px]">
          Back
        </span>
      </div>

      {/* Heading */}
      <h1 className="mt-2 text-xl md:text-[25px] font-semibold text-[var(--color-secondary)] leading-7 md:leading-[30px] text-center">
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
                    ${
                      loadingId === exam.examName
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }
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
