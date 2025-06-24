import React, { useRef, useState, useEffect } from 'react';
import { IoClose, IoChevronUp, IoChevronDown } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import {
  setIsOutputVisible,
  setIsMinimized,
  setMode,
  setInitialTab,
  runCode,
} from '../../reducers/examModuleSlice';

const OutputPanel = ({ outputPanelHeight, code, currentQuestion }) => {
  const dispatch = useDispatch();
  const {
    isOutputVisible,
    isMinimized,
    mode,
    initialTab,
    examStarted,
    isSubmitted,
    compileResults,
    customInputResults,
    compileStatus,
    compileError,
  } = useSelector(state => state.examModule);

  const [outputTab, setOutputTab] = useState(
    initialTab || 'Compilation Results'
  );
  const [selectedCase, setSelectedCase] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [animationState, setAnimationState] = useState('');

  const tabRefs = {
    'Compilation Results': useRef(null),
    'Custom Input': useRef(null),
  };
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Select results based on mode
  const currentResults =
    mode === 'custom'
      ? customInputResults.find(
          r => r.question_id === currentQuestion?.questionId
        )?.results || []
      : compileResults.find(r => r.question_id === currentQuestion?.questionId)
          ?.results || [];

  const escapeString = str => {
    return str
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/ /g, '·');
  };

  // Update outputTab only when initialTab changes and not during custom input run
  useEffect(() => {
    if (
      outputTab !== 'Compilation Results' &&
      initialTab === 'Compilation Results'
    ) {
      setOutputTab('Compilation Results');
    }
  }, [initialTab]);

  useEffect(() => {
    const ref = tabRefs[outputTab]?.current;
    if (ref) {
      setUnderlineStyle({
        left: ref.offsetLeft,
        width: ref.offsetWidth,
      });
    }
  }, [outputTab]);

  useEffect(() => {
    if (!isOutputVisible) {
      setCustomInput('');
      setCustomOutput('');
      setOutputTab('Compilation Results');
      dispatch(setInitialTab('Compilation Results'));
      dispatch(setMode('testcase'));
      dispatch(setIsMinimized(false));
    }
  }, [isOutputVisible, dispatch]);

  useEffect(() => {
    if (currentResults.length > 0 && selectedCase >= currentResults.length) {
      setSelectedCase(0);
    }
  }, [currentResults, selectedCase]);

  // Reset customInput and customOutput when question changes
  useEffect(() => {
    if (!currentQuestion) {
      setCustomInput('');
      setCustomOutput('');
      return;
    }
    setCustomInput('');
    setCustomOutput('');
  }, [currentQuestion?.questionId]);

  // Handle custom output
  useEffect(() => {
    if (!currentQuestion || mode !== 'custom') {
      setCustomOutput('');
      return;
    }

    if (currentResults.length > 0) {
      const customResult = currentResults.find(
        result => result.type === 'custom'
      );
      if (customResult) {
        setCustomOutput(customResult.actual_output || 'No Output');
      } else {
        setCustomOutput('');
      }
    } else if (compileStatus === 'failed') {
      setCustomOutput(compileError || 'Failed to run custom input.');
    } else if (compileStatus === 'compiling') {
      setCustomOutput('Running custom input...');
    } else {
      setCustomOutput('');
    }
  }, [currentResults, mode, currentQuestion, compileStatus, compileError]);

  const handleTabChange = tab => {
    if (tab === outputTab) return;
    setAnimationState(
      tab === 'Compilation Results' ? 'slide-right' : 'slide-left'
    );
    setOutputTab(tab);
    dispatch(setInitialTab(tab));
  };

  const runCustomInput = async () => {
    if (!examStarted || isSubmitted) {
      setCustomOutput('Exam is not active or has already been submitted.');
      return;
    }

    if (!customInput.trim()) {
      setCustomOutput('Please provide a valid input.');
      return;
    }

    const processedCustomInput = customInput.trim();
    const payload = {
      question_id: currentQuestion?.questionId,
      source_code: code,
      language: currentQuestion.Subject?.toLowerCase().includes('java')
        ? 'java'
        : currentQuestion.Subject?.toLowerCase().includes('python')
          ? 'python'
          : currentQuestion.Subject?.toLowerCase().includes('c')
            ? 'c'
            : 'unknown',
      custom_input_enabled: true,
      custom_input: processedCustomInput,
      constraints: currentQuestion?.Constraints || '',
      description: currentQuestion?.Question || '',
      difficulty: currentQuestion?.difficulty || 'Easy',
      hidden_test_cases: [],
      sample_input: currentQuestion?.Sample_Input || '',
      sample_output: currentQuestion?.Sample_Output || '',
      score: currentQuestion?.score || 5,
      type: 'code',
    };

    try {
      dispatch(setMode('custom'));
      dispatch(setIsOutputVisible(true));
      dispatch(setIsMinimized(false));
      setOutputTab('Compilation Results');
      dispatch(setInitialTab('Compilation Results'));
      setAnimationState('slide-right');
      setCustomOutput('');

      const resultAction = await dispatch(runCode(payload));
      if (runCode.fulfilled.match(resultAction)) {
        setOutputTab('Compilation Results');
        dispatch(setInitialTab('Compilation Results'));
      } else {
        setCustomOutput(resultAction.payload || 'Failed to run custom input.');
      }
    } catch (error) {
      setCustomOutput(`Error running custom input: ${error.message}`);
    }
  };

  const handleMinimize = () => {
    dispatch(setIsMinimized(true));
  };

  const handleMaximize = () => {
    dispatch(setIsMinimized(false));
    dispatch(setIsOutputVisible(true));
  };

  const handleClose = () => {
    dispatch(setIsOutputVisible(false));
    dispatch(setIsMinimized(false));
  };

  if (!isOutputVisible || !currentQuestion) return null;

  return (
    <div
      className="transition-all duration-300 overflow-hidden absolute bottom-0 z-20 w-full"
      style={{
        height: isMinimized ? '40px' : `${outputPanelHeight.current || 400}px`,
      }}
    >
      <div className="bg-white shadow-[0_4px_20px_#B3BAF7] rounded-lg flex flex-col w-full h-full overflow-y-auto no-scrollbar">
        <div className="bg-[#00007F] rounded-t-lg h-10 p-2 flex items-center justify-between px-4 sticky top-0 z-10">
          <span className="text-white text-sm font-semibold font-inter">
            Output Window
          </span>
          <div className="flex items-center gap-2">
            {isMinimized ? (
              <IoChevronUp
                className="text-white text-lg cursor-pointer"
                onClick={handleMaximize}
                title="Maximize"
                aria-label="Maximize output panel"
              />
            ) : (
              <IoChevronDown
                className="text-white text-lg cursor-pointer"
                onClick={handleMinimize}
                title="Minimize"
                aria-label="Minimize output panel"
              />
            )}
            <IoClose
              className="text-white text-lg cursor-pointer"
              onClick={handleClose}
              title="Close"
              aria-label="Close output panel"
            />
          </div>
        </div>
        {!isMinimized && (
          <div className="border-b border-[#D9D9D9] px-4 pt-[25px]">
            <div className="flex relative gap-x-4 pb-1.5">
              {['Compilation Results', 'Custom Input'].map(tab => (
                <button
                  key={tab}
                  ref={tabRefs[tab]}
                  onClick={() => handleTabChange(tab)}
                  className={`text-[16px] font-medium leading-[19px] font-inter transition-colors duration-300 ${
                    outputTab === tab ? 'text-[#00007F]' : 'text-[#666666]'
                  }`}
                  style={{ padding: 0, margin: 0 }}
                >
                  {tab}
                </button>
              ))}
              <span
                className="absolute bottom-0 translate-y-[2px] h-[2px] bg-[#00007F] rounded-full transition-all duration-300 ease-in-out"
                style={{
                  left: `${underlineStyle.left}px`,
                  width: `${underlineStyle.width}px`,
                }}
              />
            </div>
          </div>
        )}
        {!isMinimized && (
          <div className="px-4 pt-[29px]">
            <div className={`tab-content ${animationState}`} key={outputTab}>
              {outputTab === 'Compilation Results' ? (
                <div className="space-y-4 overflow-y-auto">
                  <div className="text-[16px] font-medium text-[#000] leading-[19px] font-inter">
                    {compileStatus === 'compiling'
                      ? 'Compiling...'
                      : compileStatus === 'success'
                        ? 'Compilation Completed'
                        : compileStatus === 'failed'
                          ? 'Compilation Failed'
                          : 'No Compilation Results'}
                  </div>
                  {mode === 'testcase' && currentResults.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {currentResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedCase(index)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              selectedCase === index
                                ? result.status === 'Passed'
                                  ? 'bg-green-100 text-green-700'
                                  : result.status === 'Failed'
                                    ? 'bg-red-100 text-red-700'
                                    : result.status === 'Skipped'
                                      ? 'bg-gray-100 text-gray-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                : 'bg-[#E1EFFF] text-[#666]'
                            }`}
                          >
                            {result.type === 'sample'
                              ? 'Sample'
                              : result.type === 'custom'
                                ? 'Custom'
                                : `Case ${result.index + 1}`}
                            {result.status === 'Passed'
                              ? ' ✓'
                              : result.status === 'Failed'
                                ? ' ✗'
                                : result.status === 'Skipped'
                                  ? ' −'
                                  : ' Input'}
                          </button>
                        ))}
                      </div>
                      {currentResults[selectedCase] ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[#666] font-medium">
                              Input:
                            </span>
                            <pre className="border border-[#D9D9D9] rounded-lg p-3 font-mono text-sm bg-white whitespace-pre overflow-auto resize-y min-h-[80px] max-h-[300px]">
                              {currentResults[selectedCase].input || 'N/A'}
                            </pre>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[#666] font-medium">
                              Your Output:
                            </span>
                            <pre
                              className="border border-[#D9D9D9] rounded-lg p-3 font-mono text-sm bg-white whitespace-pre overflow-auto resize-y min-h-[80px] max-h-[400px]"
                              aria-label="Your output for the selected test case"
                            >
                              {currentResults[selectedCase].actual_output ===
                              null
                                ? 'No Output'
                                : currentResults[selectedCase].actual_output}
                            </pre>
                          </div>
                          {currentResults[selectedCase].type !== 'custom' && (
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                              <span className="text-[#666] font-medium">
                                Expected Output:
                              </span>
                              <pre
                                className="border border-[#D9D9D9] rounded-lg p-3 font-mono text-sm bg-white whitespace-pre overflow-auto resize-y min-h-[80px] max-h-[400px]"
                                aria-label="Expected output for the selected test case"
                              >
                                {currentResults[selectedCase].expected_output ||
                                  'N/A'}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-[#666]">
                          No test case results available
                        </div>
                      )}
                    </>
                  ) : mode === 'custom' && currentResults.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#666] font-medium">
                        Custom Output:
                      </span>
                      <pre className="border border-[#D9D9D9] rounded-lg p-3 font-mono text-sm bg-white overflow-auto resize-y min-h-[80px] max-h-[300px] whitespace-pre-wrap break-words">
                        {customOutput}
                      </pre>
                    </div>
                  ) : mode === 'testcase' && compileStatus === 'failed' ? (
                    <div className="p-3 bg-red-100 text-red-800 rounded-md">
                      Compilation failed: {compileError}
                    </div>
                  ) : (
                    <div className="text-sm text-[#666]">
                      No compilation results to display.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[#666] font-medium text-sm">
                      Custom Input:
                    </span>
                    <textarea
                      value={customInput}
                      onChange={e => {
                        setCustomInput(e.target.value);
                      }}
                      className="border border-[#D9D9D9] rounded-lg p-3 text-sm leading-6 tracking-wider h-24 resize-y" // 👈 updated this line
                      placeholder="Enter your custom input here..."
                    />
                  </div>
                  <button
                    onClick={runCustomInput}
                    className="bg-[#00007F] text-white font-medium text-sm px-4 py-2 rounded hover:bg-[#000066] transition w-fit disabled:bg-gray-400"
                    disabled={!currentQuestion || !code}
                  >
                    Run with Custom Input
                  </button>
                  {customOutput && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#666] font-medium text-sm">
                        Output:
                      </span>
                      <pre className="border border-[#D9D9D9] rounded-lg p-3 font-mono text-sm bg-white overflow-auto resize-y min-h-[80px] max-h-[300px] whitespace-pre-wrap break-words">
                        {customOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
