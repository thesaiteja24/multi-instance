import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

const QuestionBreakDown = ({ details }) => {
  // Language extensions for CodeMirror
  const languageExtensions = {
    Python: python(),
    Java: java(),
    C: cpp(),
    'C++': cpp(),
    JavaScript: javascript(),
  };

  if (!details || !Array.isArray(details) || details.length === 0) {
    return (
      <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
        <div className="text-[var(--color-secondary)] font-semibold text-lg mb-2">
          Question Breakdown
          <hr />
        </div>
        <p className="text-center text-gray-500">
          You have not attempted any questions.
        </p>
      </div>
    );
  }

  try {
    return (
      <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
        {/* Header */}
        <div className="text-[var(--color-secondary)] font-semibold text-lg mb-2">
          Question Breakdown
          <hr />
        </div>

        {/* Scrollable Container */}
        <div className="max-h-80 overflow-y-auto pr-2">
          {details.map((question, index) => {
            const questionText = question?.question || 'No question provided.';
            const scoreAwarded = question?.scoreAwarded ?? '0';
            const type =
              question?.options && Object.keys(question.options).length > 0
                ? 'MCQ'
                : 'Coding';
            const status = question.hasOwnProperty('status')
              ? question.status
              : 'Not Attempted';
            const submitted = question?.submitted;
            const options = question?.options || {};
            const correctAnswer = question?.correctAnswer;
            const testCaseSummary = submitted?.testCaseSummary || {};
            const passedCases = testCaseSummary?.passed ?? '0';
            const failedCases = testCaseSummary?.failed ?? '0';
            const sourceCode =
              submitted?.sourceCode || question?.sourceCode || '';
            const language = submitted?.language || '';

            return (
              <div key={index} className="border-b pb-4 mb-4 last:border-none">
                <div className="flex gap-2 flex-wrap">
                  <span className="font-medium">Question:</span>
                  <span className="text-black font-semibold">
                    {questionText}
                  </span>
                  <span className="font-medium">Marks Awarded:</span>
                  <span className="text-gray-500">{scoreAwarded}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Type:</span>
                  <span>{type}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`flex items-center ${
                      status === 'Correct' || status === 'Passed'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {status}
                    {status === 'Correct' || status === 'Passed' ? (
                      <FaCheckCircle className="ml-2" />
                    ) : (
                      <FaTimesCircle className="ml-2" />
                    )}
                  </span>
                </div>
                {type === 'MCQ' ? (
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="font-medium">Your Answer:</span>
                      <span>{submitted || 'No answer submitted.'}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-medium">Options:</span>
                      <div className="flex gap-4 flex-wrap">
                        <span
                          className={
                            correctAnswer === 'A'
                              ? 'text-green-600 font-bold'
                              : ''
                          }
                        >
                          A: {options.A || 'N/A'}
                        </span>
                        <span
                          className={
                            correctAnswer === 'B'
                              ? 'text-green-600 font-bold'
                              : ''
                          }
                        >
                          B: {options.B || 'N/A'}
                        </span>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <span
                          className={
                            correctAnswer === 'C'
                              ? 'text-green-600 font-bold'
                              : ''
                          }
                        >
                          C: {options.C || 'N/A'}
                        </span>
                        <span
                          className={
                            correctAnswer === 'D'
                              ? 'text-green-600 font-bold'
                              : ''
                          }
                        >
                          D: {options.D || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <span className="font-medium">Passed Cases:</span>
                      <span>{passedCases}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">Failed Cases:</span>
                      <span>{failedCases}</span>
                    </div>
                    {sourceCode && language && language !== 'Unknown' ? (
                      <div className="mt-2">
                        <div className="flex gap-2">
                          <span className="font-medium">Language:</span>
                          <span>{language}</span>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Source Code:</span>
                          <div className="border border-gray-600 rounded overflow-hidden mt-1">
                            <CodeMirror
                              value={sourceCode}
                              height="300px"
                              theme={oneDark}
                              extensions={
                                languageExtensions[language]
                                  ? [
                                      languageExtensions[language],
                                      EditorView.editable.of(false),
                                    ]
                                  : [EditorView.editable.of(false)]
                              }
                              readOnly={true}
                              basicSetup={{
                                lineNumbers: true,
                                highlightActiveLine: false,
                                tabSize: 2,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-white border border-[#19216f] rounded-lg shadow-md p-8 mt-4 text-xl">
        <div className="text-[var(--color-secondary)] font-semibold text-lg mb-2">
          Question Breakdown
          <hr />
        </div>
        <p className="text-center text-red-600">Internal server error.</p>
      </div>
    );
  }
};

export default QuestionBreakDown;
