import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  startExam,
  compileAndRun,
  submitExam as submitExamService,
} from '../services/examService';
import { resetAllState } from './resetAllSlices';

const initialState = {
  activeTab: 'Quiz',
  codingSidebarWidth: 50,
  isOutputVisible: false,
  isMinimized: false,
  mode: 'testcase',
  initialTab: 'Compilation Results',
  examStarted: false,
  isSubmitted: false,
  showSubmitConfirm: false,
  examData: null,
  examType: null,
  existingData: {},
  selectedMCQ: true,
  selectedMcqId: null,
  selectedCodingId: null,
  mcqQuestions: [],
  codingQuestions: [],
  startExamLoading: false,
  startExamError: null,
  studentExamId: null,
  totalExamTime: null,
  questionStatuses: {},
  compileResults: [],
  customInputResults: [],
  compileStatus: null,
  compileError: null,
  codeByQuestion: {},
  selectedSubject: '', // Added selectedSubject
};

// Async thunk for starting an exam
export const createExam = createAsyncThunk(
  'examModule/createExam',
  async ({ examId, collectionName }, { rejectWithValue }) => {
    try {
      const examData = await startExam(examId, collectionName);
      // Normalize the response to the array format
      let normalizedData;
      if (Array.isArray(examData)) {
        normalizedData = examData;
      } else if (examData?.exam && examData?.success !== undefined) {
        const derivedCollectionName =
          collectionName ||
          examData.exam.examName.split('-').slice(0, 2).join('-');
        normalizedData = [
          {
            examId: examData.exam.examId,
            collectionName: derivedCollectionName,
          },
          {
            exam: {
              ...examData.exam,
              paper: examData.exam.paper.map(paper => ({
                ...paper,
                Coding: paper.Coding || [],
                MCQs: paper.MCQs || [],
              })),
            },
            success: examData.success,
          },
        ];
      } else {
        throw new Error('Invalid exam data format');
      }
      return normalizedData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start exam');
    }
  }
);

// Async thunk for running code
export const runCode = createAsyncThunk(
  'examModule/runCode',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const response = await compileAndRun(payload);
      const testCases = Array.isArray(response.results) ? response.results : [];
      const normalizedTestCases = testCases.map((tc, index) => ({
        status: tc.status || (tc.passed ? 'Passed' : 'Failed'),
        input: tc.input || '',
        actual_output: tc.actual_output || null,
        expected_output: tc.expected_output || '',
        type: tc.type || (payload.custom_input_enabled ? 'custom' : 'test'),
        index: tc.index !== undefined ? tc.index : index,
      }));
      if (payload.custom_input_enabled && testCases.length === 0) {
        normalizedTestCases.push({
          status: response.status || 'Passed',
          input: payload.custom_input || '',
          actual_output: response.actual_output || response.output || null,
          expected_output: '',
          type: 'custom',
          index: 0,
        });
      }
      const result = {
        question_id: payload.question_id,
        results: normalizedTestCases,
        isCustomInput: payload.custom_input_enabled,
      };
      return result;
    } catch (error) {
      console.error('runCode error:', error);
      return rejectWithValue(error.message || 'Failed to compile and run code');
    }
  }
);

// Async thunk for submitting exam
export const submitExam = createAsyncThunk(
  'examModule/submitExam',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().examModule;
      const {
        examData,
        studentExamId,
        questionStatuses,
        codeByQuestion,
        codingQuestions,
      } = state;

      const rawName = examData?.[1]?.exam?.examName;
      const exam = rawName?.replace(/-\d+$/, '');

      const payload = {
        examId: studentExamId || 'undefined',
        exam: exam,
      };

      Object.keys(questionStatuses).forEach(key => {
        if (key.startsWith('mcq_')) {
          const questionId = key.replace('mcq_', '');
          const status = questionStatuses[key];
          if (status.selectedOption >= 0) {
            payload[questionId] = {
              selectedOption: String.fromCharCode(65 + status.selectedOption),
            };
          }
        }
      });

      Object.keys(codeByQuestion).forEach(questionId => {
        const question = codingQuestions.find(q => q.questionId === questionId);
        if (question && codeByQuestion[questionId]) {
          const compileResult =
            state.compileResults.find(r => r.question_id === questionId)
              ?.results || [];

          const subject = question.Subject?.toLowerCase() || '';
          const language = subject.includes('java')
            ? 'java'
            : subject.includes('python')
              ? 'python'
              : subject.includes('c++') || subject.includes('cpp')
                ? 'cpp' // ✅ use cpp here
                : subject === 'c'
                  ? 'c'
                  : 'python';

          payload[questionId] = {
            sourceCode: codeByQuestion[questionId],
            language,
            testCaseSummary:
              compileResult.length > 0
                ? {
                    passed: compileResult.filter(
                      tc => tc.status.toLowerCase() === 'passed'
                    ).length,
                    failed: compileResult.filter(
                      tc =>
                        tc.status.toLowerCase() === 'failed' ||
                        tc.status.toLowerCase() === 'skipped'
                    ).length,
                  }
                : { passed: 0, failed: 0 },
          };
        }
      });

      const response = await submitExamService(payload);
      return { ...response, success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit exam');
    }
  }
);

