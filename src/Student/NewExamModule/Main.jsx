import React, { useEffect, useState } from 'react';
import { BsFlagFill } from 'react-icons/bs';
import { IoMdArrowDropleft, IoMdArrowDropright } from 'react-icons/io';
import './NewExam.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import InternetStatus from './InternetStatus';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsSubmitted,
  setExamStarted,
  setShowSubmitConfirm,
  setActiveTab,
  setSelectedMCQ,
  setSelectedMcqId,
  setSelectedCodingId,
  setQuestionStatus,
  createExam,
  submitExam,
  clearExamState,
} from '../../reducers/examModuleSlice';
import { useNavigate } from 'react-router-dom';

const Main = ({ isPaused = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profilePicture, studentId } = useSelector(state => state.student);
  const {
    isSubmitted,
    showSubmitConfirm,
    activeTab,
    selectedMcqId,
    selectedCodingId,
    mcqQuestions,
    codingQuestions,
    questionStatuses,
    startExamLoading,
    startExamError,
    examStarted,
    examData,
  } = useSelector(state => state.examModule);

  const { examId = '', examName = '' } = examData?.[1]?.exam || {};

  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [code, setCode] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [useServerTime, setUseServerTime] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const secondsToTime = totalSeconds => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const initializeServerTime = async () => {
    if (useServerTime) {
      try {
        const response = await fetch('https://time.scubey.com/codegnantime');
        const data = await response.json();
        return new Date(data.server_time);
      } catch (err) {
        console.error('Failed to fetch server time:', err);
        return new Date();
      }
    }
    return new Date();
  };

  // Initialize exam start and end time, fetch server time once
  useEffect(() => {
    if (examStarted && examData?.[1]?.exam && !endTime) {
      const { startDate, startTime, totalExamTime } = examData[1].exam;
      if (startDate && startTime && totalExamTime) {
        const [year, month, day] = startDate.split('-').map(Number);
        const [hours, minutes] = startTime.split(':').map(Number);
        const examStartTime = new Date(year, month - 1, day, hours, minutes, 0);
        const examEndTime = new Date(
          examStartTime.getTime() + totalExamTime * 60 * 1000
        );
        setEndTime(examEndTime);

        initializeServerTime().then(currentTime => {
          const seconds = Math.max(
            Math.floor((examEndTime - currentTime) / 1000),
            0
          );
          setRemainingSeconds(seconds);
          setTime(secondsToTime(seconds));
          if (seconds === 0) {
            handleConfirmYes();
          }
        });
      }
    }
  }, [examStarted, examData, endTime]);

  // Local countdown timer
  useEffect(() => {
    if (
      isSubmitted ||
      isPaused ||
      !examStarted ||
      !endTime ||
      remainingSeconds <= 0
    )
      return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        const newSeconds = Math.max(prev - 1, 0);
        setTime(secondsToTime(newSeconds));
        if (newSeconds === 0) {
          handleConfirmYes();
        }
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isPaused, examStarted, endTime, remainingSeconds]);

  // Start exam effect
  useEffect(() => {
    if (!examStarted && !startExamLoading && !startExamError) {
      const timer = setTimeout(() => {
        dispatch(
          createExam({
            examId: examId,
            collectionName: examName,
          })
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [dispatch, examStarted, startExamLoading, startExamError]);

  // Add blinking effect for timer
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .blink {
        animation: blink 1s infinite;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.2; }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const getUniqueSubjects = () => {
    if (!examData?.[1]?.exam?.paper) return [];
    return [...new Set(examData[1].exam.paper.map(paper => paper.subject))];
  };

  const getFilteredQuestions = (subject, type) => {
    if (!examData?.[1]?.exam?.paper) return [];
    const paper = examData[1].exam.paper.find(p => p.subject === subject);
    if (!paper) return [];
    let counter = 1;
    if (type === 'Quiz') {
      return (paper.MCQs || []).map(mcq => ({
        ...mcq,
        displayNumber: counter++,
      }));
    } else {
      return (paper.Coding || []).map(coding => ({
        ...coding,
        displayNumber: counter++,
      }));
    }
  };

  const getCurrentPosition = () => {
    const subjects = getUniqueSubjects();
    let currentSubject = '';
    let questionType = activeTab;
    let questionId = activeTab === 'Quiz' ? selectedMcqId : selectedCodingId;

    for (const subject of subjects) {
      const mcqs = getFilteredQuestions(subject, 'Quiz');
      const coding = getFilteredQuestions(subject, 'Coding');
      if (
        activeTab === 'Quiz' &&
        mcqs.some(q => q.questionId === selectedMcqId)
      ) {
        currentSubject = subject;
        break;
      } else if (
        activeTab === 'Coding' &&
        coding.some(q => q.questionId === selectedCodingId)
      ) {
        currentSubject = subject;
        break;
      }
    }
    return { currentSubject, questionType, questionId };
  };

  const findNextQuestion = (direction = 'next') => {
    const subjects = getUniqueSubjects();
    const { currentSubject, questionType, questionId } = getCurrentPosition();
    const currentSubjectIndex = subjects.indexOf(currentSubject);

    if (!currentSubject || currentSubjectIndex === -1) {
      if (direction === 'next') {
        for (const subject of subjects) {
          const mcqs = getFilteredQuestions(subject, 'Quiz');
          if (mcqs.length > 0) {
            return { subject, type: 'Quiz', questionId: mcqs[0].questionId };
          }
          const coding = getFilteredQuestions(subject, 'Coding');
          if (coding.length > 0) {
            return {
              subject,
              type: 'Coding',
              questionId: coding[0].questionId,
            };
          }
        }
      } else {
        for (let i = subjects.length - 1; i >= 0; i--) {
          const subject = subjects[i];
          const coding = getFilteredQuestions(subject, 'Coding');
          if (coding.length > 0) {
            return {
              subject,
              type: 'Coding',
              questionId: coding[coding.length - 1].questionId,
            };
          }
          const mcqs = getFilteredQuestions(subject, 'Quiz');
          if (mcqs.length > 0) {
            return {
              subject,
              type: 'Quiz',
              questionId: mcqs[mcqs.length - 1].questionId,
            };
          }
        }
      }
      return null;
    }

    const mcqs = getFilteredQuestions(currentSubject, 'Quiz');
    const coding = getFilteredQuestions(currentSubject, 'Coding');
    let currentIndex =
      questionType === 'Quiz'
        ? mcqs.findIndex(q => q.questionId === questionId)
        : coding.findIndex(q => q.questionId === questionId);

    if (direction === 'next') {
      if (questionType === 'Quiz') {
        if (currentIndex < mcqs.length - 1) {
          return {
            subject: currentSubject,
            type: 'Quiz',
            questionId: mcqs[currentIndex + 1].questionId,
          };
        }
        if (coding.length > 0) {
          return {
            subject: currentSubject,
            type: 'Coding',
            questionId: coding[0].questionId,
          };
        }
      } else {
        if (currentIndex < coding.length - 1) {
          return {
            subject: currentSubject,
            type: 'Coding',
            questionId: coding[currentIndex + 1].questionId,
          };
        }
      }
      if (currentSubjectIndex < subjects.length - 1) {
        for (let i = currentSubjectIndex + 1; i < subjects.length; i++) {
          const nextSubject = subjects[i];
          const nextMcqs = getFilteredQuestions(nextSubject, 'Quiz');
          if (nextMcqs.length > 0) {
            return {
              subject: nextSubject,
              type: 'Quiz',
              questionId: nextMcqs[0].questionId,
            };
          }
          const nextCoding = getFilteredQuestions(nextSubject, 'Coding');
          if (nextCoding.length > 0) {
            return {
              subject: nextSubject,
              type: 'Coding',
              questionId: nextCoding[0].questionId,
            };
          }
        }
      }
    } else {
      if (questionType === 'Coding') {
        if (currentIndex > 0) {
          return {
            subject: currentSubject,
            type: 'Coding',
            questionId: coding[currentIndex - 1].questionId,
          };
        }
        if (mcqs.length > 0) {
          return {
            subject: currentSubject,
            type: 'Quiz',
            questionId: mcqs[mcqs.length - 1].questionId,
          };
        }
      } else {
        if (currentIndex > 0) {
          return {
            subject: currentSubject,
            type: 'Quiz',
            questionId: mcqs[currentIndex - 1].questionId,
          };
        }
      }
      if (currentSubjectIndex > 0) {
        for (let i = currentSubjectIndex - 1; i >= 0; i--) {
          const prevSubject = subjects[i];
          const prevCoding = getFilteredQuestions(prevSubject, 'Coding');
          if (prevCoding.length > 0) {
            return {
              subject: prevSubject,
              type: 'Coding',
              questionId: prevCoding[prevCoding.length - 1].questionId,
            };
          }
          const prevMcqs = getFilteredQuestions(prevSubject, 'Quiz');
          if (prevMcqs.length > 0) {
            return {
              subject: prevSubject,
              type: 'Quiz',
              questionId: prevMcqs[prevMcqs.length - 1].questionId,
            };
          }
        }
      }
    }
    return null;
  };
  const handleConfirmYes = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      dispatch(setIsSubmitted(true));
      dispatch(setExamStarted(false));
      dispatch(setShowSubmitConfirm(false));

      const resultAction = await dispatch(submitExam()).unwrap();

      if (resultAction.success) {
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(err => {
            console.error('Failed to exit fullscreen:', err);
          });
        }
        const targetPath = `/student/reports/daily/${encodeURIComponent(examName)}`;
        navigate(targetPath, {
          state: { analysis: resultAction, examId },
          replace: false,
        });

        dispatch(clearExamState());
      } else {
        console.error(
          'Exam submission completed but success flag is false:',
          resultAction
        );
        navigate('/exam-dashboard');
      }
    } catch (error) {
      console.error('Exam submission failed:', error);
      navigate('/exam-dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmNo = () => {
    dispatch(setShowSubmitConfirm(false));
  };

  const confirmSubmitExam = () => {
    dispatch(setShowSubmitConfirm(true));
  };

  const handlePrevious = () => {
    const nextQuestion = findNextQuestion('previous');
    if (nextQuestion) {
      dispatch(setActiveTab(nextQuestion.type));
      dispatch(setSelectedMCQ(nextQuestion.type === 'Quiz'));
      if (nextQuestion.type === 'Quiz') {
        dispatch(setSelectedMcqId(nextQuestion.questionId));
        dispatch(setSelectedCodingId(null));
      } else {
        dispatch(setSelectedCodingId(nextQuestion.questionId));
        dispatch(setSelectedMcqId(null));
      }
    }
  };

  const handleNext = () => {
    const nextQuestion = findNextQuestion('next');
    if (nextQuestion) {
      dispatch(setActiveTab(nextQuestion.type));
      dispatch(setSelectedMCQ(nextQuestion.type === 'Quiz'));
      if (nextQuestion.type === 'Quiz') {
        dispatch(setSelectedMcqId(nextQuestion.questionId));
        dispatch(setSelectedCodingId(null));
      } else {
        dispatch(setSelectedCodingId(nextQuestion.questionId));
        dispatch(setSelectedMcqId(null));
      }
    }
  };

  const handleReview = () => {
    if (activeTab === 'Quiz' && mcqQuestions?.length > 0) {
      const currentQuestion = mcqQuestions.find(
        q => q.questionId === selectedMcqId
      );
      if (!currentQuestion) return;
      const questionId = `mcq_${currentQuestion.questionId}`;
      const currentStatus = questionStatuses[questionId] || {
        isAnswered: false,
        isMarked: false,
        selectedOption: -1,
      };
      dispatch(
        setQuestionStatus({
          questionId,
          isAnswered: currentStatus.isAnswered,
          isMarked: !currentStatus.isMarked,
          selectedOption: currentStatus.selectedOption,
        })
      );
    } else if (activeTab === 'Coding' && codingQuestions?.length > 0) {
      const currentQuestion = codingQuestions.find(
        q => q.questionId === selectedCodingId
      );
      if (!currentQuestion) return;
      const questionId = `code_${currentQuestion.questionId}`;
      const currentStatus = questionStatuses[questionId] || {
        isAnswered: false,
        isMarked: false,
        selectedOption: -1,
      };
      dispatch(
        setQuestionStatus({
          questionId,
          isAnswered: currentStatus.isAnswered,
          isMarked: !currentStatus.isMarked,
          selectedOption: currentStatus.selectedOption,
        })
      );
    }
  };

  const isPreviousDisabled = () => {
    if (isPaused) return true;
    return !findNextQuestion('previous');
  };

  const isNextDisabled = () => {
    if (isPaused) return true;
    return !findNextQuestion('next');
  };

  const getQuestionText = () => {
    const { currentSubject, questionType, questionId } = getCurrentPosition();
    const questions =
      questionType === 'Quiz'
        ? getFilteredQuestions(currentSubject, 'Quiz')
        : getFilteredQuestions(currentSubject, 'Coding');
    if (!questions || questions.length === 0) {
      return `No ${questionType === 'Quiz' ? 'MCQ' : 'Coding'} Questions`;
    }
    const currentIndex = questions.findIndex(q => q.questionId === questionId);
    if (currentIndex === -1) {
      return `Invalid ${questionType === 'Quiz' ? 'MCQ' : 'Coding'} Question Selection`;
    }
    return `Question ${currentIndex + 1} of ${questions.length}`;
  };

  const formatTime = value => String(value).padStart(2, '0');

  return (
    <div
      className={`bg-white font-[Inter] flex flex-col min-h-screen max-h-screen overflow-hidden w-full ${
        isPaused ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Full-screen loader during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
          <img src="/exam-logo.png" alt="Submitting..." className="w-32 mb-4" />
          <p className="text-xl text-gray-700 font-semibold animate-pulse">
            Submitting your test, please wait...
          </p>
        </div>
      )}

      {/* Main Content */}
      {startExamLoading ? (
        <div className="flex flex-1 items-center justify-center text-gray-600">
          Loading exam...
        </div>
      ) : startExamError ? (
        <div className="flex flex-1 items-center justify-center text-red-600">
          Error: {startExamError}
        </div>
      ) : isSubmitted ? (
        <div className="flex flex-1 items-center justify-center flex-col">
          <h2 className="text-2xl font-semibold text-green-600">
            Exam Submitted Successfully
          </h2>
          <p className="text-gray-700 mt-2">
            Your responses have been recorded.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="flex items-center justify-between w-full bg-white px-4 py-2 sm:px-6 md:px-8 lg:px-10 h-16 sm:h-[4.5rem]">
            <div className="flex-shrink-0">
              <img
                src="/exam-logo.png"
                alt="Codegnan Logo"
                className="w-28 sm:w-32 md:w-40 h-auto object-contain"
              />
            </div>

            <InternetStatus />

            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <button
                className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-[#F04438] border border-[#F04438] rounded-md shadow-sm"
                onClick={confirmSubmitExam}
                disabled={isPaused}
                aria-label="Submit Test"
              >
                <span className="text-white font-[Inter] font-semibold text-xs sm:text-sm">
                  Submit Test
                </span>
              </button>

              <div
                className={`flex items-end gap-1.5 sm:gap-2 ${
                  time.hours === 0 && time.minutes === 0 && time.seconds <= 30
                    ? 'blink'
                    : ''
                }`}
              >
                {/* Hours */}
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-[Inter] font-normal text-base sm:text-xl text-black leading-none">
                    {formatTime(time.hours)}
                  </span>
                  <span className="font-[Inter] font-light text-[0.5rem] sm:text-[0.625rem] text-black">
                    Hours
                  </span>
                </div>
                {/* Minutes */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-[Inter] font-normal text-base sm:text-xl text-black leading-none">
                    {formatTime(time.minutes)}
                  </span>
                  <span className="font-[Inter] font-light text-[0.5rem] sm:text-[0.625rem] text-black">
                    Minutes
                  </span>
                </div>
                {/* Seconds */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-[Inter] font-normal text-base sm:text-xl text-black leading-none">
                    {formatTime(time.seconds)}
                  </span>
                  <span className="font-[Inter] font-light text-[0.5rem] sm:text-[0.625rem] text-black">
                    Seconds
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <img
                  src={profilePicture}
                  alt="User Profile"
                  className="w-8 sm:h-9 md:w-10 h-8 md:h-10 rounded-full object-cover bg-[#D9D9D9]"
                />
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="w-full flex flex-row overflow-hidden h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.5rem)] bg-[#EEEEEE]">
            <Sidebar code={code} currentQuestion={currentQuestion} />
            <MainContent
              setCodeCallback={setCode}
              setCurrentQuestionCallback={setCurrentQuestion}
            />
          </div>

          {/* Footer */}
          <footer className="flex flex-col xl:flex-row items-center justify-between bg-white px-4 py-1 sm:px-6 sm:py-2 md:px-8 lg:px-10 w-full h-12 gap-1 xl:gap-0 shadow-[0px_0px_20px_#B3BAF7]">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center xl:justify-start gap-1 sm:gap-2 lg:gap-3">
              {/* Not answered */}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-sm bg-[#E1EFFF]" />
                <span className="text-[10px] text-black">Not answered</span>
              </div>
              {/* Mark for review */}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-sm bg-[#FF6000]" />
                <span className="text-[10px] text-black">Mark for review</span>
              </div>
              {/* Current */}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-sm bg-[#00007F]" />
                <span className="text-[10px] text-black">Current</span>
              </div>
              {/* Answered */}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-sm bg-[#129E00]" />
                <span className="text-[10px] text-black">Answered</span>
              </div>
              {/* Coding fail */}
              {activeTab === 'Coding' && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-sm bg-[#FF0000]" />
                  <span className="text-[10px] text-black">
                    Test Case Failed
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              {/* Review button */}
              <button
                className="w-16 sm:w-[4.5rem] md:w-20 h-6 sm:h-7 rounded-md border border-[#FF6000] bg-[#FF6000] flex items-center justify-center gap-1 shadow-sm"
                onClick={handleReview}
                disabled={
                  isPaused ||
                  (!mcqQuestions?.length && !codingQuestions?.length)
                }
                aria-label="Mark for Review"
              >
                <BsFlagFill className="text-white w-2.5 h-3.5" />
                <span className="text-white text-[10px] font-semibold">
                  Review
                </span>
              </button>

              {/* Question counter */}
              <div className="w-28 sm:w-32 md:w-36 h-6 sm:h-7 rounded-full border border-[#183B56] flex items-center justify-center">
                <span className="font-medium text-xs text-[#183B56] capitalize">
                  {getQuestionText()}
                </span>
              </div>

              {/* Prev / Next */}
              <div className="flex space-x-1 sm:space-x-1.5">
                <button
                  className="w-16 sm:w-[4.5rem] md:w-20 h-6 sm:h-7 rounded-md border border-[#00007F] bg-[#00007F] flex items-center justify-center gap-1 shadow-sm"
                  onClick={handlePrevious}
                  disabled={isPreviousDisabled()}
                  aria-label="Previous Question"
                >
                  <IoMdArrowDropleft className="text-white w-3.5 h-3.5" />
                  <span className="text-white text-[10px] font-semibold">
                    Previous
                  </span>
                </button>
                <button
                  className="w-16 sm:w-[4.5rem] md:w-20 h-6 sm:h-7 rounded-md border border-[#00007F] bg-[#00007F] flex items-center justify-center gap-1 shadow-sm"
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                  aria-label="Next Question"
                >
                  <span className="text-white text-[10px] font-semibold">
                    Next
                  </span>
                  <IoMdArrowDropright className="text-white w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </footer>

          {/* Submit Confirmation Dialog */}
          {showSubmitConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
              <div className="bg-white p-5 rounded-lg text-center max-w-sm w-[90%] shadow-lg">
                <h2 className="mb-2.5 text-2xl text-[#183B56] font-['Inter']">
                  Submit Exam?
                </h2>
                <p className="mb-5 text-gray-800 font-['Inter']">
                  Do you want to submit the exam?
                </p>
                {startExamError && (
                  <p className="text-red-500 mt-2">{startExamError}</p>
                )}
                <div className="flex justify-center gap-2.5">
                  <button
                    onClick={handleConfirmYes}
                    className="px-5 py-2.5 bg-[#F04438] text-white rounded hover:bg-[#d73a31] font-['Inter'] disabled:opacity-50"
                    disabled={startExamLoading || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Yes'}
                  </button>
                  <button
                    onClick={handleConfirmNo}
                    className="px-5 py-2.5 bg-[#00007F] text-white rounded hover:bg-[#000066] font-['Inter']"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Main;
