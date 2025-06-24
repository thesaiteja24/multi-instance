import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { githubLight } from '@uiw/codemirror-theme-github';

// Constants for styling
const STYLES = {
  input:
    'w-full border border-[#00007F] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base',
  textarea:
    'w-full border border-[#00007F] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] overflow-auto text-sm sm:text-base',
  button:
    'w-full py-3 rounded-md text-white transition font-medium text-sm sm:text-base',
  link: 'text-blue-600 hover:underline font-semibold text-sm sm:text-base',
};

// Constants for validation and options
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const LANGUAGES = ['python', 'java', 'c', 'cpp', 'javascript'];

const CreateCoding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [tagCountPerDay, setTagCountPerDay] = useState({});
  const [tagToTopicMap, setTagToTopicMap] = useState({});
  const [nextTag, setNextTag] = useState(null);
  const [prevTag, setPrevTag] = useState(null);
  const [compiledOutputs, setCompiledOutputs] = useState({
    sample: '',
    hidden: [],
  });
  const { userInfo } = useSelector(state => state.auth);
  const testerId = userInfo?.id;
  const subjectParam = searchParams.get('subject') || '';
  const tagsParam = searchParams.get('tags')?.toLowerCase() || 'day-1:1';

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: subjectParam,
      tag: tagsParam,
      question: '',
      sourceCode: '',
      language: 'python',
      sampleInput: '',
      hiddenCases: [{ Input: '' }],
      constraints: '',
      score: 5,
      difficulty: '',
      explanation: '',
      explanationURL: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'hiddenCases',
  });

  // Map language to CodeMirror language extension
  const getLanguageExtension = language => {
    switch (language) {
      case 'python':
        return python();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      case 'javascript':
        return javascript();
      default:
        return python();
    }
  };

  // Prefill subject and tag from URL params
  useEffect(() => {
    setValue('subject', subjectParam);
    setValue('tag', tagsParam);
  }, [subjectParam, tagsParam, setValue]);

  // Fetch syllabus data
  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!testerId) {
        toast.error('Invalid tester ID. Please log in again.');
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester-curriculum?id=${testerId}`
        );
        const data = response.data;

        if (!data?.curriculumTable) {
          throw new Error('Curriculum table not found in response');
        }

        const dayIdToDayNumber = {};
        const subjectDays = Object.keys(
          data.curriculumTable[subjectParam] || {}
        );
        subjectDays.forEach((dayId, index) => {
          dayIdToDayNumber[dayId] = index + 1;
        });

        const curriculumData = Object.entries(data.curriculumTable).flatMap(
          ([subject, days]) =>
            Object.entries(days).map(([dayId, dayData]) => {
              const dayNumber = dayIdToDayNumber[dayId] || parseInt(dayId);
              return {
                subject,
                DayOrder: `Day-${dayNumber}`,
                Topics: dayData.Topics || 'Unknown Topic',
                SubTopics: dayData.SubTopics.map(sub => sub.title || 'N/A'),
                originalSubTopics: dayData.SubTopics,
              };
            })
        );

        curriculumData.sort((a, b) => {
          const dayA = parseInt(a.DayOrder.split('-')[1] || 0);
          const dayB = parseInt(b.DayOrder.split('-')[1] || 0);
          return dayA - dayB;
        });

        const filteredCurriculum = curriculumData.filter(
          item => item.subject === subjectParam
        );

        const groupedByDay = filteredCurriculum.reduce((acc, item) => {
          if (!acc[item.DayOrder]) acc[item.DayOrder] = [];
          acc[item.DayOrder].push(item);
          return acc;
        }, {});

        const tagCountPerDay = {};
        const tagToTopicMap = {};
        Object.entries(groupedByDay).forEach(([dayOrder, items]) => {
          let totalTags = 0;
          const dayNumber = parseInt(dayOrder.split('-')[1]);
          items.forEach(item => {
            if (
              !Array.isArray(item.originalSubTopics) ||
              item.originalSubTopics.length === 0
            ) {
              return;
            }
            item.originalSubTopics.forEach(sub => {
              if (!sub.tag || !sub.title) {
                return;
              }
              const normalizedTag = sub.tag.toLowerCase();
              tagToTopicMap[normalizedTag] = item.Topics || 'Unknown Topic';
              totalTags++;
            });
            tagCountPerDay[`day-${dayNumber}`] = totalTags;
          });
        });

        setTagCountPerDay(tagCountPerDay);
        setTagToTopicMap(tagToTopicMap);

        const { nextTag, prevTag } = getNextAndPreviousTags(
          tagsParam,
          groupedByDay,
          tagCountPerDay
        );
        setNextTag(nextTag);
        setPrevTag(prevTag);
      } catch (error) {
        console.error('Error fetching syllabus data:', error);
        toast.error('Failed to fetch syllabus data.');
      }
    };

    fetchSyllabus();
  }, [subjectParam, tagsParam, testerId]);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = e => {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.closest('.cm-editor')
      ) {
        return;
      }

      if (e.key === 'ArrowRight' && nextTag) {
        handleTagNavigation(nextTag);
      } else if (e.key === 'ArrowLeft' && prevTag) {
        handleTagNavigation(prevTag);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextTag, prevTag]);

  // Helper function to get day number
  const getDayNumber = dayOrderStr => {
    const parts = dayOrderStr.split('-');
    return parts.length > 1 ? parseInt(parts[1]) : parseInt(dayOrderStr);
  };

  // Helper function to get next and previous tags
  const getNextAndPreviousTags = useCallback(
    (currentTag, groupedByDay, tagCountPerDay) => {
      if (!currentTag || !currentTag.includes('day-')) {
        return { nextTag: null, prevTag: null };
      }

      const normalizedTag = currentTag.toLowerCase();
      const match = normalizedTag.match(/day-(\d+):(\d+)/i);
      if (!match) {
        return { nextTag: null, prevTag: null };
      }

      const currentDayNumber = parseInt(match[1]);
      const currentTagIndex = parseInt(match[2]);

      const dayNumbers = Object.keys(groupedByDay)
        .map(dayOrder => getDayNumber(dayOrder))
        .sort((a, b) => a - b);

      if (!dayNumbers.length) {
        return { nextTag: null, prevTag: null };
      }

      const currentDayKey = `day-${currentDayNumber}`;
      const totalTagsInCurrentDay = tagCountPerDay[currentDayKey] || 0;
      const currentDayIndex = dayNumbers.indexOf(currentDayNumber);

      let nextTag = null;
      let prevTag = null;

      if (currentTagIndex < totalTagsInCurrentDay) {
        nextTag = `Day-${currentDayNumber}:${currentTagIndex + 1}`;
      } else if (currentDayIndex < dayNumbers.length - 1) {
        const nextDayNumber = dayNumbers[currentDayIndex + 1];
        nextTag = `Day-${nextDayNumber}:1`;
      }

      if (currentTagIndex > 1) {
        prevTag = `Day-${currentDayNumber}:${currentTagIndex - 1}`;
      } else if (currentDayIndex > 0) {
        const prevDayNumber = dayNumbers[currentDayIndex - 1];
        const prevDayKey = `day-${prevDayNumber}`;
        const totalTagsInPrevDay = tagCountPerDay[prevDayKey] || 0;
        if (totalTagsInPrevDay > 0) {
          prevTag = `Day-${prevDayNumber}:${totalTagsInPrevDay}`;
        }
      }

      return { nextTag, prevTag };
    },
    []
  );

  // Handle tag navigation
  const handleTagNavigation = tag => {
    if (tag) {
      navigate(
        `/tester/create-questions/coding?subject=${subjectParam}&tags=${tag}`
      );
    } else {
      toast.error('Unable to navigate: Invalid tag.');
    }
  };

  // Compile code and display outputs
  const handleCompile = async () => {
    setIsCompiling(true);
    const formData = getValues();

    setCompiledOutputs({
      sample: '',
      hidden: [],
    });

    if (!import.meta.env.VITE_BACKEND_URL) {
      toast.error('Backend URL is not configured. Please check environment.');
      setIsCompiling(false);
      return;
    }

    const inputs = [];

    if (formData.sampleInput) {
      inputs.push(formData.sampleInput);
    }

    if (formData.hiddenCases && formData.hiddenCases.length > 0) {
      formData.hiddenCases.forEach(testCase => {
        if (testCase.Input) {
          inputs.push(testCase.Input);
        }
      });
    }

    if (!formData.sourceCode) {
      toast.error('Source code is required to compile.');
      setIsCompiling(false);
      return;
    }
    if (!formData.language) {
      toast.error('Please select a programming language.');
      setIsCompiling(false);
      return;
    }
    if (inputs.length === 0) {
      toast.error(
        'At least one input (sample or hidden test case) is required to compile.'
      );
      setIsCompiling(false);
      return;
    }

    const payload = {
      source_code: formData.sourceCode,
      language: formData.language,
      test_cases: inputs,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/run-code`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { status, message, results, errors } = response.data;

      if (status === 'success' && Array.isArray(results)) {
        toast.success(message || 'Code compiled successfully', {
          autoClose: 3000,
        });

        const newCompiledOutputs = {
          sample: '',
          hidden: [],
        };

        results.forEach((result, index) => {
          const actualOutput = result.output || '';
          const output = actualOutput || 'No output';

          if (index === 0) {
            newCompiledOutputs.sample = output;
          } else {
            newCompiledOutputs.hidden[index - 1] = output;
          }

          toast.info(
            `${index === 0 ? 'Sample Test Case' : `Hidden Test Case ${index}`}: Output generated`,
            {
              autoClose: 4000,
            }
          );
        });

        setCompiledOutputs(newCompiledOutputs);
      } else if (status === 'error' && errors) {
        toast.error(
          `Compilation failed: ${errors || message || 'Unknown error'}`,
          {
            autoClose: 4000,
          }
        );
      } else {
        toast.error('Unexpected response from server.', {
          autoClose: 4000,
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          'Failed to compile code. Please try again.',
        {
          autoClose: 4000,
        }
      );
    } finally {
      setIsCompiling(false);
    }
  };

  // Submit form to upload question
  const onSubmit = async data => {
    setIsSubmitting(true);
    try {
      if (!compiledOutputs.sample || compiledOutputs.sample === 'No output') {
        toast.error(
          'Please compile the code to generate outputs before submitting.'
        );
        setIsSubmitting(false);
        return;
      }

      if (data.hiddenCases && data.hiddenCases.length > 0) {
        for (let idx = 0; idx < data.hiddenCases.length; idx++) {
          if (
            !compiledOutputs.hidden[idx] ||
            compiledOutputs.hidden[idx] === 'No output'
          ) {
            toast.error(
              `Please compile the code to generate output for Hidden Test Case ${idx + 1} before submitting.`
            );
            setIsSubmitting(false);
            return;
          }
        }
      }

      const formData = new FormData();
      const questionObj = {
        internId: testerId,
        Question_Type: 'code_test',
        Subject: data.subject.toLowerCase(),
        Question: data.question,
        Sample_Input: data.sampleInput,
        Sample_Output: compiledOutputs.sample,
        Constraints: data.constraints || '',
        Score: data.score || '',
        Tags: data.tag.toLowerCase(),
        Difficulty: data.difficulty || '',
        Text_Explanation: data.explanation || '',
        Explanation_URL: data.explanationURL || '',
      };

      data.hiddenCases.forEach((tc, idx) => {
        const i = idx + 1;
        questionObj[`Hidden_Test_case_${i}_Input`] = tc.Input;
        questionObj[`Hidden_Test_case_${i}_Output`] =
          compiledOutputs.hidden[idx];
      });

      formData.append('data', JSON.stringify([questionObj]));

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/test-upload-questions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(
        response.data.message || 'Question submitted successfully',
        {
          autoClose: 2000,
        }
      );
      toast.info(
        `Total Questions Created on ${tagsParam}: ${response.data.codeCreatedForTag || 0}`,
        {
          autoClose: 2000,
        }
      );

      reset();
      setCompiledOutputs({
        sample: '',
        hidden: [],
      });
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          'Failed to submit question. Please try again.',
        {
          autoClose: 4000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-8 md:p-12 min-h-screen font-inter">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-5xl">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-[#00007F] font-poppins mb-6">
          CODE QUESTION FORM
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SUBJECT <span className="text-red-500">*</span>
              </label>
              <input
                {...register('subject', { required: 'Subject is required' })}
                readOnly
                className={`${STYLES.input} bg-gray-100`}
                placeholder="Ex: Data Analysis"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                TAG <span className="text-red-500">*</span>
              </label>
              <input
                {...register('tag', { required: 'Tag is required' })}
                readOnly
                className={`${STYLES.input} bg-gray-100`}
                placeholder="Ex: Day-10:1"
              />
              {errors.tag && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tag.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SCORE <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                {...register('score', {
                  required: 'Score is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Score must be at least 1' },
                })}
                placeholder="Ex: 1 Points"
                className={STYLES.input}
                onBlur={e => {
                  const val = e.target.valueAsNumber || Number(e.target.value);
                  if (val < 1) setValue('score', 1);
                }}
              />
              {errors.score && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.score.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                DIFFICULTY <span className="text-red-500">*</span>
              </label>
              <select
                {...register('difficulty', {
                  required: 'Difficulty is required',
                })}
                className={STYLES.input}
              >
                <option value="">Select Difficulty</option>
                {DIFFICULTIES.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
              {errors.difficulty && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.difficulty.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                LANGUAGE <span className="text-red-500">*</span>
              </label>
              <select
                {...register('language', { required: 'Language is required' })}
                className={STYLES.input}
                onChange={e => setValue('language', e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.language.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                QUESTION <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('question', { required: 'Question is required' })}
                placeholder="Ex: Type the coding question..."
                className={`${STYLES.textarea} h-28`}
              />
              {errors.question && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.question.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                CONSTRAINTS <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('constraints', {
                  required: 'Constraints are required',
                })}
                placeholder="Ex: 0 < num < 100..."
                className={`${STYLES.textarea} h-28`}
              />
              {errors.constraints && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.constraints.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SOURCE CODE <span className="text-red-500">*</span>
              </label>
              <CodeMirror
                value={getValues('sourceCode')}
                height="400px"
                extensions={[getLanguageExtension(getValues('language'))]}
                theme={githubLight}
                onChange={value => setValue('sourceCode', value)}
                className="mt-1 w-full border border-[#00007F] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.sourceCode && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sourceCode.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SAMPLE INPUT <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('sampleInput', {
                  required: 'Sample input is required',
                })}
                placeholder="Ex: 5"
                className={`${STYLES.textarea} h-36`}
              />
              {errors.sampleInput && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sampleInput.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                SAMPLE OUTPUT <span className="text-red-500">*</span>
              </label>
              <textarea
                value={compiledOutputs.sample || 'No output yet'}
                readOnly
                className={`${STYLES.textarea} h-36 bg-gray-100`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
              HIDDEN TEST CASES <span className="text-red-500">*</span>
            </label>
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="border border-[#00007F] rounded-md p-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm sm:text-base font-medium text-[#00007F] font-poppins">
                      HIDDEN TEST CASE {idx + 1} INPUT
                    </label>
                    <textarea
                      {...register(`hiddenCases.${idx}.Input`, {
                        required: 'Input required',
                      })}
                      placeholder="Input"
                      className={`${STYLES.textarea} h-36`}
                    />
                    {errors.hiddenCases?.[idx]?.Input && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.hiddenCases[idx].Input.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-red-500 hover:underline self-center mt-8 text-sm sm:text-base font-medium"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-[#00007F] font-poppins">
                      COMPILED OUTPUT (WITH PARSING)
                    </label>
                    <pre className="mt-1 w-full p-3 border border-[#00007F] rounded-md bg-gray-100 h-36 overflow-auto text-sm sm:text-base text-gray-700">
                      {compiledOutputs.hidden[idx] || 'No output yet'}
                    </pre>
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-[#00007F] font-poppins">
                      COMPILED OUTPUT (WITHOUT PARSING)
                    </label>
                    <pre className="mt-1 w-full p-3 border border-[#00007F] rounded-md bg-gray-100 h-36 overflow-auto text-sm sm:text-base text-gray-700">
                      {JSON.stringify(compiledOutputs.hidden[idx]) ||
                        'No output yet'}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ Input: '' })}
              className={STYLES.link}
            >
              + Add Hidden Test Case
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                EXPLANATION
              </label>
              <textarea
                {...register('explanation')}
                placeholder="Ex: Add an Explanation..."
                className={`${STYLES.textarea} h-36`}
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base md:text-lg font-medium text-[#00007F] font-poppins">
                EXPLANATION URL
              </label>
              <input
                {...register('explanationURL')}
                placeholder="Ex: https://..."
                className={STYLES.input}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCompile}
              disabled={isCompiling}
              className={`${STYLES.button} ${
                isCompiling
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#00007F] hover:bg-blue-700'
              }`}
            >
              {isCompiling ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-50"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 4.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Compiling...</span>
                </div>
              ) : (
                'COMPILE ALL TEST CASES'
              )}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${STYLES.button} ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#00007F] hover:bg-blue-800'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-50"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 4.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Submitting...</span>
                </div>
              ) : (
                'SUBMIT CODE QUESTION >'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoding;