const examModuleSlice = createSlice({
  name: 'examModule',
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      state.selectedMCQ = action.payload === 'Quiz';
    },
    setCodingSidebarWidth(state, action) {
      state.codingSidebarWidth = action.payload;
    },
    setIsOutputVisible(state, action) {
      state.isOutputVisible = action.payload;
    },
    setIsMinimized(state, action) {
      state.isMinimized = action.payload;
    },
    setMode(state, action) {
      state.mode = action.payload;
    },
    setInitialTab(state, action) {
      state.initialTab = action.payload;
    },
    setExamStarted(state, action) {
      state.examStarted = action.payload;
    },
    setIsSubmitted(state, action) {
      state.isSubmitted = action.payload;
    },
    setShowSubmitConfirm(state, action) {
      state.showSubmitConfirm = action.payload;
    },
    setExamData(state, action) {
      state.examData = action.payload;
      let mcqCounter = 1;
      let codingCounter = 1;
      const allMcqQuestions = [];
      const allCodingQuestions = [];

      if (action.payload?.[1]?.exam?.paper) {
        action.payload[1].exam.paper.forEach((paper, paperIndex) => {
          if (paper.MCQs) {
            const mcqsWithUniqueNumbers = paper.MCQs.map((mcq, index) => ({
              ...mcq,
              Question_No: mcqCounter,
              displayNumber: mcqCounter++,
              originalQuestionNo: mcq.Question_No,
              paperIndex,
            }));
            allMcqQuestions.push(...mcqsWithUniqueNumbers);
          }
          if (paper.Coding) {
            const codingWithUniqueNumbers = paper.Coding.map(
              (coding, index) => ({
                ...coding,
                Question_No: codingCounter,
                displayNumber: codingCounter++,
                originalQuestionNo: coding.Question_No,
                paperIndex,
              })
            );
            allCodingQuestions.push(...codingWithUniqueNumbers);
          }
        });
      }

      state.mcqQuestions = allMcqQuestions;
      state.codingQuestions = allCodingQuestions;
      state.selectedMcqId = allMcqQuestions[0]?.questionId || null;
      state.selectedCodingId = allCodingQuestions[0]?.questionId || null;
      // Set default selectedSubject
      state.selectedSubject =
        action.payload?.[1]?.exam?.paper?.[0]?.subject || '';
    },
    setExamType(state, action) {
      state.examType = action.payload;
    },
    setExistingData(state, action) {
      state.existingData = action.payload;
    },
    setSelectedMCQ(state, action) {
      state.selectedMCQ = action.payload;
    },
    setSelectedMcqId(state, action) {
      state.selectedMcqId = action.payload;
    },
    setSelectedCodingId(state, action) {
      state.selectedCodingId = action.payload;
    },
    setMcqQuestions(state, action) {
      state.mcqQuestions = action.payload;
    },
    setCodingQuestions(state, action) {
      state.codingQuestions = action.payload;
    },
    setQuestionStatus(state, action) {
      const { questionId, isAnswered, isMarked, selectedOption } =
        action.payload;
      state.questionStatuses[questionId] = {
        isAnswered,
        isMarked,
        selectedOption,
      };
    },
    setQuestionCode(state, action) {
      const { questionId, code } = action.payload;
      state.codeByQuestion[questionId] = code;
    },
    setSelectedSubject(state, action) {
      state.selectedSubject = action.payload;
    },
    clearCompileState(state) {
      state.compileResults = [];
      state.customInputResults = [];
      state.compileStatus = null;
      state.compileError = null;
    },
    clearExamState(state) {
      state.examStarted = false;
      state.isSubmitted = false;
      state.showSubmitConfirm = false;
      state.examData = null;
      state.studentExamId = null;
      state.totalExamTime = null;
      state.mcqQuestions = [];
      state.codingQuestions = [];
      state.selectedMcqId = null;
      state.selectedCodingId = null;
      state.questionStatuses = {};
      state.codeByQuestion = {};
      state.compileResults = [];
      state.customInputResults = [];
      state.compileStatus = null;
      state.compileError = null;
      state.selectedSubject = '';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createExam.pending, state => {
        state.startExamLoading = true;
        state.startExamError = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.startExamLoading = false;
        state.examStarted = true;
        state.examData = action.payload;
        state.studentExamId =
          action.payload[1]?.exam?.studentExamId ||
          action.payload[1]?.exam?.examId ||
          action.payload[0]?.examId;
        state.totalExamTime = action.payload[1]?.exam?.totalExamTime || 0;
        let mcqCounter = 1;
        let codingCounter = 1;
        const allMcqQuestions = [];
        const allCodingQuestions = [];

        if (action.payload?.[1]?.exam?.paper) {
          action.payload[1].exam.paper.forEach((paper, paperIndex) => {
            if (paper.MCQs) {
              const mcqsWithUniqueNumbers = paper.MCQs.map((mcq, index) => ({
                ...mcq,
                Question_No: mcqCounter,
                displayNumber: mcqCounter++,
                originalQuestionNo: mcq.Question_No,
                paperIndex,
              }));
              allMcqQuestions.push(...mcqsWithUniqueNumbers);
            }
            if (paper.Coding) {
              const codingWithUniqueNumbers = paper.Coding.map(
                (coding, index) => ({
                  ...coding,
                  Question_No: codingCounter,
                  displayNumber: codingCounter++,
                  originalQuestionNo: coding.Question_No,
                  paperIndex,
                })
              );
              allCodingQuestions.push(...codingWithUniqueNumbers);
            }
          });
        }

        state.mcqQuestions = allMcqQuestions;
        state.codingQuestions = allCodingQuestions;
        state.selectedMcqId = allMcqQuestions[0]?.questionId || null;
        state.selectedCodingId = allCodingQuestions[0]?.questionId || null;
        state.selectedSubject =
          action.payload?.[1]?.exam?.paper?.[0]?.subject || '';
      })
      .addCase(createExam.rejected, (state, action) => {
        state.startExamLoading = false;
        state.startExamError = action.payload || 'Failed to start exam';
      })
      .addCase(runCode.pending, (state, action) => {
        state.compileStatus = 'compiling';
        state.compileError = null;
        state.isOutputVisible = true;
        state.isMinimized = false;
        if (!action.meta.arg.custom_input_enabled) {
          state.mode = 'testcase';
        }
        state.initialTab = 'Compilation Results';
      })
      .addCase(runCode.fulfilled, (state, action) => {
        state.compileStatus = 'success';
        state.isOutputVisible = true;
        state.isMinimized = false;
        const { question_id, results, isCustomInput } = action.payload;
        const targetArray = isCustomInput
          ? state.customInputResults
          : state.compileResults;
        const existingIndex = targetArray.findIndex(
          r => r.question_id === question_id
        );
        if (existingIndex >= 0) {
          targetArray[existingIndex] = { question_id, results };
        } else {
          targetArray.push({ question_id, results });
        }
        if (!isCustomInput) {
          const allPassed =
            results.length > 0 &&
            results.every(tc => tc.status.toLowerCase() === 'passed');
          if (allPassed) {
            const questionId = `code_${question_id}`;
            state.questionStatuses[questionId] = {
              isAnswered: true,
              isMarked: state.questionStatuses[questionId]?.isMarked || false,
              selectedOption: -1,
            };
          }
        }
      })
      .addCase(runCode.rejected, (state, action) => {
        state.compileStatus = 'failed';
        state.compileError = action.payload || 'Failed to compile and run code';
        state.isOutputVisible = true;
        state.isMinimized = false;
      })
      .addCase(submitExam.pending, state => {
        state.startExamLoading = true;
        state.startExamError = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.startExamLoading = false;
        state.isSubmitted = true;
        state.examStarted = false;
        state.showSubmitConfirm = false;
        state.compileResults = [];
        state.customInputResults = [];
        state.compileStatus = null;
        state.compileError = null;
        state.examData = null;
        state.selectedSubject = '';
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.startExamLoading = false;
        state.startExamError = action.payload || 'Failed to submit exam';
      })
      .addCase(resetAllState, () => initialState);
  },
});

export const {
  setActiveTab,
  setCodingSidebarWidth,
  setIsOutputVisible,
  setIsMinimized,
  setMode,
  setInitialTab,
  setExamStarted,
  setIsSubmitted,
  setShowSubmitConfirm,
  setExamData,
  setExamType,
  setExistingData,
  setSelectedMCQ,
  setSelectedMcqId,
  setSelectedCodingId,
  setMcqQuestions,
  setCodingQuestions,
  setQuestionStatus,
  setQuestionCode,
  setSelectedSubject,
  clearCompileState,
  clearExamState,
} = examModuleSlice.actions;

export default examModuleSlice.reducer;
