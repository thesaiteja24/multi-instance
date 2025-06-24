import React, { useState, useEffect, useRef } from 'react';
import { IoChevronUp, IoChevronDown, IoClose } from 'react-icons/io5';
import { FiLock } from 'react-icons/fi';

const TestCaseTabs = ({
  customInputEnabled,
  setCustomInputEnabled,
  customInput,
  setCustomInput,
  testCases,
  hiddenTestCaseResults,
  testCaseSummary,
  hiddenTestCaseSummary,
  handleRun,
  loading,
  theme,
  setTheme,
  initialIndex,
  isOutputVisible,
  setIsOutputVisible,
}) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [outputTab, setOutputTab] = useState('Compilation Results');
  const [selectedCase, setSelectedCase] = useState(0);
  const [animationClass, setAnimationClass] = useState('');
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const compilationTabRef = useRef(null);
  const customInputTabRef = useRef(null);

  // Reset output panel when navigating to a new question
  useEffect(() => {
    setIsOutputVisible(false);
    setIsMinimized(true);
    setOutputTab('Compilation Results');
    setSelectedCase(0);
  }, [initialIndex, setIsOutputVisible]);

  // Show panel for test results or when loading
  useEffect(() => {
    if (loading || testCases.length > 0 || hiddenTestCaseResults.length > 0) {
      setIsOutputVisible(true);
      setIsMinimized(false);
    }
  }, [loading, testCases, hiddenTestCaseResults, setIsOutputVisible]);

  // Handle custom input tab switching
  useEffect(() => {
    if (customInputEnabled) {
      setOutputTab('Custom Input');
      setIsOutputVisible(true);
      setIsMinimized(false);
    }
  }, [customInputEnabled, setIsOutputVisible]);

  // Update underline style for tabs
  useEffect(() => {
    const updateUnderline = () => {
      const tabRef =
        outputTab === 'Compilation Results'
          ? compilationTabRef.current
          : customInputTabRef.current;
      if (tabRef) {
        setUnderlineStyle({
          left: tabRef.offsetLeft,
          width: tabRef.offsetWidth,
        });
      }
    };
    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [outputTab]);

  const handleTabClick = tab => {
    if (tab === outputTab) return;
    setAnimationClass(tab === 'Custom Input' ? 'slide-left' : 'slide-right');
    setTimeout(() => {
      setOutputTab(tab);
      setAnimationClass('');
    }, 300);
  };

  const parseOutput = (text = '') => {
    if (typeof text !== 'string') return '';
    if (text.includes('\\n') || text.includes('\\s')) {
      return text.replace(/\\s/g, ' ').replace(/\\n/g, '\n');
    }
    return text || 'No output';
  };

  const allTestCases = [
    ...testCases,
    ...hiddenTestCaseResults.filter(
      tc => !(tc.type === 'sample' && testCases.some(t => t.type === 'sample'))
    ),
  ];

  return (
    <div
      className={`left-0 w-full overflow-hidden rounded-t-lg transition-all duration-300 ${
        isOutputVisible ? (isMinimized ? 'h-10' : 'h-[80vh]') : 'h-0'
      } ${theme === 'dark' ? 'bg-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]' : 'bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'}`}
    >
      <div
        className={`bg-${theme === 'dark' ? 'gray-900' : '[#00007F]'} rounded-t-lg h-10 p-2 flex items-center justify-between px-4 sticky top-0 z-10`}
      >
        <span
          className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-white'}`}
        >
          Output Window
        </span>
        <div className="flex items-center gap-2">
          {isMinimized ? (
            <IoChevronUp
              onClick={() => setIsMinimized(false)}
              className={`text-lg cursor-pointer ${theme === 'dark' ? 'text-gray-200' : 'text-white'}`}
            />
          ) : (
            <IoChevronDown
              onClick={() => setIsMinimized(true)}
              className={`text-lg cursor-pointer ${theme === 'dark' ? 'text-gray-200' : 'text-white'}`}
            />
          )}
          <IoClose
            onClick={() => {
              setIsOutputVisible(false);
              setCustomInputEnabled(false);
              setCustomInput('');
            }}
            className={`text-lg cursor-pointer ${theme === 'dark' ? 'text-gray-200' : 'text-white'}`}
          />
        </div>
      </div>
      {!isMinimized && (
        <>
          <div
            className={`flex items-center px-4 py-2 border-b relative ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#D9D9D9]'}`}
          >
            <button
              ref={compilationTabRef}
              onClick={() => handleTabClick('Compilation Results')}
              className={`px-4 py-2 text-sm font-semibold ${
                outputTab === 'Compilation Results'
                  ? theme === 'dark'
                    ? 'text-blue-400'
                    : 'text-[#00007F]'
                  : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-[#666666]'
              }`}
            >
              Compilation Results
            </button>
            <button
              ref={customInputTabRef}
              onClick={() => handleTabClick('Custom Input')}
              className={`px-4 py-2 text-sm font-semibold ${
                outputTab === 'Custom Input'
                  ? theme === 'dark'
                    ? 'text-blue-400'
                    : 'text-[#00007F]'
                  : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-[#666666]'
              }`}
            >
              Custom Input
            </button>
            <div
              className={`absolute bottom-0 h-[3px] transition-all duration-300 ${theme === 'dark' ? 'bg-blue-400' : 'bg-[#00007F]'}`}
              style={underlineStyle}
            />
          </div>
          <div
            className={`p-4 overflow-y-auto h-[calc(100%-6rem)] ${animationClass} ${theme === 'dark' ? 'bg-gray-800' : ''}`}
          >
            {outputTab === 'Compilation Results' ? (
              <div>
                {loading ? (
                  <p
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                  >
                    Compiling...
                  </p>
                ) : allTestCases.length === 0 ? (
                  <p
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                  >
                    No test results yet.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allTestCases.map((tc, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedCase(index)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            selectedCase === index
                              ? theme === 'dark'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#00007F] text-white'
                              : tc.status === 'Passed'
                                ? theme === 'dark'
                                  ? 'bg-green-900 text-green-300'
                                  : 'bg-green-100 text-green-700'
                                : tc.status === 'Failed'
                                  ? theme === 'dark'
                                    ? 'bg-red-900 text-red-300'
                                    : 'bg-red-100 text-red-700'
                                  : theme === 'dark'
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-[#E1EFFF] text-gray-400'
                          }`}
                        >
                          {tc.type === 'sample'
                            ? 'Sample'
                            : tc.type === 'hidden'
                              ? `Hidden ${index + 1}`
                              : `Case ${index + 1}`}
                          {tc.status === 'Passed' && ' ✓'}
                          {tc.status === 'Failed' && ' ✗'}
                        </button>
                      ))}
                    </div>
                    {allTestCases[selectedCase] && (
                      <div className="space-y-2">
                        <h4
                          className={`text-base font-semibold flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                        >
                          {allTestCases[selectedCase].type === 'hidden' && (
                            <FiLock className="mr-2" />
                          )}
                          {allTestCases[selectedCase].type === 'sample'
                            ? 'Sample Test Case'
                            : allTestCases[selectedCase].type === 'hidden'
                              ? `Hidden Test Case ${selectedCase + 1}`
                              : `Test Case ${selectedCase + 1}`}
                          :{' '}
                          <span
                            className={
                              allTestCases[selectedCase].status === 'Passed'
                                ? theme === 'dark'
                                  ? 'text-green-400'
                                  : 'text-green-600'
                                : theme === 'dark'
                                  ? 'text-red-400'
                                  : 'text-red-600'
                            }
                          >
                            {allTestCases[selectedCase].status}
                          </span>
                        </h4>
                        {allTestCases[selectedCase].type !== 'hidden' && (
                          <div>
                            <p
                              className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                            >
                              Input:
                            </p>
                            <pre
                              className={`p-3 rounded-md text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {parseOutput(allTestCases[selectedCase].input)}
                            </pre>
                          </div>
                        )}
                        <div>
                          <p
                            className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                          >
                            Expected Output:
                          </p>
                          <pre
                            className={`p-3 rounded-md text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {parseOutput(
                              allTestCases[selectedCase].expected_output
                            )}
                          </pre>
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                          >
                            Your Output:
                          </p>
                          <pre
                            className={`p-3 rounded-md text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {parseOutput(
                              allTestCases[selectedCase].actual_output
                            )}
                          </pre>
                        </div>
                      </div>
                    )}
                    <p
                      className={`text-sm font-semibold mt-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                    >
                      Summary:{' '}
                      {testCaseSummary.passed + hiddenTestCaseSummary.passed}{' '}
                      Passed /{' '}
                      {testCaseSummary.failed + hiddenTestCaseSummary.failed}{' '}
                      Failed
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={4}
                  className={`w-full p-3 border rounded-md text-sm resize-y ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-800'}`}
                  placeholder="Enter custom input"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                />
                <button
                  onClick={() => handleRun(true)}
                  disabled={loading}
                  className={`px-4 py-2 text-white text-sm font-semibold rounded-md ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Running...' : 'Run with Custom Input'}
                </button>
                {testCases.length > 0 && (
                  <div>
                    <p
                      className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
                    >
                      Output:
                    </p>
                    <pre
                      className={`p-3 rounded-md text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {parseOutput(testCases[0]?.actual_output)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TestCaseTabs;
