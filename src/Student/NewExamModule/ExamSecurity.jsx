import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  setExamStarted,
  setIsSubmitted,
  setShowSubmitConfirm,
  submitExam,
  clearExamState,
} from '../../reducers/examModuleSlice';

const ExamSecurity = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitted, examStarted, examData } = useSelector(
    state => state.examModule
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showViolation, setShowViolation] = useState(false);
  const [escPressCount, setEscPressCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [restrictKeys] = useState(true);
  const [restrictRightClick] = useState(true);
  const [restrictTabSwitch] = useState(true);
  const [enforceFullScreen] = useState(true);
  const examContainerRef = useRef(null);
  const { examId = '', examName = '' } = examData?.[1]?.exam || {};

  useEffect(() => {
    const handleRefreshViolation = async () => {
      if (sessionStorage.getItem('examSubmittedDueToRefresh')) {
        setShowViolation(true);
        setTimeout(() => {
          handleSubmission();
        }, 5000);
        return true;
      }
      return false;
    };

    const startExam = async () => {
      if (
        location.pathname !== '/conduct-exam' &&
        location.pathname !== '/conduct-exam/'
      ) {
        return;
      }
      setErrorMessage(''); // Clear any existing error message

      // Check if examData is valid
      if (
        !examData ||
        !examData[1]?.exam ||
        !examData[1].exam.examId ||
        !examData[1].exam.examName
      ) {
        setErrorMessage('No exam data available. Redirecting to dashboard.');
        // Navigate to exam-dashboard immediately or rely on error modal
        navigate('/exam-dashboard', { replace: true });
        return;
      }

      try {
        if (examContainerRef.current && !document.fullscreenElement) {
          try {
            await examContainerRef.current.requestFullscreen();
            setIsFullScreen(true);
            dispatch(setExamStarted(true));
          } catch (err) {
            console.error('Fullscreen request failed:', err);
            setErrorMessage(
              'Fullscreen mode is required to start the exam. Please enable fullscreen or use a supported browser.'
            );
          }
        } else if (!examContainerRef.current) {
          console.error('Exam container not found');
          setErrorMessage(
            'Unable to start exam: Container not found. Please contact support.'
          );
        }
      } catch (err) {
        console.error('Unexpected error in startExam:', err);
        setErrorMessage(
          'An unexpected error occurred. Please try again or contact support.'
        );
      }
    };

    handleRefreshViolation().then(isRefreshViolation => {
      if (!isRefreshViolation) {
        startExam();
      }
    });
  }, [dispatch, navigate, location.pathname, examData]);

  const handleSubmission = async () => {
    setShowConfirm(false);
    setShowViolation(false);
    dispatch(setIsSubmitted(true));
    dispatch(setExamStarted(false));
    dispatch(setShowSubmitConfirm(true));

    try {
      const resultAction = await dispatch(submitExam()).unwrap();
      if (resultAction.success) {
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(err => {
            console.error('Failed to exit fullscreen:', err);
          });
        }

        // Validate examName and examId
        if (!examName || !examId) {
          console.error('Missing examName or examId:', { examName, examId });
          navigate('/student/reports', {
            state: { error: 'Invalid exam data' },
          });
          return;
        }

        // Construct and log the target path
        const targetPath = `/student/reports/daily/${encodeURIComponent(examName)}`;

        // Navigate to the exam analysis page
        navigate(targetPath, {
          state: { analysis: resultAction?.data, examId },
          replace: false,
        });

        // Clear exam state and set sessionStorage after successful navigation
        dispatch(clearExamState());
        sessionStorage.setItem('examSubmittedDueToRefresh', 'true');
      } else {
        navigate('/student/reports', {
          state: { error: 'Submission failed', details: resultAction },
        });
      }
    } catch (error) {
      navigate('/student/reports', {
        state: { error: 'Submission error', details: error.message },
      });
    }
  };

  useEffect(() => {
    const handleFullScreenChange = async () => {
      if (!document.fullscreenElement && examStarted && !isSubmitted) {
        setIsFullScreen(false);
        const allowedEscPresses = 100;

        if (escPressCount < allowedEscPresses - 1) {
          setShowConfirm(true);
          setEscPressCount(prev => prev + 1);

          if (enforceFullScreen) {
            try {
              if (examContainerRef.current) {
                await examContainerRef.current.requestFullscreen();
                setIsFullScreen(true);
              }
            } catch (err) {
              console.error('Failed to re-enter fullscreen:', err);
            }
          }
        } else {
          if (enforceFullScreen) {
            try {
              if (examContainerRef.current) {
                await examContainerRef.current.requestFullscreen();
                setIsFullScreen(true);
              }
            } catch (err) {
              console.error('Final fullscreen request failed:', err);
              if (restrictTabSwitch) {
                setShowViolation(true);
                setTimeout(() => handleSubmission(), 2000);
              }
            }
          } else {
            handleSubmission();
          }
        }
      } else if (document.fullscreenElement) {
        setIsFullScreen(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [
    escPressCount,
    examStarted,
    isSubmitted,
    enforceFullScreen,
    restrictTabSwitch,
  ]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (
        event.key === 'Escape' &&
        isFullScreen &&
        examStarted &&
        !isSubmitted
      ) {
        event.preventDefault();
        if (document.fullscreenElement) {
          document
            .exitFullscreen()
            .catch(err => console.error('Failed to exit fullscreen:', err));
        }
        return;
      }

      if (!restrictKeys) return;

      if (
        event.key === ' ' &&
        document.activeElement.classList.contains('cm-content')
      ) {
        return;
      }

      if (
        [
          'F1',
          'F2',
          'F3',
          'F4',
          'F5',
          'F6',
          'F7',
          'F8',
          'F9',
          'F10',
          'F11',
          'F12',
        ].includes(event.key)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key === 'PrintScreen') {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        const restrictedCtrlKeys = [
          'a',
          'A',
          'b',
          'B',
          'c',
          'C',
          'd',
          'D',
          'e',
          'E',
          'f',
          'F',
          'g',
          'G',
          'i',
          'I',
          'j',
          'J',
          'h',
          'H',
          'k',
          'K',
          'l',
          'L',
          'm',
          'M',
          'n',
          'N',
          'o',
          'O',
          'p',
          'P',
          'r',
          'R',
          's',
          'S',
          't',
          'T',
          'u',
          'U',
          'v',
          'V',
          'w',
          'W',
          'x',
          'X',
          'y',
          'Y',
          'z',
          'Z',
          '[',
          ']',
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '9',
          'Home',
          'End',
          'Left',
          'Right',
          'Up',
          'Down',
          'Delete',
          'Backspace',
          'Space',
          ':',
          ';',
          '@',
          '!',
          '$',
          '#',
          '%',
          '^',
          'q',
          'Q',
          '+',
          '-',
        ];

        if (restrictedCtrlKeys.includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();

          return;
        }

        if (event.shiftKey) {
          const restrictedCtrlShiftKeys = [
            'l',
            'L',
            'f',
            'F',
            '>',
            '<',
            '*',
            ':',
            ';',
            '@',
            '!',
            '$',
            '#',
            '%',
            '^',
            'r',
            'R',
            'n',
            'N',
            'w',
            'W',
            't',
            'T',
            'i',
            'I',
            'c',
            'C',
            'j',
            'J',
            'Esc',
            'e',
            'E',
          ];

          if (
            restrictedCtrlShiftKeys.includes(event.key) ||
            event.key === 'Tab'
          ) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }

        if (event.altKey) {
          const restrictedCtrlAltKeys = ['1', '2', '3', 'F2', 'Tab'];

          if (restrictedCtrlAltKeys.includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }

      if (event.altKey) {
        const restrictedAltKeys = [
          'Tab',
          'Left',
          'Right',
          'PageUp',
          'PageDown',
          'F1',
          'F2',
          'F4',
          'F8',
          'F11',
        ];

        if (restrictedAltKeys.includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }

      const allowedKeys = [
        'Backspace',
        'Delete',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Shift',
        'CapsLock',
        ' ',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ];
      const isAlphanumeric = /^[a-zA-Z0-9]$/.test(event.key);
      const isPunctuation = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]$/.test(
        event.key
      );
      const isTabInInput =
        event.key === 'Tab' &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.classList.contains('cm-content'));

      if (
        allowedKeys.includes(event.key) ||
        isAlphanumeric ||
        isPunctuation ||
        isTabInInput
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    const handleBeforeUnload = event => {
      if (examStarted && !isSubmitted) {
        event.preventDefault();
        event.returnValue =
          'You are attempting to leave or quit the exam. This will submit your answers automatically.';
        sessionStorage.setItem('examSubmittedDueToRefresh', 'true');
        setShowViolation(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener(
      'wheel',
      event => {
        if (!restrictKeys) return;
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
    document.addEventListener('contextmenu', event => {
      if (restrictRightClick && examStarted && !isSubmitted) {
        event.preventDefault();
      }
    });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', event => {});
      document.removeEventListener('contextmenu', event => {});
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    isFullScreen,
    examStarted,
    isSubmitted,
    restrictKeys,
    restrictRightClick,
    handleSubmission,
  ]);

  useEffect(() => {
    if (!examStarted || isSubmitted || !restrictTabSwitch) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowViolation(true);
        setTimeout(() => {
          handleSubmission();
        }, 2000);
      }
    };

    const handleBlur = () => {
      if (
        !showViolation &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        setShowViolation(true);
        setTimeout(() => {
          handleSubmission();
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examStarted, isSubmitted, showViolation, restrictTabSwitch]);

  const handleConfirmYes = () => {
    handleSubmission();
  };

  const handleConfirmNo = async () => {
    setShowConfirm(false);
    try {
      if (examContainerRef.current && enforceFullScreen) {
        await examContainerRef.current.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch (err) {
      console.error('Failed to re-enter fullscreen:', err);
      setErrorMessage('Failed to re-enter fullscreen mode.');
    }
  };
  return (
    <div
      ref={examContainerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-5 rounded-lg text-center max-w-sm w-[90%] shadow-lg">
            <h2 className="mb-2.5 text-2xl text-[#183B56] font-['Inter']">
              Error
            </h2>
            <p className="mb-5 text-gray-800 font-['Inter']">{errorMessage}</p>
            <button
              onClick={() => {
                setErrorMessage('');

                navigate('/exam-dashboard', { replace: true });
              }}
              className="px-5 py-2.5 bg-[#00007F] text-white rounded hover:bg-[#000066] font-['Inter'] text-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-5 rounded-lg text-center max-w-sm w-[90%] shadow-lg">
            <h2 className="mb-2.5 text-2xl text-[#183B56] font-['Inter']">
              Quit Exam?
            </h2>
            <p className="mb-5 text-gray-800 font-['Inter']">
              Are you sure you want to quit the exam? This will submit your
              answers.
            </p>
            <div className="flex justify-center gap-2.5">
              <button
                onClick={handleConfirmYes}
                className="px-5 py-2.5 bg-[#F04438] text-white rounded hover:bg-[#d73a31] font-['Inter']"
              >
                Yes
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
      {showViolation && (
        <div className="fixed inset-0 bg-black flex justify-center items-center z-[1000]">
          <div className="bg-white p-5 rounded-lg text-center max-w-sm w-[90%] shadow-lg">
            <h2 className="mb-2.5 text-2xl text-[#183B56] font-['Inter']">
              Violation Detected
            </h2>
            <p className="mb-5 text-gray-800 font-['Inter']">
              You have violated the rules. Submitting exam...
            </p>
            <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-[#F04438] rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      {examStarted && !showViolation && !isSubmitted && children}
    </div>
  );
};

export default ExamSecurity;
