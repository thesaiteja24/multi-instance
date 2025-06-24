import React, { useState, useEffect, memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView } from '@codemirror/view';
import '../../index.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsOutputVisible,
  setIsMinimized,
  setMode,
  setInitialTab,
  setQuestionStatus,
  setQuestionCode,
  runCode,
} from '../../reducers/examModuleSlice';

const disableClipboardAndDragExtension = EditorView.domEventHandlers({
  paste(event) {
    event.preventDefault();
    return true;
  },
  copy(event) {
    event.preventDefault();
    return true;
  },
  cut(event) {
    event.preventDefault();
    return true;
  },
  dragstart(event) {
    event.preventDefault();
    return true;
  },
  drop(event) {
    event.preventDefault();
    return true;
  },
});

const getLanguageExtension = subject => {
  const normalized = subject?.toLowerCase() || '';

  if (normalized.includes('java')) return java();
  if (normalized.includes('python')) return python();
  if (normalized.includes('c++') || normalized.includes('cpp')) return cpp();
  if (normalized.includes('c')) return cpp(); // cpp() works for C too

  return python(); // default fallback
};

const MainContent = ({ setCodeCallback, setCurrentQuestionCallback }) => {
  const dispatch = useDispatch();
  const {
    activeTab,
    codingSidebarWidth,
    mcqQuestions,
    codingQuestions,
    selectedMcqId,
    selectedCodingId,
    selectedMCQ,
    questionStatuses,
    examStarted,
    isSubmitted,
    studentExamId,
    codeByQuestion,
    isOutputVisible,
    isMinimized,
    selectedSubject,
    examData,
  } = useSelector(state => state.examModule);

  const currentQuestion = selectedMCQ
    ? mcqQuestions.find(q => q.questionId === selectedMcqId)
    : codingQuestions.find(q => q.questionId === selectedCodingId);

  const initialCode =
    currentQuestion && !selectedMCQ
      ? codeByQuestion[selectedCodingId] || currentQuestion.Sample_Code || ''
      : '';
  const [code, setCode] = useState(initialCode);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [restrictionsEnabled] = useState(true);
  const [displayedQuestion, setDisplayedQuestion] = useState(null);

  useEffect(() => {
    if (typeof setCodeCallback === 'function') {
      setCodeCallback(code);
    }
    if (typeof setCurrentQuestionCallback === 'function') {
      setCurrentQuestionCallback(currentQuestion);
    }
  }, [
    activeTab,
    mcqQuestions,
    codingQuestions,
    selectedMcqId,
    selectedCodingId,
    selectedMCQ,
    questionStatuses,
    code,
    codeByQuestion,
    isOutputVisible,
    isMinimized,
    setCodeCallback,
    setCurrentQuestionCallback,
    currentQuestion,
  ]);

  useEffect(() => {
    if (selectedMCQ && currentQuestion) {
      const questionId = `mcq_${currentQuestion.questionId}`;
      const status = questionStatuses[questionId] || { selectedOption: -1 };
      setSelectedOption(status.selectedOption);
    }
  }, [selectedMcqId, selectedMCQ, currentQuestion, questionStatuses]);

  useEffect(() => {
    if (!selectedMCQ && currentQuestion && selectedCodingId) {
      const newCode =
        codeByQuestion[selectedCodingId] || currentQuestion.Sample_Code || '';
      setCode(newCode);
    }
  }, [selectedCodingId, selectedMCQ, currentQuestion, codeByQuestion]);

  useEffect(() => {
    if (currentQuestion && typeof setCurrentQuestionCallback === 'function') {
      // Filter questions based on selected subject
      const paper = examData?.[1]?.exam?.paper?.find(
        p => p.subject === selectedSubject
      );
      let filteredQuestions = [];
      let mcqCounter = 1;
      let codingCounter = 1;

      if (paper) {
        if (selectedMCQ) {
          filteredQuestions = (paper.MCQs || []).map(mcq => ({
            ...mcq,
            displayNumber: mcqCounter++,
          }));
        } else {
          filteredQuestions = (paper.Coding || []).map(coding => ({
            ...coding,
            displayNumber: codingCounter++,
          }));
        }
      }

      // Find the current question in filtered questions
      const currentIndex = filteredQuestions.findIndex(
        q => q.questionId === (selectedMCQ ? selectedMcqId : selectedCodingId)
      );
      const displayNumber =
        currentIndex >= 0
          ? currentIndex + 1
          : currentQuestion.displayNumber || currentQuestion.Question_No;

      const questionWithDisplayNumber = {
        ...currentQuestion,
        displayNumber,
      };
      setCurrentQuestionCallback(questionWithDisplayNumber);
      setDisplayedQuestion(questionWithDisplayNumber);
    } else {
      setDisplayedQuestion(null);
    }
  }, [
    currentQuestion,
    setCurrentQuestionCallback,
    selectedMCQ,
    selectedMcqId,
    selectedCodingId,
    examData,
    selectedSubject,
  ]);

  const handleCodeChange = value => {
    setCode(value);
    if (selectedCodingId) {
      dispatch(setQuestionCode({ questionId: selectedCodingId, code: value }));
    }
  };

  const codeMirrorExtensions = [python(), EditorView.lineWrapping];
  if (restrictionsEnabled) {
    codeMirrorExtensions.push(disableClipboardAndDragExtension);
  }

  const handleOptionClick = index => {
    setSelectedOption(index);
    if (currentQuestion) {
      const questionId = `mcq_${currentQuestion.questionId}`;
      dispatch(
        setQuestionStatus({
          questionId,
          isAnswered: true,
          isMarked: false,
          selectedOption: index,
        })
      );
    }
  };

  const handleCompileAndRun = async () => {
    if (!examStarted || isSubmitted) {
      return;
    }

    if (!currentQuestion || !code) {
      return;
    }

    dispatch(setIsOutputVisible(true));
    dispatch(setIsMinimized(false));

    const processedHiddenTestCases = currentQuestion.Hidden_Test_Cases
      ? currentQuestion.Hidden_Test_Cases.map(tc => ({
          ...tc,
          Input:
            typeof tc.Input === 'string'
              ? tc.Input.replace(/\r/g, '')
                  .split('\n')
                  .map(line => line.trim())
                  .join('\n')
              : String(tc.Input),
          Output:
            typeof tc.Output === 'string'
              ? tc.Output.replace(/\r/g, '')
                  .split('\n')
                  .map(line => line.trimEnd())
                  .join('\n')
              : String(tc.Output),
        }))
      : [];

    const processedSampleInput =
      typeof currentQuestion.Sample_Input === 'string'
        ? currentQuestion.Sample_Input.replace(/\r/g, '')
            .split('\n')
            .map(line => line.trim())
            .join('\n')
        : String(currentQuestion.Sample_Input);

    const processedSampleOutput =
      typeof currentQuestion.Sample_Output === 'string'
        ? currentQuestion.Sample_Output.replace(/\r/g, '')
            .split('\n')
            .map(line => line.trimEnd())
            .join('\n')
        : String(currentQuestion.Sample_Output);

    const payload = {
      question_id: currentQuestion.questionId,
      source_code: code,
      language: currentQuestion.Subject?.toLowerCase().includes('java')
        ? 'java'
        : currentQuestion.Subject?.toLowerCase().includes('python')
          ? 'python'
          : currentQuestion.Subject?.toLowerCase().includes('c')
            ? 'c'
            : 'unknown',
      custom_input_enabled: false,
      custom_input: '',
      constraints: currentQuestion.Constraints || '',
      description: currentQuestion.Question || '',
      difficulty: currentQuestion.difficulty || 'Easy',
      hidden_test_cases: processedHiddenTestCases,
      sample_input: processedSampleInput,
      sample_output: processedSampleOutput,
      score: currentQuestion.score || 5,
      type: 'code',
    };

    dispatch(runCode(payload));
  };

  const handleCustomInput = () => {
    dispatch(setInitialTab('Custom Input'));
    dispatch(setIsOutputVisible(true));
    dispatch(setIsMinimized(false));
  };

  return (
    <div
      className={`main-content overflow-y-auto will-change-width ${
        activeTab === 'Quiz'
          ? 'flex-1 bg-[#F0F7FF] p-3 sm:p-4 rounded-tl-[1rem] h-full'
          : 'flex-1 h-full'
      }`}
      style={
        activeTab === 'Coding' ? { width: `${100 - codingSidebarWidth}%` } : {}
      }
    >
      {activeTab === 'Quiz' ? (
        mcqQuestions.length === 0 ? (
          <div className="flex flex-col w-full h-full bg-white rounded-[0.5rem] p-3 sm:p-4 gap-3 overflow-y-auto items-center justify-center">
            <span className="font-inter font-medium text-base sm:text-lg text-black">
              No MCQ questions available.
            </span>
          </div>
        ) : displayedQuestion ? (
          <div className="flex flex-col w-full bg-white rounded-[0.5rem] p-3 sm:p-4 gap-3 overflow-y-auto">
            <div className="flex flex-col w-full gap-1.5">
              <span className="font-inter font-medium text-sm sm:text-base text-black">
                QUESTIONS
              </span>
              <div className="flex flex-row gap-1.5 w-full">
                <span className="font-inter font-medium text-sm sm:text-base text-black">
                  {displayedQuestion.displayNumber ||
                    displayedQuestion.Question_No ||
                    'N/A'}
                  .
                </span>
                <pre className="flex-1 font-[Inter] font-medium text-sm sm:text-base text-black whitespace-pre-wrap break-words">
                  {displayedQuestion.Question}
                  {displayedQuestion.Code_Snippet && (
                    <>{displayedQuestion.Code_Snippet}</>
                  )}
                </pre>
              </div>
              {displayedQuestion.Image_URL && (
                <img
                  src={displayedQuestion.Image_URL}
                  alt="Question Visual"
                  className="w-full max-w-[450px] rounded-md border border-gray-300 object-contain mt-2"
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayedQuestion.Options &&
                Object.entries(displayedQuestion.Options).map(
                  ([key, option], index) => (
                    <div
                      key={key}
                      className="flex items-center w-full bg-white rounded-[0.5rem] p-2 sm:p-3 gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOptionClick(index)}
                    >
                      <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-[#00007F] rounded-full"></div>
                        {selectedOption === index && (
                          <div className="absolute w-[10px] h-[10px] bg-[#00007F] rounded-full" />
                        )}
                      </div>
                      <span className="font-inter font-medium text-sm sm:text-base text-[#313131]">
                        {key}.{' '}
                        {typeof option === 'object'
                          ? JSON.stringify(option)
                          : option}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full bg-white rounded-[0.5rem] p-3 sm:p-4 gap-3 overflow-y-auto items-center justify-center">
            <span className="font-inter font-medium text-base sm:text-lg text-black">
              No MCQ questions available.
            </span>
          </div>
        )
      ) : activeTab === 'Coding' ? (
        codingQuestions.length === 0 ? (
          <div className="flex flex-col w-full h-full bg-black rounded-[0.5rem] p-3 sm:p-4 gap-3 overflow-y-auto items-center justify-center">
            <span className="font-inter font-medium text-base sm:text-lg text-white">
              No coding questions available.
            </span>
          </div>
        ) : currentQuestion ? (
          <div className="flex flex-col w-full h-full bg-black">
            <div className="flex flex-row justify-between items-center w-full h-10 bg-[#EEEEEE] p-1.5 sticky top-0 z-10">
              <div className="flex items-center bg-[#00007F] text-white rounded px-2 py-0.5">
                <span className="text-xs sm:text-sm font-medium">
                  {(() => {
                    const subject =
                      currentQuestion.Subject?.toLowerCase() || '';
                    if (subject.includes('java')) return 'Java';
                    if (subject.includes('python')) return 'Python';
                    if (subject.includes('c++') || subject.includes('cpp'))
                      return 'C++';
                    if (subject === 'c') return 'C';
                    return currentQuestion.Subject || 'Unknown';
                  })()}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  className="flex items-center bg-[#00007F] text-white rounded px-2 py-0.5"
                  onClick={handleCustomInput}
                >
                  <span className="text-xs sm:text-sm font-medium">
                    Custom Input
                  </span>
                </button>
                <button
                  className="flex items-center bg-[#00007F] text-white rounded px-2 py-0.5"
                  onClick={handleCompileAndRun}
                >
                  <span className="text-xs sm:text-sm font-medium">
                    Compile & Run
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <CodeMirror
                value={code}
                height="calc(100% - 2.5rem)"
                theme="dark"
                extensions={[
                  getLanguageExtension(currentQuestion?.Subject),
                  EditorView.lineWrapping,
                  ...(restrictionsEnabled
                    ? [disableClipboardAndDragExtension]
                    : []),
                ]}
                onChange={handleCodeChange}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: false,
                  highlightActiveLineGutter: false,
                  foldGutter: false,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  autocompletion: !restrictionsEnabled,
                }}
                style={{ fontSize: '1rem', fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full bg-black rounded-[0.5rem] p-3 sm:p-4 gap-3 overflow-y-auto items-center justify-center">
            <span className="font-inter font-medium text-base sm:text-lg text-white">
              No coding questions available.
            </span>
          </div>
        )
      ) : (
        <div className="flex flex-col w-full h-full bg-white rounded-[0.5rem] p-3 sm:p-4 gap-3 overflow-y-auto items-center justify-center">
          <span className="font-inter font-medium text-base sm:text-lg text-black">
            Select a tab to view questions.
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(MainContent);
