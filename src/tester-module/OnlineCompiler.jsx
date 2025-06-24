import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OutputPanel from './TestCaseTabs.jsx';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { GrCodepen } from 'react-icons/gr';
import { FiSun, FiMoon } from 'react-icons/fi';

function OnlineCompiler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state: locationState = {} } = useLocation();
  const { userInfo } = useSelector(state => state.auth);

  const questionIdFromParams = searchParams.get('questionId') || '';
  const subjectFromParams =
    searchParams.get('subject')?.toLowerCase() || 'computer science';
  const tagsFromParams = searchParams.get('tags')?.toLowerCase() || 'day-1:0';
  const questionTypeFromParams =
    searchParams.get('questionType') || 'code_test';

  const {
    question: initialQuestion = {},
    index: initialIndex = 0,
    questions: initialQuestionsList = [],
    codeMap: initialCodeMap = {},
  } = locationState;

  const questionId = initialQuestion?.questionId || questionIdFromParams;
  const subject = initialQuestion?.Subject?.toLowerCase() || subjectFromParams;
  const tags = initialQuestion?.Tags?.toLowerCase() || tagsFromParams;
  const questionType = initialQuestion?.type || questionTypeFromParams;
  const testerId = userInfo?.id;

  const [question, setQuestion] = useState(initialQuestion);
  const [codeMap, setCodeMap] = useState(initialCodeMap);
  const [code, setCode] = useState(initialCodeMap[initialIndex] || '');
  const [language, setLanguage] = useState('Python');
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [testCaseSummary, setTestCaseSummary] = useState({
    passed: 0,
    failed: 0,
  });
  const [hiddenTestCaseResults, setHiddenTestCaseResults] = useState([]);
  const [hiddenTestCaseSummary, setHiddenTestCaseSummary] = useState({
    passed: 0,
    failed: 0,
  });
  const [testCaseResultsMap, setTestCaseResultsMap] = useState({});
  const [hiddenCaseResultsMap, setHiddenCaseResultsMap] = useState({});
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedSourceCode, setVerifiedSourceCode] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState({
    ...initialQuestion,
    Hidden_Test_Cases: Array.isArray(initialQuestion?.Hidden_Test_Cases)
      ? initialQuestion.Hidden_Test_Cases
      : [],
  });
  const [fetchedQuestionsList, setFetchedQuestionsList] =
    useState(initialQuestionsList);

  const languageExtensions = {
    Python: python(),
    Java: java(),
    C: cpp(),
    'C++': cpp(),
    JavaScript: javascript(),
  };

  const processedHiddenTestCases = hiddenTestCases =>
    hiddenTestCases
      ? hiddenTestCases.map(tc => ({
          ...tc,
          Input:
            typeof tc.Input === 'string'
              ? tc.Input.replace(/\r/g, '')
                  .split('\n')
                  .map(line => line.trim())
                  .join('\n')
              : String(tc.Input ?? ''),
          Output:
            typeof tc.Output === 'string'
              ? tc.Output.replace(/\r/g, '')
                  .split('\n')
                  .map(line => line.trimEnd())
                  .join('\n')
              : String(tc.Output ?? ''),
        }))
      : [];

  const cleanedSampleInput =
    typeof question?.Sample_Input === 'string'
      ? question.Sample_Input.replace(/\r/g, '')
          .split('\n')
          .map(line => line.trim())
          .join('\n')
      : String(question?.Sample_Input ?? '');

  const cleanedSampleOutput =
    typeof question?.Sample_Output === 'string'
      ? question.Sample_Output.replace(/\r/g, '')
          .split('\n')
          .map(line => line.trimEnd())
          .join('\n')
      : String(question?.Sample_Output ?? '');

  useEffect(() => {
    if (!testerId) {
      toast.error('Please log in to continue.');
      navigate('/login');
    }
  }, [testerId, navigate]);

  useEffect(() => {
    if (Object.keys(initialQuestion).length > 0) {
      setQuestion(initialQuestion);
      setCodeMap(initialCodeMap);
      setCode(initialCodeMap[initialIndex] || '');
      setEditedQuestion({
        ...initialQuestion,
        Hidden_Test_Cases: Array.isArray(initialQuestion?.Hidden_Test_Cases)
          ? initialQuestion.Hidden_Test_Cases
          : [],
      });
      setFetchedQuestionsList(initialQuestionsList);
    }
  }, [initialQuestion, initialIndex, initialCodeMap, initialQuestionsList]);

  useEffect(() => {
    setCode(codeMap[initialIndex] || '');
  }, [initialIndex, codeMap]);

  useEffect(() => {
    setEditedQuestion({
      ...question,
      Hidden_Test_Cases: Array.isArray(question?.Hidden_Test_Cases)
        ? question.Hidden_Test_Cases
        : [],
    });
  }, [question]);

  useEffect(() => {
    const savedNormal = testCaseResultsMap[initialIndex];
    if (savedNormal) {
      setTestCases(savedNormal.results);
      setTestCaseSummary(savedNormal.summary);
    } else {
      setTestCases([]);
      setTestCaseSummary({ passed: 0, failed: 0 });
    }
    const savedHidden = hiddenCaseResultsMap[initialIndex];
    if (savedHidden) {
      setHiddenTestCaseResults(savedHidden.results);
      setHiddenTestCaseSummary(savedHidden.summary);
    } else {
      setHiddenTestCaseResults([]);
      setHiddenTestCaseSummary({ passed: 0, failed: 0 });
    }
  }, [initialIndex, testCaseResultsMap, hiddenCaseResultsMap]);

  const fetchQuestionData = useCallback(
    async signal => {
      if (!questionId) {
        toast.warn('No question ID provided.');
        return;
      }
      setIsLoadingQuestion(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/question-crud?subject=${subject}&questionId=${questionId}&questionType=${questionType}`,
          { signal }
        );
        const data = response.data;
        if (data?.codeQuestions?.length > 0) {
          const fetchedQuestion = data.codeQuestions[0];
          setQuestion(fetchedQuestion);
          setEditedQuestion({
            ...fetchedQuestion,
            Hidden_Test_Cases: Array.isArray(fetchedQuestion.Hidden_Test_Cases)
              ? fetchedQuestion.Hidden_Test_Cases
              : [],
          });
        } else {
          toast.error('No question found for the provided ID.');
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching question data:', error);
          toast.error(
            error.response?.data?.message || 'Failed to load question data.'
          );
        }
      } finally {
        setIsLoadingQuestion(false);
      }
    },
    [questionId, subject, questionType]
  );

  const fetchQuestionsList = useCallback(
    async signal => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/question-crud?subject=${subject}&tags=${tags}&questionType=${questionType}`,
          { signal }
        );
        const questions = response.data.codeQuestions || [];
        setFetchedQuestionsList(questions);
        const fetchedQuestion =
          questions.find(q => q.questionId === questionId) || {};
        setQuestion(fetchedQuestion);
        setEditedQuestion({
          ...fetchedQuestion,
          Hidden_Test_Cases: Array.isArray(fetchedQuestion.Hidden_Test_Cases)
            ? fetchedQuestion.Hidden_Test_Cases
            : [],
        });
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching questions list:', error);
          toast.error('Failed to load questions list.');
        }
      }
    },
    [subject, tags, questionType, questionId]
  );

  const fetchVerificationStatus = useCallback(
    async signal => {
      if (!questionId || !testerId) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/verify-question?internId=${testerId}&subject=${subject}&questionType=${questionType}`,
          { signal }
        );
        const data = response.data;
        if (!data.success || !Array.isArray(data.verifications)) {
          throw new Error('Invalid verification response');
        }
        const verification = data.verifications.find(
          v => v.questionId === questionId && v.tag === tags && v.verified
        );
        const isQuestionVerified = !!verification;
        const sourceCode = verification?.sourceCode || '';
        setIsVerified(isQuestionVerified);
        setVerifiedSourceCode(sourceCode);
        if (isQuestionVerified && sourceCode) {
          setCodeMap(prev => ({ ...prev, [initialIndex]: sourceCode }));
          setCode(sourceCode);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching verification status:', error);
          toast.error('Failed to fetch verification status.');
        }
      }
    },
    [questionId, testerId, subject, questionType, tags, initialIndex]
  );

  useEffect(() => {
    const controller = new AbortController();
    if (questionId && !question.Question) {
      fetchQuestionData(controller.signal);
    }
    return () => controller.abort();
  }, [questionId, fetchQuestionData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchVerificationStatus(controller.signal);
    return () => controller.abort();
  }, [fetchVerificationStatus]);

  useEffect(() => {
    const controller = new AbortController();
    if (
      !initialQuestionsList.length &&
      !fetchedQuestionsList.length &&
      questionId
    ) {
      fetchQuestionsList(controller.signal);
    }
    return () => controller.abort();
  }, [
    initialQuestionsList,
    fetchedQuestionsList,
    questionId,
    fetchQuestionsList,
  ]);

  const handleSave = async () => {
    if (!questionId) {
      toast.info('No question ID found! Cannot save changes.');
      return;
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/question-crud`,
        editedQuestion
      );
      setQuestion(editedQuestion);
      setIsEditing(false);
      toast.success('Question updated successfully!');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedQuestion({
      ...question,
      Hidden_Test_Cases: Array.isArray(question?.Hidden_Test_Cases)
        ? question.Hidden_Test_Cases
        : [],
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedQuestion(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHiddenTestCaseChange = (index, field, value) => {
    setEditedQuestion(prev => {
      const updatedHiddenTestCases = [...(prev.Hidden_Test_Cases || [])];
      updatedHiddenTestCases[index] = {
        ...updatedHiddenTestCases[index],
        [field]: value,
      };
      return { ...prev, Hidden_Test_Cases: updatedHiddenTestCases };
    });
  };

  const addHiddenTestCase = () => {
    setEditedQuestion(prev => ({
      ...prev,
      Hidden_Test_Cases: [
        ...(prev.Hidden_Test_Cases || []),
        { Input: '', Output: '' },
      ],
    }));
  };

  const removeHiddenTestCase = index => {
    setEditedQuestion(prev => ({
      ...prev,
      Hidden_Test_Cases: (prev.Hidden_Test_Cases || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleCodeChange = val => {
    setCode(val);
    setCodeMap(prev => ({ ...prev, [initialIndex]: val }));
  };

  const handleRun = async (isCustomRun = false) => {
    if (!questionId) {
      toast.error('No question ID found!');
      return;
    }
    setLoading(true);
    setIsOutputVisible(true);
    setTestCases([]);
    setHiddenTestCaseResults([]);

    if (isCustomRun) {
      setCustomInputEnabled(true);
    }

    const hiddenTestCasesWithSample = [
      ...processedHiddenTestCases(editedQuestion.Hidden_Test_Cases),
      {
        Input: cleanedSampleInput,
        Output: cleanedSampleOutput,
        type: 'sample',
      },
    ];

    const bodyData = {
      internId: testerId,
      question_id: questionId,
      source_code: code,
      language,
      custom_input_enabled: isCustomRun || customInputEnabled,
      custom_input: customInput,
      description: editedQuestion.Question,
      constraints: editedQuestion.Constraints,
      difficulty: editedQuestion.Difficulty,
      hidden_test_cases: hiddenTestCasesWithSample,
      sample_input: editedQuestion.Sample_Input,
      sample_output: editedQuestion.Sample_Output,
      Score: editedQuestion.Score,
      type: editedQuestion.Question_Type,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-submission`,
        bodyData
      );
      const { results } = response.data;

      // Filter normal results (custom or sample for custom run, otherwise sample)
      const normalResults =
        isCustomRun || customInputEnabled
          ? results.filter(r => r.type === 'custom')
          : results.filter(r => r.type === 'sample');

      const computedNormalResults = normalResults.map(res => {
        const passed =
          res.expected_output?.trim() === res.actual_output?.trim();
        return { ...res, status: passed ? 'Passed' : 'Failed' };
      });

      const normalSummary = computedNormalResults.reduce(
        (acc, cur) => {
          if (cur.status === 'Passed') acc.passed++;
          else acc.failed++;
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      // Filter hidden results (only hidden test cases)
      const hiddenResults = results.filter(r => r.type === 'hidden');

      const computedHiddenResults = hiddenResults.map(res => {
        const passed =
          res.expected_output?.trim() === res.actual_output?.trim();
        return { ...res, status: passed ? 'Passed' : 'Failed' };
      });

      const hiddenSummary = computedHiddenResults.reduce(
        (acc, cur) => {
          if (cur.status === 'Passed') acc.passed++;
          else acc.failed++;
          return acc;
        },
        { passed: 0, failed: 0 }
      );

      setTestCaseResultsMap(prev => ({
        ...prev,
        [initialIndex]: {
          results: computedNormalResults,
          summary: normalSummary,
        },
      }));
      setHiddenCaseResultsMap(prev => ({
        ...prev,
        [initialIndex]: {
          results: computedHiddenResults,
          summary: hiddenSummary,
        },
      }));
      setTestCaseSummary(normalSummary);
      setTestCases(computedNormalResults);
      setHiddenTestCaseResults(computedHiddenResults);
      setHiddenTestCaseSummary(hiddenSummary);
    } catch (error) {
      console.error('Error in handleRun:', error);
      setTestCases([]);
      setHiddenTestCaseResults([]);
      toast.error(error.response?.data?.message || 'Failed to run tests.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const questionsList = fetchedQuestionsList.length
      ? fetchedQuestionsList
      : initialQuestionsList;
    if (
      !questionsList ||
      !Array.isArray(questionsList) ||
      questionsList.length === 0
    ) {
      toast.warn('No questions available.');
      return;
    }
    if (initialIndex >= questionsList.length - 1) {
      toast.info('This is the last question.');
      return;
    }
    const nextIndex = initialIndex + 1;
    const nextQuestion = questionsList[nextIndex];
    navigate(
      `/tester/verify-coding/test?questionId=${nextQuestion.questionId}&subject=${subject}&tags=${tags}&questionType=${questionType}`,
      {
        state: {
          question: nextQuestion,
          index: nextIndex,
          questions: questionsList,
          codeMap,
        },
      }
    );
  };

  const handlePrevious = () => {
    const questionsList = fetchedQuestionsList.length
      ? fetchedQuestionsList
      : initialQuestionsList;
    if (
      !questionsList ||
      !Array.isArray(questionsList) ||
      questionsList.length === 0
    ) {
      toast.warn('No questions available.');
      return;
    }
    if (initialIndex <= 0) {
      toast.info('This is the first question.');
      return;
    }
    const prevIndex = initialIndex - 1;
    const prevQuestion = questionsList[prevIndex];
    navigate(
      `/tester/verify-coding/test?questionId=${prevQuestion.questionId}&subject=${subject}&tags=${tags}&questionType=${questionType}`,
      {
        state: {
          question: prevQuestion,
          index: prevIndex,
          questions: questionsList,
          codeMap,
        },
      }
    );
  };

  const handleBack = () => {
    navigate(`/tester/verify-coding?subject=${subject}&tags=${tags}`);
  };

  return (
    <div
      className={`flex flex-col w-full h-[85vh] font-[Inter] ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}
    >
      <div className="w-full h-full">
        <div
          className={`flex flex-col lg:flex-row w-full h-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
        >
          {/* Left Panel: Question Details */}
          <div
            className={`lg:w-1/2 w-full relative border-r-[0.0625rem] ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="p-[1.5rem] overflow-y-auto no-scrollbar h-full pb-[21.875rem]">
              {isLoadingQuestion ? (
                <div className="flex justify-center items-center h-full">
                  <p
                    className={`text-[0.875rem] animate-pulse ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
                  >
                    Loading question...
                  </p>
                </div>
              ) : question?.Question ? (
                <div className="relative z-10">
                  <div className="flex items-center gap-[0.5rem] mb-[1.5rem]">
                    {isVerified ? (
                      <div
                        className={`flex items-center gap-[0.5rem] ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}
                      >
                        <CheckCircle size="1.25rem" />
                        <span className="text-[1rem] font-semibold">
                          Question is verified
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-[0.5rem] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
                      >
                        <CheckCircle size="1.25rem" className="opacity-50" />
                        <span className="text-[1rem] font-semibold">
                          Question is not verified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-[1.5rem]">
                    <h1
                      className={`text-[1.5rem] font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                    >
                      Question {question.Question_No || initialIndex + 1}
                    </h1>
                    {!isVerified && (
                      <>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className={`text-[0.875rem] font-semibold transition-colors duration-200 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                          >
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-[0.75rem]">
                            <button
                              onClick={handleSave}
                              className={`text-[0.875rem] font-semibold transition-colors duration-200 ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className={`text-[0.875rem] font-semibold transition-colors duration-200 ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="space-y-[1.5rem]">
                    <div className="flex items-center gap-[0.5rem]">
                      <GrCodepen
                        className={`w-[1.25rem] h-[1.25rem] ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                      />
                      <h2
                        className={`text-[1.125rem] font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        Problem
                      </h2>
                    </div>
                    {isEditing ? (
                      <textarea
                        className={`w-full p-[0.75rem] rounded-sm text-[0.875rem] font-[Inter] focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none resize-y transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        value={editedQuestion.Question || ''}
                        onChange={e =>
                          handleInputChange('Question', e.target.value)
                        }
                      />
                    ) : (
                      <pre
                        className={`text-[0.875rem] font-[Inter] whitespace-pre-wrap p-[0.75rem] rounded-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {editedQuestion.Question}
                      </pre>
                    )}
                    <div>
                      <h3
                        className={`text-[1rem] font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        Constraints
                      </h3>
                      {isEditing ? (
                        <textarea
                          className={`w-full p-[0.75rem] rounded-sm text-[0.875rem] font-[Inter] focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none resize-y transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                          value={editedQuestion.Constraints || ''}
                          onChange={e =>
                            handleInputChange('Constraints', e.target.value)
                          }
                        />
                      ) : (
                        <pre
                          className={`text-[0.875rem] font-[Inter] whitespace-pre-wrap p-[0.75rem] rounded-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {editedQuestion.Constraints}
                        </pre>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-[1rem] font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        Difficulty
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          className={`w-full p-[0.75rem] rounded-sm text-[0.875rem] font-[Inter] focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                          value={editedQuestion.Difficulty || ''}
                          onChange={e =>
                            handleInputChange('Difficulty', e.target.value)
                          }
                        />
                      ) : (
                        <p
                          className={`text-[0.875rem] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          {editedQuestion.Difficulty}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-[1rem] font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        Sample Input
                      </h3>
                      {isEditing ? (
                        <textarea
                          className={`w-full p-[0.75rem] rounded-sm text-[0.875rem] font-[Inter] focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none resize-y transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                          value={
                            editedQuestion.Sample_Input !== undefined
                              ? String(editedQuestion.Sample_Input)
                              : ''
                          }
                          onChange={e =>
                            handleInputChange('Sample_Input', e.target.value)
                          }
                        />
                      ) : (
                        <pre
                          className={`p-[0.75rem] font-[Inter] rounded-sm text-[0.875rem] whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {cleanedSampleInput || 'No sample input available.'}
                        </pre>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-[1rem] font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        Sample Output
                      </h3>
                      {isEditing ? (
                        <textarea
                          className={`w-full p-[0.75rem] rounded-sm text-[0.875rem] font-[Inter] focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none resize-y transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                          value={
                            editedQuestion.Sample_Output !== undefined
                              ? String(editedQuestion.Sample_Output)
                              : ''
                          }
                          onChange={e =>
                            handleInputChange('Sample_Output', e.target.value)
                          }
                        />
                      ) : (
                        <pre
                          className={`p-[0.75rem] font-[Inter] rounded-sm text-[0.875rem] whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {cleanedSampleOutput || 'No sample output available.'}
                        </pre>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-[1rem] font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        Hidden Test Cases
                      </h3>
                      {isEditing ? (
                        <div className="space-y-[1rem]">
                          {(editedQuestion.Hidden_Test_Cases || []).map(
                            (tc, index) => (
                              <div
                                key={index}
                                className={`border-[0.0625rem] p-[1rem] rounded-sm shadow-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                              >
                                <div>
                                  <label
                                    className={`text-[0.75rem] font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                                  >
                                    Input:
                                  </label>
                                  <textarea
                                    className={`w-full p-[0.625rem] rounded-md text-[0.875rem] font-[Inter] mt-[0.25rem] resize-y focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                    value={
                                      tc.Input !== undefined
                                        ? String(tc.Input)
                                        : ''
                                    }
                                    onChange={e =>
                                      handleHiddenTestCaseChange(
                                        index,
                                        'Input',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="mt-[0.75rem]">
                                  <label
                                    className={`text-[0.75rem] font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                                  >
                                    Output:
                                  </label>
                                  <textarea
                                    className={`w-full p-[0.625rem] rounded-md text-[0.875rem] font-[Inter] mt-[0.25rem] resize-y focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                    value={
                                      tc.Output !== undefined
                                        ? String(tc.Output)
                                        : ''
                                    }
                                    onChange={e =>
                                      handleHiddenTestCaseChange(
                                        index,
                                        'Output',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <button
                                  onClick={() => removeHiddenTestCase(index)}
                                  className={`text-[0.75rem] font-semibold underline mt-[0.5rem] transition-colors duration-200 ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
                                >
                                  Remove
                                </button>
                              </div>
                            )
                          )}
                          <button
                            onClick={addHiddenTestCase}
                            className={`text-[0.875rem] font-semibold underline transition-colors duration-200 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                          >
                            Add Hidden Test Case
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-[0.75rem]">
                          {Array.isArray(editedQuestion.Hidden_Test_Cases) &&
                          editedQuestion.Hidden_Test_Cases.length > 0 ? (
                            editedQuestion.Hidden_Test_Cases.map(
                              (tc, index) => (
                                <div
                                  key={index}
                                  className={`p-[1rem] rounded-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                                >
                                  <p
                                    className={`text-[0.75rem] font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                                  >
                                    Test Case {index + 1}
                                  </p>
                                  <pre
                                    className={`text-[0.875rem] font-[Inter] whitespace-pre-wrap mt-[0.25rem] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                                  >
                                    Input:{' '}
                                    {tc.Input !== undefined
                                      ? String(tc.Input)
                                      : '(empty)'}
                                  </pre>
                                  <pre
                                    className={`text-[0.875rem] font-[Inter] whitespace-pre-wrap mt-[0.5rem] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                                  >
                                    Output:{' '}
                                    {tc.Output !== undefined
                                      ? String(tc.Output)
                                      : '(empty)'}
                                  </pre>
                                </div>
                              )
                            )
                          ) : (
                            <p
                              className={`text-[0.875rem] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                              No hidden test cases available.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-[0.875rem] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
                >
                  No question data available. Please try again or contact
                  support.
                </p>
              )}
              <div
                className={`absolute bottom-0 left-6 w-[95%] z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'border-gray-300'}`}
              >
                <OutputPanel
                  customInputEnabled={customInputEnabled}
                  setCustomInputEnabled={setCustomInputEnabled}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                  testCases={testCases}
                  hiddenTestCaseResults={hiddenTestCaseResults}
                  testCaseSummary={testCaseSummary}
                  hiddenTestCaseSummary={hiddenTestCaseSummary}
                  handleRun={handleRun}
                  loading={loading}
                  theme={theme}
                  setTheme={setTheme}
                  initialIndex={initialIndex}
                  isOutputVisible={isOutputVisible}
                  setIsOutputVisible={setIsOutputVisible}
                />
              </div>
            </div>
          </div>
          {/* Right Panel: Editor */}
          <div
            className={`lg:w-1/2 w-full p-[1.5rem] flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-[1.5rem]">
              <div className="mb-[1rem] sm:mb-0">
                <label
                  className={`block text-[0.875rem] font-semibold mb-[0.25rem] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Select Language:
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className={`text-[0.875rem] px-[0.75rem] py-[0.5rem] rounded-sm focus:ring-[0.125rem] focus:ring-blue-500 focus:outline-none transition-all duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 border-[0.0625rem] border-gray-600' : 'bg-white text-gray-800 border-[0.0625rem] border-gray-200'}`}
                >
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C">C</option>
                  <option value="C++">C++</option>
                  <option value="JavaScript">JavaScript</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-[0.5rem]">
                <button
                  onClick={handleBack}
                  className={`px-[1rem] py-[0.5rem] text-white text-[0.875rem] font-semibold rounded-sm transition-colors duration-200 ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Back
                </button>
                <button
                  onClick={() => handleRun(false)}
                  disabled={loading || !questionId}
                  className={`px-[1rem] py-[0.5rem] text-white text-[0.875rem] font-semibold rounded-sm transition-colors duration-200 ${
                    loading || !questionId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {loading ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={handlePrevious}
                  disabled={initialIndex === 0}
                  className={`px-[1rem] py-[0.5rem] text-white text-[0.875rem] font-semibold rounded-sm transition-colors duration-200 ${
                    initialIndex === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Previous Question
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    initialIndex >=
                    (fetchedQuestionsList.length ||
                      initialQuestionsList.length) -
                      1
                  }
                  className={`px-[1rem] py-[0.5rem] text-white text-[0.875rem] font-semibold rounded-sm transition-colors duration-200 ${
                    initialIndex >=
                    (fetchedQuestionsList.length ||
                      initialQuestionsList.length) -
                      1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Next Question
                </button>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={`p-[0.5rem] text-[0.875rem] font-semibold rounded-sm transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  title={
                    theme === 'light'
                      ? 'Switch to Dark Theme'
                      : 'Switch to Light Theme'
                  }
                >
                  {theme === 'light' ? (
                    <FiSun size="1.25rem" />
                  ) : (
                    <FiMoon size="1.25rem" />
                  )}
                </button>
              </div>
            </div>
            <div
              className={`border-[0.0625rem] rounded-sm mb-[1.5rem] flex-grow min-h-[25rem] overflow-hidden shadow-[inset_0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ${theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-200 bg-gray-900'}`}
            >
              <CodeMirror
                value={code || ''}
                height="100%"
                theme={theme === 'dark' ? oneDark : 'light'}
                extensions={[
                  EditorView.lineWrapping,
                  languageExtensions[language],
                  EditorView.theme({
                    '&': {
                      fontFamily: 'Inter',
                      fontSize: '18px',
                    },
                  }),
                ]}
                onChange={handleCodeChange}
                className="h-full"
              />
            </div>
            <div className="mb-[1.5rem]">
              <label
                className={`flex items-center space-x-[0.5rem] text-[0.875rem] font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <input
                  type="checkbox"
                  className={`w-[1rem] h-[1rem] focus:ring-blue-500 focus:outline-none rounded ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                  checked={customInputEnabled}
                  onChange={() => {
                    setCustomInputEnabled(prev => !prev);
                    if (customInputEnabled) {
                      setCustomInput('');
                    }
                  }}
                />
                <span>Enable Custom Input</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnlineCompiler;
