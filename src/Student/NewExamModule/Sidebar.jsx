import React, { useRef, useEffect, useState, memo } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { GrCodepen } from 'react-icons/gr';
import OutputPanel from './OutputPanel';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveTab,
  setCodingSidebarWidth,
  setSelectedMcqId,
  setSelectedCodingId,
  setSelectedMCQ,
  setSelectedSubject,
} from '../../reducers/examModuleSlice';

const Sidebar = ({ code, currentQuestion }) => {
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const questionGridRef = useRef(null);
  const isDraggingHorizontal = useRef(false);
  const containerWidthRef = useRef(0);
  const rafIdHorizontal = useRef(null);
  const outputPanelHeight = useRef(0);

  const {
    activeTab,
    codingSidebarWidth,
    isOutputVisible,
    examData,
    mcqQuestions,
    codingQuestions,
    selectedMcqId,
    selectedCodingId,
    questionStatuses,
    compileResults,
    selectedSubject,
  } = useSelector(state => state.examModule);

  // State for filtered questions
  const [filteredMcqQuestions, setFilteredMcqQuestions] = useState([]);
  const [filteredCodingQuestions, setFilteredCodingQuestions] = useState([]);

  // Extract unique subjects from examData
  const getUniqueSubjects = () => {
    if (!examData?.[1]?.exam?.paper) return [];
    const subjects = examData[1].exam.paper.map(paper => paper.subject);
    return [...new Set(subjects)];
  };

  const uniqueSubjects = getUniqueSubjects();

  // Initialize selected subject
  useEffect(() => {
    if (uniqueSubjects.length > 0 && !selectedSubject) {
      dispatch(setSelectedSubject(uniqueSubjects[0]));
    }
  }, [uniqueSubjects, selectedSubject, dispatch]);

  // Filter questions based on selected subject and set default question
  useEffect(() => {
    if (!examData?.[1]?.exam?.paper || !selectedSubject) return;

    const paper = examData[1].exam.paper.find(
      p => p.subject === selectedSubject
    );
    if (paper) {
      let mcqCounter = 1;
      let codingCounter = 1;
      const filteredMcqs = (paper.MCQs || []).map(mcq => ({
        ...mcq,
        displayNumber: mcqCounter++,
      }));
      const filteredCoding = (paper.Coding || []).map(coding => ({
        ...coding,
        displayNumber: codingCounter++,
      }));
      setFilteredMcqQuestions(filteredMcqs);
      setFilteredCodingQuestions(filteredCoding);

      // Set the first question of the selected subject as default
      if (activeTab === 'Quiz' && filteredMcqs.length > 0) {
        dispatch(setSelectedMcqId(filteredMcqs[0]?.questionId || null));
        dispatch(setSelectedMCQ(true));
      } else if (activeTab === 'Coding' && filteredCoding.length > 0) {
        dispatch(setSelectedCodingId(filteredCoding[0]?.questionId || null));
        dispatch(setSelectedMCQ(false));
      } else if (filteredMcqs.length > 0) {
        // If no coding questions, switch to Quiz tab
        dispatch(setActiveTab('Quiz'));
        dispatch(setSelectedMcqId(filteredMcqs[0]?.questionId || null));
        dispatch(setSelectedMCQ(true));
      } else if (filteredCoding.length > 0) {
        // If no MCQ questions, switch to Coding tab
        dispatch(setActiveTab('Coding'));
        dispatch(setSelectedCodingId(filteredCoding[0]?.questionId || null));
        dispatch(setSelectedMCQ(false));
      }
    } else {
      setFilteredMcqQuestions([]);
      setFilteredCodingQuestions([]);
    }
  }, [selectedSubject, examData, activeTab, dispatch]);

  const [gridColumns, setGridColumns] = useState(5);

  useEffect(() => {
    const updateGridColumns = () => {
      if (!sidebarRef.current || activeTab !== 'Coding') return;
      const sidebarWidth = sidebarRef.current.offsetWidth;
      const padding = window.innerWidth >= 640 ? 48 : 32;
      const availableWidth = sidebarWidth - padding;
      const itemWidth = 40;
      const gap = 8;
      const totalItemWidth = itemWidth + gap;
      const calculatedColumns = Math.floor(availableWidth / totalItemWidth);
      const columns = Math.max(3, Math.min(15, calculatedColumns));
      setGridColumns(columns);
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, [codingSidebarWidth, activeTab]);

  const handleTabSwitch = tab => {
    if (
      (tab === 'Quiz' && filteredMcqQuestions.length === 0) ||
      (tab === 'Coding' && filteredCodingQuestions.length === 0) ||
      activeTab === tab
    ) {
      return;
    }

    dispatch(setActiveTab(tab));
    dispatch(setSelectedMCQ(tab === 'Quiz'));
    if (tab === 'Quiz' && filteredMcqQuestions.length > 0) {
      dispatch(setSelectedMcqId(filteredMcqQuestions[0]?.questionId || null));
    } else if (tab === 'Coding' && filteredCodingQuestions.length > 0) {
      dispatch(
        setSelectedCodingId(filteredCodingQuestions[0]?.questionId || null)
      );
    }
  };

  const updateWidths = clientX => {
    if (
      !containerWidthRef.current ||
      !sidebarRef.current ||
      !mainContentRef.current
    )
      return;
    const containerLeft =
      sidebarRef.current.parentElement.getBoundingClientRect().left;
    const newWidthPx = clientX - containerLeft;
    const minWidthPx = containerWidthRef.current * 0.4;
    const maxWidthPx = containerWidthRef.current * 0.6;
    const constrainedWidthPx = Math.max(
      minWidthPx,
      Math.min(maxWidthPx, newWidthPx)
    );
    sidebarRef.current.style.width = `${
      (constrainedWidthPx / containerWidthRef.current) * 100
    }%`;
    mainContentRef.current.style.width = `${
      100 - (constrainedWidthPx / containerWidthRef.current) * 100
    }%`;
  };

  const handleMouseDownHorizontal = e => {
    e.preventDefault();
    isDraggingHorizontal.current = true;
    containerWidthRef.current = sidebarRef.current.parentElement.offsetWidth;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
  };

  const handleMouseMoveHorizontal = e => {
    if (!isDraggingHorizontal.current) return;
    e.preventDefault();
    if (rafIdHorizontal.current) {
      cancelAnimationFrame(rafIdHorizontal.current);
    }
    rafIdHorizontal.current = requestAnimationFrame(() => {
      updateWidths(e.clientX);
    });
  };

  const handleMouseUpHorizontal = () => {
    if (isDraggingHorizontal.current && sidebarRef.current) {
      const currentWidthPercent =
        parseFloat(sidebarRef.current.style.width) || codingSidebarWidth;
      dispatch(
        setCodingSidebarWidth(Math.max(20, Math.min(80, currentWidthPercent)))
      );
    }
    isDraggingHorizontal.current = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.msUserSelect = '';
    if (rafIdHorizontal.current) {
      cancelAnimationFrame(rafIdHorizontal.current);
      rafIdHorizontal.current = null;
    }
  };

  useEffect(() => {
    const updateOutputPanelHeight = () => {
      if (!sidebarRef.current || !questionGridRef.current) return;
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const questionGridRect = questionGridRef.current.getBoundingClientRect();
      if (!sidebarRect.height || !questionGridRect.height) return;
      const sidebarTop = sidebarRect.top;
      const questionGridBottom = questionGridRect.bottom;
      const availableHeight =
        sidebarRect.height - (questionGridBottom - sidebarTop);
      outputPanelHeight.current = Math.max(300, availableHeight);
    };

    const initialTimer = setTimeout(() => updateOutputPanelHeight(), 0);
    const fallbackTimer = setTimeout(updateOutputPanelHeight, 100);
    window.addEventListener('resize', updateOutputPanelHeight);
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', updateOutputPanelHeight);
    };
  }, [activeTab, isOutputVisible, filteredCodingQuestions, selectedCodingId]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMoveHorizontal);
    document.addEventListener('mouseup', handleMouseUpHorizontal);
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveHorizontal);
      document.removeEventListener('mouseup', handleMouseUpHorizontal);
      if (rafIdHorizontal.current) {
        cancelAnimationFrame(rafIdHorizontal.current);
      }
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, []);

  useEffect(() => {
    mainContentRef.current = document.querySelector('.main-content');
  }, []);

  const renderQuestionGrid = (questions, type) => {
    if (!questions || questions.length === 0) {
      return (
        <span className="text-[#212121] text-base">
          No {type === 'mcq' ? 'MCQ' : 'coding'} questions available
        </span>
      );
    }

    const sortedQuestions = [...questions].sort(
      (a, b) => a.displayNumber - b.displayNumber
    );

    const gridStyle =
      type === 'code'
        ? { gridTemplateColumns: `repeat(${gridColumns}, minmax(32px, 48px))` }
        : {};

    return (
      <div
        className={`grid gap-2 w-full ${type === 'mcq' ? 'grid-cols-5' : ''}`}
        style={gridStyle}
      >
        {sortedQuestions.map(q => {
          const isCurrent =
            type === 'mcq'
              ? q.questionId === selectedMcqId
              : q.questionId === selectedCodingId;
          const status = questionStatuses[`${type}_${q.questionId}`] || {
            isAnswered: false,
            isMarked: false,
            selectedOption: -1,
          };
          const compileResult =
            type === 'code'
              ? compileResults.find(r => r.question_id === q.questionId)
              : null;
          const hasFailedTestCase =
            type === 'code' &&
            compileResult?.results?.some(
              tc => tc.status.toLowerCase() === 'failed'
            );
          const styles = {
            current: {
              bg: '#00007F',
              color: '#FFFFFF',
              border: '2px solid #E4E4E4',
            },
            failed: { bg: '#FF0000', color: '#FFFFFF' },
            answered: { bg: '#129E00', color: '#FFFFFF' },
            marked: { bg: '#FF6000', color: '#FFFFFF' },
            default: { bg: '#E1EFFF', color: '#2D2D2D' },
          };
          const style = isCurrent
            ? styles.current
            : type === 'code' && hasFailedTestCase
              ? styles.failed
              : status.isAnswered
                ? styles.answered
                : status.isMarked
                  ? styles.marked
                  : styles.default;

          return (
            <div
              key={q.questionId}
              className="flex justify-center items-center w-full h-8 text-base leading-5 font-inter font-normal rounded-md cursor-pointer min-w-[32px] max-w-[48px] mx-auto"
              style={{
                backgroundColor: style.bg,
                color: style.color,
                border: style.border || 'none',
              }}
              onClick={() => {
                if (type === 'mcq' && q.questionId !== selectedMcqId) {
                  dispatch(setSelectedMcqId(q.questionId));
                  dispatch(setSelectedMCQ(true));
                  dispatch(setActiveTab('Quiz'));
                } else if (
                  type === 'code' &&
                  q.questionId !== selectedCodingId
                ) {
                  dispatch(setSelectedCodingId(q.questionId));
                  dispatch(setSelectedMCQ(false));
                  dispatch(setActiveTab('Coding'));
                }
              }}
            >
              {q.displayNumber}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCodingQuestionDetails = question => (
    <div className="flex flex-col w-full gap-5">
      <div className="w-full border-t-2 border-[#E5E5E5]" />
      <span className="text-[#212121] text-base sm:text-lg leading-6 font-normal">
        {question.Question}
      </span>
      {[
        ['Constraints', question.Constraints],
        ['Input', question.Sample_Input],
        ['Output', question.Sample_Output],
      ].map(([title, desc]) => (
        <div key={title} className="flex flex-col gap-1.5 w-full">
          <pre className="text-[#212121] text-base sm:text-lg font-bold">
            {title}
          </pre>
          {title === 'Output' ? (
            <pre className="text-[#212121] text-sm sm:text-base font-mono bg-[#f5f5f5] p-2 rounded">
              {String(desc)}
            </pre>
          ) : (
            <pre className="text-[#212121] text-sm sm:text-base whitespace-pre-line">
              {String(desc)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div
        ref={sidebarRef}
        className={`flex flex-col bg-white rounded-tl-lg h-full overflow-hidden will-change-width ${
          activeTab === 'Quiz' ? 'w-64 sm:w-72 md:w-80' : 'flex-shrink-0'
        }`}
        style={
          activeTab === 'Coding' ? { width: `${codingSidebarWidth}%` } : {}
        }
      >
        <div
          className={`flex flex-row w-full h-11 border-b-[3px] border-[#959595] sticky top-0 z-[100] gap-1 ${
            activeTab === 'Quiz' ? 'bg-white' : 'bg-[#EEEEEE]'
          }`}
        >
          {[
            { label: 'Quiz', value: 'Quiz', width: 'w-24 sm:w-28 md:w-32' },
            {
              label: 'Coding Problem',
              value: 'Coding',
              width: 'w-36 sm:w-40 md:w-48',
            },
          ].map(({ label, value, width }) => {
            const isDisabled =
              (value === 'Quiz' && filteredMcqQuestions.length === 0) ||
              (value === 'Coding' && filteredCodingQuestions.length === 0);
            return (
              <div
                key={value}
                onClick={() => handleTabSwitch(value)}
                className={`flex justify-center items-center ${width} h-full rounded-tl-[15px] rounded-tr-[15px] transition-colors duration-300 ${
                  isDisabled
                    ? 'bg-[#D3D3D3] opacity-50 cursor-not-allowed'
                    : activeTab === value
                      ? 'bg-[#00007F] shadow-[0_4px_2px_#B3BAF7] cursor-pointer'
                      : 'bg-[#BBBBBB] cursor-pointer hover:bg-[#A0A0A0]'
                }`}
              >
                <span className="font-inter font-semibold text-sm sm:text-base md:text-lg text-white">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        {activeTab === 'Quiz' ? (
          filteredMcqQuestions.length === 0 ? (
            <div className="flex flex-col w-full h-[calc(100%-3rem)] overflow-y-auto px-4 pt-3 gap-2 items-center justify-center">
              <span className="text-[#212121] text-base sm:text-lg">
                No MCQ questions available
              </span>
            </div>
          ) : (
            <div className="flex flex-col w-full h-[calc(100%-3rem)] overflow-y-auto px-4 pt-3 gap-2">
              <div className="text-center font-inter font-medium text-gray-700 text-sm sm:text-base">
                Select Section (MCQs)
              </div>
              <select
                value={selectedSubject}
                onChange={e => {
                  dispatch(setSelectedSubject(e.target.value));
                }}
                className="w-full bg-[#EFF0F7] rounded-md px-3 py-1.5 font-inter font-medium text-sm sm:text-base text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
              >
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {renderQuestionGrid(filteredMcqQuestions, 'mcq')}
            </div>
          )
        ) : activeTab === 'Coding' ? (
          filteredCodingQuestions.length === 0 ? (
            <div className="flex flex-col w-full h-[calc(100%-3rem)] overflow-y-auto px-4 pt-3 gap-2 items-center justify-center bg-[#EEEEEE]">
              <span className="text-[#212121] text-base sm:text-lg">
                No coding questions available
              </span>
            </div>
          ) : (
            <div className="flex flex-col w-full h-[calc(100%-3rem)] relative">
              <div
                ref={questionGridRef}
                className="flex justify-center px-4 py-4 sm:px-6 sm:py-5 w-full bg-[#F0F7FF] shadow-[0_2px_10px_#B3BAF7] sticky top-12 z-10"
              >
                <div className="flex flex-col w-full gap-4">
                  <div className="text-center font-inter font-medium text-gray-700 text-sm sm:text-base">
                    Select Coding Questions
                  </div>
                  <select
                    value={selectedSubject}
                    onChange={e => {
                      dispatch(setSelectedSubject(e.target.value));
                    }}
                    className="w-full bg-[#EFF0F7] rounded-md px-3 py-1.5 font-inter font-medium text-sm sm:text-base text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  >
                    {uniqueSubjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {renderQuestionGrid(filteredCodingQuestions, 'code')}
                </div>
              </div>
              <div className="flex flex-col w-full px-4 sm:px-6 py-4 bg-white gap-5 overflow-y-auto no-scrollbar">
                <div className="flex flex-row items-center gap-2 w-full">
                  <div className="flex flex-row items-center gap-2 w-full max-w-[140px] h-[30px]">
                    <GrCodepen className="w-6 h-6 text-[#212121]" />
                    <span className="font-inter font-medium text-xl sm:text-2xl text-[#212121]">
                      Problem
                    </span>
                  </div>
                </div>
                {filteredCodingQuestions.find(
                  q => q.questionId === selectedCodingId
                ) ? (
                  renderCodingQuestionDetails(
                    filteredCodingQuestions.find(
                      q => q.questionId === selectedCodingId
                    )
                  )
                ) : (
                  <span className="text-[#212121] text-base sm:text-lg">
                    Select a coding question
                  </span>
                )}
              </div>
              <OutputPanel
                outputPanelHeight={outputPanelHeight}
                code={code}
                currentQuestion={currentQuestion}
              />
            </div>
          )
        ) : (
          <div className="flex flex-col w-full h-[calc(100%-3rem)] overflow-y-auto px-4 pt-3 gap-2 items-center justify-center">
            <span className="text-[#212121] text-base sm:text-lg">
              Select a tab to view questions
            </span>
          </div>
        )}
      </div>
      {activeTab === 'Coding' && (
        <div className="splitter mt-10" onMouseDown={handleMouseDownHorizontal}>
          <div className="splitter-handle">
            <div className="splitter-line"></div>
            <div className="splitter-line"></div>
            <div className="splitter-line"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Sidebar);
