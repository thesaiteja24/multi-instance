import React, { useState, useEffect, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaSadTear } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ExamCountdownTimer from './ExamCountDownTimer.jsx';
import { fetchStudentDetails } from '../../reducers/studentSlice.js';
import { createExam } from '../../reducers/examModuleSlice.js';
import InstructionsModal from './InstructionsModal.jsx';
import MobileWarningCard from './MobileWarningCard.jsx';
import { getAvailableExams } from '../../services/studentService.js';
import CustomScaleLoader from '../../ui/CustomScaleLoader.jsx';

const ExamDashboard = () => {
  const dispatch = useDispatch();
  const { studentDetails, loading: studentLoading } = useSelector(
    state => state.student
  );
  const { examData, startExamLoading, startExamError } = useSelector(
    state => state.examModule
  );
  const [isStarting, setIsStarting] = useState(false);
  const { userInfo } = useSelector(state => state.auth);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverTime, setServerTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [useServerTime, setUseServerTime] = useState(true); // Toggle for developers
  const [selectedExam, setSelectedExam] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [finishedPage, setFinishedPage] = useState(1);
  const [refreshExams, setRefreshExams] = useState(0); // Trigger for re-fetching exams
  const examsPerPage = 8;

  const location = userInfo?.location;
  const Id = userInfo?.id;
  const batch = studentDetails?.BatchNo;
  const navigate = useNavigate();

  // Fetch and update server time
  useEffect(() => {
    let intervalId;

    const initializeServerTime = async () => {
      try {
        const response = await fetch('https://time.scubey.com/codegnantime');
        const data = await response.json();
        const initialTime = new Date(data.server_time);
        setServerTime(initialTime);
        if (useServerTime) {
          setCurrentTime(initialTime);
        }
      } catch (err) {
        console.error('Failed to fetch server time:', err);
        if (!useServerTime) {
          setCurrentTime(new Date());
        }
      }
    };

    initializeServerTime();

    // Update server time every second
    intervalId = setInterval(() => {
      setServerTime(prevTime => {
        if (prevTime) {
          return new Date(prevTime.getTime() + 1000);
        }
        return null;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Update currentTime based on useServerTime
  useEffect(() => {
    let localTimeInterval;

    if (useServerTime) {
      if (serverTime) {
        setCurrentTime(serverTime);
      } else {
        setCurrentTime(new Date()); // Fallback to local time if server fails
      }
    } else {
      // Use local time for development
      setCurrentTime(new Date());
      localTimeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }

    return () => {
      if (localTimeInterval) clearInterval(localTimeInterval);
    };
  }, [useServerTime, serverTime]);

  // Fetch student details
  useEffect(() => {
    if (!studentLoading && !studentDetails && Id && location) {
      dispatch(fetchStudentDetails());
    }
  }, [dispatch, studentLoading, studentDetails, Id, location]);

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await getAvailableExams(Id);
        setExams(response || []);
      } catch (err) {
        setError('No exams found');
      } finally {
        setLoading(false);
      }
    };

    if (batch && location && Id) {
      fetchExams();
    }
  }, [batch, location, Id, refreshExams]);

  // Categorize exams
  const categorizeExams = () => {
    if (!currentTime) {
      return { active: [], upcoming: [], finished: [] };
    }

    const now = currentTime;
    const active = [];
    const upcoming = [];
    const finished = [];

    exams.forEach(exam => {
      const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
      const examEnd = new Date(
        examStart.getTime() + exam.totalExamTime * 60000
      );

      if (now >= examStart && now <= examEnd) {
        active.push(exam);
      } else if (now < examStart) {
        upcoming.push(exam);
      } else {
        finished.push(exam);
      }
    });

    return { active, upcoming, finished };
  };

  // Memoize categorized exams
  const { active, upcoming, finished } = useMemo(categorizeExams, [
    exams,
    currentTime,
  ]);

  // Pagination calculations
  const activeTotalPages = Math.ceil(active.length / examsPerPage);
  const upcomingTotalPages = Math.ceil(upcoming.length / examsPerPage);
  const finishedTotalPages = Math.ceil(finished.length / examsPerPage);

  const activeExamsToShow = active.slice(
    (activePage - 1) * examsPerPage,
    activePage * examsPerPage
  );
  const upcomingExamsToShow = upcoming.slice(
    (upcomingPage - 1) * examsPerPage,
    upcomingPage * examsPerPage
  );

  const finishedSorted = [...finished].sort((a, b) => {
    const dateA = new Date(`${a.startDate}T${a.startTime}`);
    const dateB = new Date(`${b.startDate}T${b.startTime}`);
    return dateB - dateA;
  });
  const finishedExamsToShow = finishedSorted.slice(
    (finishedPage - 1) * examsPerPage,
    finishedPage * examsPerPage
  );

  // Handle countdown end
  const handleCountdownEnd = () => {
    setRefreshExams(prev => prev + 1);
  };

  // Handle exam instructions
  const handleExamInstructions = async exam => {
    // In development mode with local time, skip server validation
    if (process.env.NODE_ENV === 'development' && !useServerTime) {
      setSelectedExam(exam);
      setShowInstructions(true);
      return;
    }

    try {
      const response = await fetch('https://time.scubey.com/codegnantime');
      const data = await response.json();
      const serverTimeRes = new Date(data.server_time);
      const examStartTime = new Date(`${exam.startDate}T${exam.startTime}`);
      const examEndTime = new Date(
        examStartTime.getTime() + exam.totalExamTime * 60000
      );

      if (serverTimeRes < examStartTime) {
        toast.error(
          `Cannot proceed: The exam can only be started on ${examStartTime.toLocaleDateString(
            'en-GB',
            { day: '2-digit', month: 'short', year: 'numeric' }
          )} at ${examStartTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}.`
        );
        return;
      }

      if (serverTimeRes > examEndTime) {
        toast.error(
          `Cannot proceed: The exam ended on ${examEndTime.toLocaleDateString(
            'en-GB',
            { day: '2-digit', month: 'short', year: 'numeric' }
          )} at ${examEndTime.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}.`
        );
        return;
      }

      setSelectedExam(exam);
      setShowInstructions(true);
    } catch (err) {
      console.error('Failed to validate time:', err);
      toast.error('Unable to validate server time. Please try again.');
    }
  };

  // Handle exam start
  const handleStartExam = async () => {
    if (!selectedExam) {
      toast.error('No exam selected.');
      return;
    }

    if (examData) {
      toast.error(
        'Finish or submit the current exam before starting a new one.'
      );
      return;
    }

    sessionStorage.removeItem('examSubmittedDueToRefresh');

    const examId = selectedExam.examId;
    const collectionName = selectedExam.examName
      .split('-')
      .slice(0, -1)
      .join('-');

    setIsStarting(true);

    // In development mode with local time, skip server validation
    if (process.env.NODE_ENV === 'development' && !useServerTime) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen request failed:', err);
            toast.warn('Fullscreen mode unavailable. Proceeding anyway.');
          });
        }

        await dispatch(createExam({ examId, collectionName })).unwrap();

        if (startExamError) {
          toast.error('Failed to start exam: ' + startExamError);
        } else {
          setShowInstructions(false);
          navigate('/conduct-exam');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while starting the exam: ' + error.message,
          confirmButtonText: 'OK',
        });
      } finally {
        setIsStarting(false);
      }
    }

    try {
      // Re-validate server time
      const response = await fetch('https://time.scubey.com/codegnantime');
      const data = await response.json();
      const serverTimeRes = new Date(data.server_time);
      const examStartTime = new Date(
        `${selectedExam.startDate}T${selectedExam.startTime}`
      );
      const examEndTime = new Date(
        examStartTime.getTime() + selectedExam.totalExamTime * 60000
      );

      if (serverTimeRes < examStartTime || serverTimeRes > examEndTime) {
        toast.error('Exam time window has changed. Please try again.');
        setShowInstructions(false);
        setRefreshExams(prev => prev + 1);
        return;
      }

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed:', err);
          toast.warn('Fullscreen mode unavailable. Proceeding anyway.');
        });
      }

      // Start exam
      await dispatch(createExam({ examId, collectionName })).unwrap();

      if (startExamError) {
        toast.error('Failed to start exam: ' + startExamError);
      } else {
        setShowInstructions(false);
        navigate('/conduct-exam');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while starting the exam: ' + error.message,
        confirmButtonText: 'OK',
      });
    }
  };

  // Navigate to conduct-exam
  useEffect(() => {
    if (examData && !sessionStorage.getItem('examSubmittedDueToRefresh')) {
      navigate('/conduct-exam', { replace: true });
    }
  }, [examData, navigate]);

  // Toggle time source (development only)
  const toggleTimeSource = () => {
    setUseServerTime(prev => !prev);
  };

  // Check for DROPOUTS batch
  const isDropout =
    studentDetails?.BatchNo === 'DROPOUTS' ||
    studentDetails?.BatchNo?.startsWith('DROPOUTS-');

  if (isDropout) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-6 max-w-[600px] text-center">
          <FaSadTear className="text-[#19216F] text-7xl mx-auto mb-4" />
          <h2 className="text-3xl font-semibold text-[#19216F] font-['Inter'] mb-2">
            Your Dropout
          </h2>
          <p className="text-gray-600 text-[20px] font-['Inter']">
            You are currently in the DROPOUTS batch. Please contact support for
            further assistance
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading || studentLoading || !currentTime) {
    return (
      <div className="h-screen">
        <CustomScaleLoader />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-3xl text-center">
        <div className="p-3 rounded bg-red-100 text-red-700">{error}</div>
      </div>
    );
  }

  // Render no exams found
  if (exams.length === 0) {
    return (
      <div className="text-center text-3xl">
        <div className="p-3 rounded bg-red-100 text-red-700">
          No exams found
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─────────── START-EXAM LOADER OVERLAY ─────────── */}
      {(isStarting || startExamLoading) && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
          <img src="/exam-logo.png" alt="Starting..." className="w-32 mb-4" />
          <p className="text-xl text-gray-700 font-semibold">
            Starting your exam, please wait...
          </p>
        </div>
      )}

      {/* ─────────── MAIN DASHBOARD CONTENT ─────────── */}

      <div className="hidden lg:block flex-col px-4 py-4 md:px-8 lg:px-12 font-[inter]">
        {/* Active Exams */}
        {active.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#19216F] mb-3 flex items-center gap-2 text-xl">
              <img className="w-8" src="/ExamModule/book.svg" alt="Exam Icon" />
              Active Exams
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-wrap gap-6">
                {activeExamsToShow.map(exam => (
                  <div
                    key={exam.examId}
                    className="bg-white shadow-md rounded-[20px] w-full sm:w-[48%] md:w-[45%] lg:w-[30%] hover:shadow-lg"
                    style={{ boxShadow: '0 6px 12px -4px #B3BAF7' }}
                  >
                    <div className="border-b p-3 bg-[#19216F] text-[#FFFFFF] rounded-t-[20px] pl-5">
                      <h2 className="text-lg font-bold truncate">
                        {exam.examName}
                      </h2>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-row justify-evenly">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                              <img
                                src="/ExamModule/calendar.svg"
                                alt="Date"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Start Date
                              </strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src="/ExamModule/clock.svg"
                                alt="Clock"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Start Time
                              </strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src="/ExamModule/duration.svg"
                                alt="Duration"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Total Duration
                              </strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src="/ExamModule/book.svg"
                                alt="Subjects"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Subjects
                              </strong>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <span className="text-gray-600">
                              : {exam.startDate}
                            </span>
                            <span className="text-gray-600">
                              : {exam.startTime}
                            </span>
                            <span className="text-gray-600">
                              : {exam.totalExamTime} mins
                            </span>
                            <span
                              className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap"
                              title={exam.subjects?.join(', ') || 'N/A'}
                            >
                              :{' '}
                              {(exam.subjects && exam.subjects.length > 0
                                ? exam.subjects
                                : ['N/A']
                              ).join(', ')}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExamInstructions(exam)}
                          disabled={exam['attempt-status'] || startExamLoading}
                          className={`focus:outline-none text-white font-semibold text-base md:text-lg rounded-lg px-5 py-2.5 ${
                            exam['attempt-status'] || startExamLoading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#19216F] hover:bg-[#0f22b4]'
                          }`}
                        >
                          {startExamLoading
                            ? 'Starting...'
                            : exam['attempt-status']
                              ? 'Already Attempted'
                              : 'Start Exam'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block md:w-1/3 lg:w-1/4 xl:w-1/5">
                <img
                  src="/ExamModule/student-exam.svg"
                  alt="Active Exams"
                  className="w-full h-auto"
                />
              </div>
            </div>
            {activeTotalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Stack spacing={2}>
                  <Pagination
                    count={activeTotalPages}
                    page={activePage}
                    onChange={(e, page) => setActivePage(page)}
                    variant="outlined"
                    shape="rounded"
                  />
                </Stack>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Exams */}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#19216F] mb-3 flex items-center gap-2 text-xl">
              <img className="w-8" src="/ExamModule/book.svg" alt="Exam Icon" />
              Upcoming Exams
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 flex flex-wrap gap-6">
                {upcomingExamsToShow.map(exam => (
                  <div
                    key={exam.examId}
                    className="bg-white shadow-md rounded-[20px] w-full sm:w-[48%] md:w-[55%] lg:w-[30%] hover:shadow-lg"
                    style={{ boxShadow: '0 6px 12px -4px #B3BAF7' }}
                  >
                    <div className="border-b p-3 bg-[#19216F] text-[#FFFFFF] rounded-t-[20px] pl-6">
                      <h2 className="text-lg font-bold truncate">
                        {exam.examName}
                      </h2>
                    </div>
                    <div className="p-3">
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-row justify-evenly">
                          <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                              <img
                                src="/ExamModule/calendar.svg"
                                alt="Date"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Start Date
                              </strong>
                            </div>
                            <div className="flex gap-2">
                              <img
                                src="/ExamModule/clock.svg"
                                alt="Clock"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Start Time
                              </strong>
                            </div>
                            <div className="flex gap-2">
                              <img
                                src="/ExamModule/duration.svg"
                                alt="Duration"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Total Duration
                              </strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src="/ExamModule/book.svg"
                                alt="Subjects"
                                className="w-5 h-5"
                              />
                              <strong className="text-gray-700">
                                Subjects
                              </strong>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <span className="text-gray-600">
                              : {exam.startDate}
                            </span>
                            <span className="text-gray-600">
                              : {exam.startTime}
                            </span>
                            <span className="text-gray-600">
                              : {exam.totalExamTime} mins
                            </span>
                            <span
                              className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap"
                              title={exam.subjects?.join(', ') || 'N/A'}
                            >
                              :{' '}
                              {(exam.subjects && exam.subjects.length > 0
                                ? exam.subjects
                                : ['N/A']
                              ).join(', ')}
                            </span>
                          </div>
                        </div>
                        <ExamCountdownTimer
                          startDate={exam.startDate}
                          startTime={exam.startTime}
                          totalExamTime={exam.totalExamTime}
                          currentTime={currentTime}
                          onCountdownEnd={handleCountdownEnd}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block md:w-1/3 lg:w-1/4 xl:w-1/5">
                <img
                  src="/ExamModule/student-exam.svg"
                  alt="Upcoming Exams"
                  className="w-full h-auto"
                />
              </div>
            </div>
            {upcomingTotalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Stack spacing={2}>
                  <Pagination
                    count={upcomingTotalPages}
                    page={upcomingPage}
                    onChange={(e, page) => setUpcomingPage(page)}
                    variant="outlined"
                    shape="rounded"
                  />
                </Stack>
              </div>
            )}
          </div>
        )}

        {/* Finished Exams */}
        {finished.length > 0 && (
          <div className="mb-6 mt-6">
            <h3 className="font-semibold text-[#19216F] mb-3 flex items-center gap-2 text-xl">
              <img
                className="w-8 sm:w-10"
                src="/ExamModule/book.svg"
                alt="Exam Icon"
              />
              Finished Exams
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-8">
              {finishedExamsToShow.map(exam => (
                <div
                  key={exam.examId}
                  className="rounded-[20px] w-full min-h-[260px] flex flex-col justify-between bg-white shadow-[0_6px_12px_-4px_#B3BAF7]"
                >
                  <div className="border-b p-3 bg-[#19216F] text-white rounded-t-[20px] pl-6">
                    <h2 className="text-lg font-bold truncate">
                      {exam.examName}
                    </h2>
                  </div>
                  <div className="p-4 sm:p-8 flex-1 bg-white rounded-b-[20px]">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <img
                          src="/ExamModule/calendar.svg"
                          alt="Date"
                          className="w-5 sm:w-6 h-5 sm:h-6"
                        />
                        <strong className="text-gray-700">Start Date</strong>
                      </div>
                      <span className="text-gray-600">: {exam.startDate}</span>
                      <div className="flex items-center gap-2">
                        <img
                          src="/ExamModule/clock.svg"
                          alt="Clock"
                          className="w-5 sm:w-6 h-5 sm:h-6"
                        />
                        <strong className="text-gray-700">Start Time</strong>
                      </div>
                      <span className="text-gray-600">: {exam.startTime}</span>
                      <div className="flex items-center gap-2">
                        <img
                          src="/ExamModule/duration.svg"
                          alt="Duration"
                          className="w-5 sm:w-6 h-5 sm:h-6"
                        />
                        <strong className="text-gray-700">Duration</strong>
                      </div>
                      <span className="text-gray-600">
                        : {exam.totalExamTime} mins
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          src="/ExamModule/book.svg"
                          alt="Subjects"
                          className="w-5 sm:w-6 h-5 sm:h-6"
                        />
                        <strong className="text-gray-700">Subjects</strong>
                      </div>
                      <span
                        className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap"
                        title={exam.subjects?.join(', ') || 'N/A'}
                      >
                        :{' '}
                        {(exam.subjects && exam.subjects.length > 0
                          ? exam.subjects
                          : ['N/A']
                        ).join(', ')}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-[#ED1334] font-semibold text-base sm:text-lg truncate">
                        {exam['attempt-status'] ? 'Attempted' : 'Unattempted'}
                      </p>
                      {exam['attempt-status'] ? (
                        <img
                          src="/ExamModule/tick-mark.svg"
                          alt="Completed"
                          className="w-8 sm:w-10 h-6 sm:h-8"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faXmark}
                          className="w-6 sm:w-8 h-6 sm:h-8 text-red-600"
                          title="Unattempted"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {finishedTotalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Stack spacing={2}>
                  <Pagination
                    count={finishedTotalPages}
                    page={finishedPage}
                    onChange={(e, page) => setFinishedPage(page)}
                    variant="outlined"
                    shape="rounded"
                  />
                </Stack>
              </div>
            )}
          </div>
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <InstructionsModal
            onClose={() => setShowInstructions(false)}
            onAgree={handleStartExam}
          />
        )}
      </div>
      <div className="block lg:hidden">
        <MobileWarningCard />
      </div>
    </>
  );
};

export default ExamDashboard;
