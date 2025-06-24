import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { ChevronDown, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useSelector } from 'react-redux';

const VerifyMCQ = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subjectParam = searchParams.get('subject') || 'Python';
  const tagsParam = searchParams.get('tags')?.toLowerCase() || 'day-1:1';
  const { userInfo } = useSelector(state => state.auth);
  const testerId = userInfo?.id;
  const questionType = 'mcq_test';

  const [questions, setQuestions] = useState([]);
  const [isDumping, setIsDumping] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [tagCountPerDay, setTagCountPerDay] = useState({});
  const [tagToTopicMap, setTagToTopicMap] = useState({});
  const [nextTag, setNextTag] = useState(null);
  const [prevTag, setPrevTag] = useState(null);
  const [verificationSummary, setVerificationSummary] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState({});
  const [editPreview, setEditPreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Calculate questions per page
  const calculateQuestionsPerPage = () => {
    const headerHeight = 180;
    const paginationHeight = 50;
    const questionHeight = 51;
    const availableHeight =
      window.innerHeight - headerHeight - paginationHeight;
    return Math.max(1, Math.floor(availableHeight / questionHeight));
  };

  const [questionsPerPage, setQuestionsPerPage] = useState(
    calculateQuestionsPerPage()
  );

  useEffect(() => {
    const handleResize = () => {
      setQuestionsPerPage(calculateQuestionsPerPage());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch syllabus data
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/tester-curriculum?id=${testerId}`
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
          const dayNumber = getDayNumber(dayOrder);
          items.forEach(item => {
            if (
              !Array.isArray(item.originalSubTopics) ||
              item.originalSubTopics.length === 0
            ) {
              console.warn(
                `No valid SubTopics for ${item.subject} on ${dayOrder}`
              );
              return;
            }
            item.originalSubTopics.forEach(sub => {
              if (!sub.tag || !sub.title) {
                console.warn(
                  `Invalid subtopic at ${item.subject} ${dayOrder}:`,
                  sub
                );
                return;
              }
              const normalizedTag = sub.tag
                .toLowerCase()
                .replace('day-', 'day-');
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

  // Fetch MCQ questions
  useEffect(() => {
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/v1/question-crud?internId=${testerId}&subject=${subjectParam}&tags=${tagsParam}`;
    axios
      .get(url)
      .then(response => {
        const data = response.data;
        if (data?.mcqQuestions) {
          const formattedQuestions = data.mcqQuestions.map((q, index) => ({
            ...q,
            Question_No: q.Question_No || index + 1,
            options: [q.Options.A, q.Options.B, q.Options.C, q.Options.D],
            number: index + 1,
          }));
          setQuestions(formattedQuestions);
        }
      })
      .catch(err => {
        console.error('Error fetching MCQ data:', err);
        toast.error('Failed to fetch questions.');
      });
  }, [subjectParam, tagsParam]);

  // Fetch verification summary
  const fetchVerificationSummary = useCallback(async () => {
    try {
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/verify-question?internId=${testerId}&subject=${subjectParam.toLowerCase()}&questionType=${questionType}`;
      const response = await axios.get(url);
      const data = response.data;
      if (!data.success || !Array.isArray(data.verifications)) {
        throw new Error('Invalid verification summary response');
      }

      setVerifications(data.verifications);

      const summary = {};
      data.verifications.forEach(v => {
        const { subject, tag, verified } = v;
        if (!summary[subject]) {
          summary[subject] = {};
        }
        if (!summary[subject][tag]) {
          summary[subject][tag] = {
            totalQuestions: 0,
            verifiedQuestions: 0,
            pending: 0,
          };
        }
        summary[subject][tag].totalQuestions += 1;
        if (verified) {
          summary[subject][tag].verifiedQuestions += 1;
        } else {
          summary[subject][tag].pending += 1;
        }
      });

      setVerificationSummary(summary);
    } catch (error) {
      console.error('Error fetching verification summary:', error);
      toast.error('Failed to fetch verification summary.');
    }
  }, [testerId, subjectParam, questionType]);

  useEffect(() => {
    fetchVerificationSummary();
  }, [fetchVerificationSummary]);

  // Helper functions
  const getDayNumber = dayOrderStr => {
    const parts = dayOrderStr.split('-');
    return parts.length > 1 ? parseInt(parts[1]) : parseInt(dayOrderStr);
  };

  const getNextAndPreviousTags = useCallback(
    (currentTag, groupedByDay, tagCountPerDay) => {
      if (!currentTag || !currentTag.includes('day-'))
        return { nextTag: null, prevTag: null };

      const normalizedTag = currentTag.toLowerCase();
      const match = normalizedTag.match(/day-(\d+):(\d+)/i);
      if (!match) return { nextTag: null, prevTag: null };

      const currentDayNumber = parseInt(match[1]);
      const currentTagIndex = parseInt(match[2]);
      const currentDayKey = `day-${currentDayNumber}`;

      const dayNumbers = Object.keys(groupedByDay)
        .map(dayOrder => getDayNumber(dayOrder))
        .sort((a, b) => a - b);

      const currentDayIndex = dayNumbers.indexOf(currentDayNumber);
      const totalTagsInCurrentDay = tagCountPerDay[currentDayKey] || 1;

      let nextTag = null;
      let prevTag = null;

      if (currentTagIndex < totalTagsInCurrentDay) {
        nextTag = `day-${currentDayNumber}:${currentTagIndex + 1}`;
      } else if (currentDayIndex < dayNumbers.length - 1) {
        const nextDayNumber = dayNumbers[currentDayIndex + 1];
        nextTag = `day-${nextDayNumber}:1`;
      }

      if (currentTagIndex > 1) {
        prevTag = `day-${currentDayNumber}:${currentTagIndex - 1}`;
      } else if (currentDayIndex > 0) {
        const prevDayNumber = dayNumbers[currentDayIndex - 1];
        const prevDayKey = `day-${prevDayNumber}`;
        const totalTagsInPrevDay = tagCountPerDay[prevDayKey] || 1;
        if (totalTagsInPrevDay > 0)
          prevTag = `day-${prevDayNumber}:${totalTagsInPrevDay}`;
      }

      return { nextTag, prevTag };
    },
    []
  );

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const getPaginationRange = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    if (currentPage === 1) endPage = Math.min(totalPages, 3);
    else if (currentPage === totalPages)
      startPage = Math.max(1, totalPages - 2);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const toggleAccordion = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getDifficultyColor = level => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return 'text-[#129E00]';
      case 'medium':
        return 'text-[#FF9F00]';
      case 'hard':
        return 'text-[#FF0000]';
      default:
        return 'text-[#19216F]';
    }
  };

  const isLongQuestion = question => {
    return question?.length > 100;
  };

  const truncateQuestion = question => {
    if (!question) return '';
    const maxLength = 50;
    if (question.length <= maxLength) return question;
    return question.slice(0, maxLength) + '...';
  };

  const isTagFullyVerified = () => {
    const subjectData = verificationSummary[subjectParam.toLowerCase()];
    if (!subjectData) return false;
    const tagData = subjectData[tagsParam];
    if (!tagData) return false;
    return (
      tagData.verifiedQuestions >= tagData.totalQuestions &&
      tagData.pending === 0
    );
  };

  const isQuestionVerified = questionId => {
    return verifications.some(
      v => v.questionId === questionId && v.tag === tagsParam && v.verified
    );
  };

  // Edit functionality
  const handleEditClick = (question, index) => {
    setEditingQuestionId(question.questionId);
    setEditedQuestion({
      questionId: question.questionId,
      Question: question.Question,
      Options: {
        A: question.options[0],
        B: question.options[1],
        C: question.options[2],
        D: question.options[3],
      },
      Difficulty: question.Difficulty,
      Correct_Option: question.Correct_Option,
      Subject: question.Subject || subjectParam,
      Tags: question.Tags || tagsParam,
      Question_No: question.Question_No,
      Score: question.Score,
      Text_Explanation: question.Text_Explanation,
      Explanation_URL: question.Explanation_URL,
      Question_Type: question.Question_Type || 'mcq_test',
      Image_URL: question.image_url,
    });
    setEditPreview(null);
    setOpenIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestion({});
    setEditPreview(null);
    setOpenIndex(null);
  };

  const handleInputChange = (field, value) => {
    setEditedQuestion({
      ...editedQuestion,
      [field]: value,
    });
  };

  const handleOptionChange = (optionKey, value) => {
    setEditedQuestion({
      ...editedQuestion,
      Options: {
        ...editedQuestion.Options,
        [optionKey]: value,
      },
    });
  };

  const handleEditImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        formData
      );
      const secureUrl = res.data.secure_url;
      setEditedQuestion(prev => ({
        ...prev,
        Image_URL: secureUrl,
      }));
      setEditPreview(secureUrl);
    } catch (err) {
      console.error('Image upload failed', err);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveEdit = () => {
    const updateUrl = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/v1/question-crud?internId=${testerId}&subject=${subjectParam}`;
    axios
      .put(updateUrl, editedQuestion)
      .then(() => {
        setQuestions(prevQuestions =>
          prevQuestions.map(q =>
            q.questionId === editingQuestionId
              ? {
                  ...q,
                  Question: editedQuestion.Question,
                  Difficulty: editedQuestion.Difficulty,
                  Correct_Option: editedQuestion.Correct_Option,
                  options: [
                    editedQuestion.Options.A,
                    editedQuestion.Options.B,
                    editedQuestion.Options.C,
                    editedQuestion.Options.D,
                  ],
                  Question_No: editedQuestion.Question_No,
                  Score: editedQuestion.Score,
                  Text_Explanation: editedQuestion.Text_Explanation,
                  Explanation_URL: editedQuestion.Explanation_URL,
                  Subject: editedQuestion.Subject,
                  Tags: editedQuestion.Tags,
                  Question_Type: editedQuestion.Question_Type,
                  image_url: editedQuestion.Image_URL,
                }
              : q
          )
        );
        fetchVerificationSummary();
        setEditingQuestionId(null);
        setEditedQuestion({});
        setEditPreview(null);
        setOpenIndex(null);
      })
      .catch(err => {
        console.error('Error updating MCQ question:', err);
        toast.error('Failed to update the question.');
      });
  };

  // Delete functionality
  const handleDelete = questionId => {
    const questionToDelete = questions.find(q => q.questionId === questionId);
    if (!questionToDelete) {
      toast.info('Question not found.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete question Q${questionToDelete.Question_No}: "${questionToDelete.Question}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.isConfirmed) {
        const deleteUrl = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/question-crud?internId=${testerId}&subject=${subjectParam}&questionId=${questionId}&questionType=${
          questionToDelete.Question_Type || 'mcq_test'
        }`;

        axios
          .delete(deleteUrl)
          .then(() => {
            const updatedQuestions = questions.filter(
              q => q.questionId !== questionId
            );
            setQuestions(updatedQuestions);
            setEditingQuestionId(null);
            setEditedQuestion({});
            setEditPreview(null);
            setOpenIndex(null);
            toast.success('Question deleted successfully!', {
              autoClose: 2000,
            });

            if (
              updatedQuestions.length <= indexOfFirstQuestion &&
              currentPage > 1
            ) {
              setCurrentPage(currentPage - 1);
            }
          })
          .catch(err => {
            console.error('Error deleting MCQ question:', err);
            toast.error('Failed to delete the question.');
          });
      }
    });
  };

  // Verify question handler
  const handleVerifyQuestion = async (q, idx) => {
    setLoadingQuestions(prev => ({
      ...prev,
      [q.questionId]: true,
    }));

    const payload = {
      internId: testerId,
      questionId: q.questionId,
      questionType: q.Question_Type || 'mcq_test',
      subject: subjectParam.toLowerCase(),
      tag: tagsParam,
    };

    const verifyUrl = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/v1/verify-question`;

    try {
      const response = await axios.put(verifyUrl, payload);
      await fetchVerificationSummary();
      toast.success(
        response.data.message || 'Question verified successfully!',
        {
          autoClose: 2000,
        }
      );
    } catch (err) {
      console.error('Error verifying question:', err);
      toast.error('Failed to verify the question.');
    } finally {
      setLoadingQuestions(prev => ({
        ...prev,
        [q.questionId]: false,
      }));
    }
  };

  // XLSX download
  const downloadXLSX = () => {
    const headers = [
      'Question_No',
      'Image_Url',
      'Question_Type',
      'Subject',
      'Question',
      'A',
      'B',
      'C',
      'D',
      'Correct_Option',
      'Score',
      'Difficulty',
      'Tags',
      'Text_Explanation',
      'Explanation_URL',
    ];

    // Filter only verified questions
    const verifiedQuestions = questions.filter(q =>
      isQuestionVerified(q.questionId)
    );

    const data = verifiedQuestions.map(q => ({
      Question_No: q.Question_No || '',
      Image_URL: q.image_url || '',
      Question_Type: 'MCQ',
      Subject: q.Subject || subjectParam,
      Question: q.Question || '',
      A: q.options[0] || '',
      B: q.options[1] || '',
      C: q.options[2] || '',
      D: q.options[3] || '',
      Correct_Option: q.Correct_Option || '',
      Score: q.Score || '',
      Difficulty: q.Difficulty || '',
      Tags: q.Tags || tagsParam,
      Text_Explanation: q.Text_Explanation || '',
      Explanation_URL: q.Explanation_URL || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Verified MCQ Questions');

    const filename = `${subjectParam}_${tagsParam}_verified_mcq_questions.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // Tag navigation
  const handleTagNavigation = tag => {
    if (tag) {
      const normalizedTag = tag.toLowerCase();
      navigate(
        `/tester/verify-mcq?subject=${subjectParam}&tags=${normalizedTag}`
      );
    }
  };

  const currentDay = tagsParam.split(':')[0];
  const currentTopic = tagToTopicMap[tagsParam] || 'Unknown Topic';

  const dumpQuestions = async () => {
    setIsDumping(true);

    // Show loading popup
    Swal.fire({
      title: 'Dumping Questions...',
      text: 'Please wait while the questions are being processed.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Filter only verified questions and remove unnecessary fields
    const verifiedQuestions = questions
      .filter(q => isQuestionVerified(q.questionId))
      .map(({ Question_No, options, number, ...rest }) => rest);

    const payload = {
      internId: testerId,
      subject: subjectParam,
      tags: tagsParam,
      questions: verifiedQuestions,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/dump-questions`,
        payload
      );
      Swal.close(); // Close the loading popup
      toast.success(response.data.message || 'Questions dumped successfully!', {
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error dumping questions:', err);
      Swal.close(); // Close the loading popup
      toast.error('Failed to dump questions.');
    } finally {
      setIsDumping(false);
    }
  };

  // Determine if there are any verified questions
  const hasVerifiedQuestions = questions.some(q =>
    isQuestionVerified(q.questionId)
  );

  return (
    <div className="w-full font-[inter] px-4 sm:px-6 lg:px-12 mt-3 md:mt-8 mb-5  flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-base sm:text-xl font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-black">Questions Type:</span>
            <span className="text-[#ED1334]">MCQ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black">Subject:</span>
            <span className="text-[#ED1334]">{subjectParam}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black">Tag:</span>
            <span className="text-[#ED1334]">{tagsParam}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black">Topic:</span>
            <span className="text-[#ED1334]">{currentTopic}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black">Total Questions:</span>
            <span className="text-[#ED1334]">{questions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black">Tags in {currentDay}:</span>
            <span className="text-[#ED1334]">
              {tagCountPerDay[currentDay] || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleTagNavigation(prevTag)}
            disabled={!prevTag}
            className={`flex items-center gap-2 text-sm sm:text-base font-medium px-4 py-2 rounded ${
              prevTag
                ? 'bg-[#19216F] text-white hover:bg-[#141A5A]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Prev
          </button>
          <button
            onClick={() => handleTagNavigation(nextTag)}
            disabled={!nextTag}
            className={`flex items-center gap-2 text-sm sm:text-base font-medium px-4 py-2 rounded ${
              nextTag
                ? 'bg-[#19216F] text-white hover:bg-[#141A5A]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
          <button
            onClick={downloadXLSX}
            className="flex items-center gap-2 bg-[#19216F] text-white text-sm sm:text-base font-medium px-1 sm:px-[20px] py-2 sm:py-[11px] rounded sm:w-auto justify-center hover:bg-[#141A5A] transition-colors"
          >
            <MdOutlineFileDownload size={22} />
          </button>
          <button
            onClick={dumpQuestions}
            disabled={!hasVerifiedQuestions || isDumping}
            className={`flex items-center gap-2 text-sm sm:text-base font-medium px-4 py-2 rounded ${
              hasVerifiedQuestions || isDumping
                ? 'bg-[#19216F] text-white hover:bg-[#141A5A]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isDumping ? 'Dumping...' : 'Dump'}
          </button>
        </div>
      </div>
      <div className="border-t border-[#939393] w-full mb-6"></div>
      <div className="w-full space-y-4 flex-grow">
        {currentQuestions.length === 0 ? (
          <div className="text-gray-500 text-center text-base">
            No MCQ questions found.
          </div>
        ) : (
          currentQuestions.map((q, index) => {
            const isOpen = openIndex === index;
            const isEditing = editingQuestionId === q.questionId;
            const isLong = isLongQuestion(q.Question);
            const isVerified = isQuestionVerified(q.questionId);
            const isLoading = loadingQuestions[q.questionId] || false;

            return (
              <div key={q.questionId || index} className="flex flex-col w-full">
                <div
                  onClick={() => toggleAccordion(index)}
                  className={`grid grid-cols-1 sm:grid-cols-[45%_18%_25%_auto_10%] h-auto sm:h-[60px] shadow-md items-center text-base sm:text-lg font-bold cursor-pointer ${
                    isOpen
                      ? 'bg-[#19216F] text-white'
                      : 'bg-[#E5E8FF] text-[#19216F]'
                  } ${isEditing ? '' : 'rounded-md'}`}
                >
                  <div className="px-4 py-2 sm:py-0">
                    {isEditing && !isLong ? (
                      <div className="flex items-center gap-2">
                        <span>Q{q.Question_No}.</span>
                        <input
                          type="text"
                          value={editedQuestion.Question || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e =>
                            handleInputChange('Question', e.target.value)
                          }
                          className="w-full text-black border border-[#4C4A4A] px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-[#19216F] rounded-md"
                        />
                      </div>
                    ) : (
                      `Q${q.Question_No}. ${truncateQuestion(q.Question)}`
                    )}
                  </div>
                  <div className="px-4 py-2 sm:py-0 flex items-center gap-1">
                    <span
                      className={`${
                        isOpen ? 'text-white' : 'text-[#19216F]'
                      } font-bold`}
                    >
                      Level:
                    </span>
                    {isEditing ? (
                      <select
                        value={editedQuestion.Difficulty || ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e =>
                          handleInputChange('Difficulty', e.target.value)
                        }
                        className="text-black border border-[#4C4A4A] px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-[#19216F] rounded-md"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    ) : (
                      <span
                        className={`${
                          isOpen
                            ? 'text-white'
                            : getDifficultyColor(q.Difficulty)
                        } font-bold`}
                      >
                        {q.Difficulty}
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-2 sm:py-0 flex items-center gap-1">
                    <span
                      className={`${
                        isOpen ? 'text-white' : 'text-[#19216F]'
                      } font-bold`}
                    >
                      Score:
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedQuestion.Score || ''}
                        onClick={e => e.stopPropagation()}
                        onChange={e =>
                          handleInputChange('Score', e.target.value)
                        }
                        className="w-16 text-black border border-[#4C4A4A] px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-[#19216F] rounded-md"
                      />
                    ) : (
                      <>
                        <span
                          className={`${
                            isOpen ? 'text-white' : 'text-[#129E00]'
                          } font-bold`}
                        >
                          {q.Score}
                        </span>
                        {isVerified && (
                          <CheckCircle
                            size={24}
                            className={`ml-20 font-bold ${
                              isOpen ? 'text-white' : 'text-[#129E00]'
                            }`}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex justify-center items-center px-4 py-2 sm:py-0">
                    <ChevronDown
                      size={20}
                      className={`cursor-pointer transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-white' : 'text-[#19216F]'
                      }`}
                      onClick={() => toggleAccordion(index)}
                    />
                  </div>
                  <div className="flex h-auto sm:h-[60px] px-4 sm:px-0 py-2 sm:py-0">
                    <div
                      className={`w-full sm:w-[42px] bg-[#129E00] flex items-center justify-center cursor-pointer ${
                        isVerified ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      onClick={() => !isVerified && handleEditClick(q, index)}
                    >
                      <Pencil size={18} color="white" />
                    </div>
                    <div
                      className="w-full sm:w-[42px] bg-[#ED3001] flex items-center justify-center cursor-pointer"
                      onClick={() => handleDelete(q.questionId)}
                    >
                      <Trash2 size={18} color="white" />
                    </div>
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen
                      ? 'opacity-100 max-h-[1500px] py-6 px-6'
                      : 'opacity-0 max-h-0 py-0 px-6'
                  } bg-white border border-gray-200 shadow-md text-base sm:text-lg font-[inter] rounded-b`}
                  style={{ transitionProperty: 'max-height, opacity, padding' }}
                >
                  {isEditing ? (
                    <div className="space-y-4 transition-opacity duration-500">
                      <div className="flex flex-col gap-2">
                        <span className="text-black font-semibold text-[18px]">
                          Question:
                        </span>
                        <textarea
                          value={editedQuestion.Question || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e =>
                            handleInputChange('Question', e.target.value)
                          }
                          className="w-full h-[100px] px-3 py-2 text-black border border-[#4C4A4A] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#19216F] font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-black font-semibold text-[18px]">
                          Image:
                        </span>
                        {(editPreview || editedQuestion.Image_URL) && (
                          <img
                            className="w-[200px] mx-4 object-contain"
                            src={editPreview || editedQuestion.Image_URL}
                            alt="Preview"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          disabled={isUploadingImage}
                          className="border rounded px-2 py-1"
                        />
                        {isUploadingImage && (
                          <span className="text-sm text-gray-500">
                            Uploading…
                          </span>
                        )}
                      </div>
                      {['A', 'B', 'C', 'D'].map(optKey => (
                        <div key={optKey} className="flex items-center gap-2">
                          <span className="w-8 text-black font-semibold text-[18px]">
                            {optKey}.
                          </span>
                          <input
                            type="text"
                            value={editedQuestion.Options?.[optKey] || ''}
                            onClick={e => e.stopPropagation()}
                            onChange={e =>
                              handleOptionChange(optKey, e.target.value)
                            }
                            className="flex-1 h-[46px] px-3 text-black border border-[#4C4A4A] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#19216F]"
                          />
                        </div>
                      ))}
                      <div className="flex flex-col gap-2">
                        <span className="text-black font-semibold text-[18px]">
                          Correct Option:
                        </span>
                        <select
                          value={editedQuestion.Correct_Option || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e =>
                            handleInputChange('Correct_Option', e.target.value)
                          }
                          className="w-24 h-[46px] text-black border border-[#4C4A4A] px-3 py-2 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#19216F]"
                        >
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-black font-semibold text-[18px]">
                          Text Explanation:
                        </span>
                        <textarea
                          value={editedQuestion.Text_Explanation || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e =>
                            handleInputChange(
                              'Text_Explanation',
                              e.target.value
                            )
                          }
                          className="w-full h-[100px] px-3 py-2 text-black border border-[#4C4A4A] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#19216F]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-black font-semibold text-[18px]">
                          Explanation URL:
                        </span>
                        <input
                          type="text"
                          value={editedQuestion.Explanation_URL || ''}
                          onClick={e => e.stopPropagation()}
                          onChange={e =>
                            handleInputChange('Explanation_URL', e.target.value)
                          }
                          className="w-full h-[46px] px-3 text-black border border-[#4C4A4A] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#19216F]"
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          disabled={isUploadingImage}
                          onClick={handleSaveEdit}
                          className={
                            !isUploadingImage
                              ? `w-[184px] h-[46px] bg-[#19216F] text-white text-[18px] font-semibold rounded hover:bg-[#141A5A] transition-colors`
                              : `w-[184px] h-[46px] bg-gray-400 text-white cursor-not-allowed text-[18px] font-semibold rounded transition-colors`
                          }
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="w-[184px] h-[46px] border border-[#19216F] text-[#19216F] bg-white text-[18px] font-semibold rounded hover:bg-[#E5E8FF] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 transition-opacity duration-500">
                      <div className="flex flex-col gap-2">
                        <span className="text-black font-semibold text-[18px]">
                          Question:
                        </span>
                        <pre className="question-pre text-base font-mono">
                          {q.Question}
                        </pre>
                      </div>
                      <div className="text-black font-semibold text-[18px]">
                        Type:{' '}
                        <span className="font-normal ml-1">
                          {q.Question_Type || 'mcq_test'}
                        </span>
                      </div>
                      {!q.image_url ? (
                        <div></div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-black font-semibold text-[18px]">
                            Image:
                          </span>
                          <img
                            className="w-[200px] mx-4 object-contain"
                            src={q.image_url}
                            alt="Question"
                          />
                        </div>
                      )}
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="text-black font-semibold text-[18px]"
                        >
                          {String.fromCharCode(65 + optIndex)}.{' '}
                          <span className="font-normal ml-1">{option}</span>
                        </div>
                      ))}
                      <div className="text-black font-semibold text-[18px]">
                        Correct Option:{' '}
                        <span className="font-normal ml-1">
                          {q.Correct_Option}
                        </span>
                      </div>
                      {q.Text_Explanation && (
                        <div className="text-black font-semibold text-[18px]">
                          Text Explanation:{' '}
                          <span className="font-normal ml-1">
                            {q.Text_Explanation}
                          </span>
                        </div>
                      )}
                      {q.Explanation_URL && (
                        <div className="text-black font-semibold text-[18px]">
                          Explanation URL:{' '}
                          <a
                            href={q.Explanation_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-normal ml-1 text-blue-600 hover:underline"
                          >
                            {q.Explanation_URL}
                          </a>
                        </div>
                      )}
                      <button
                        onClick={() => handleVerifyQuestion(q, index)}
                        disabled={isVerified || isLoading}
                        className={`w-[184px] h-[46px] text-white text-[18px] font-semibold rounded mt-4 transition-colors flex items-center justify-center ${
                          isVerified
                            ? 'bg-gray-400 cursor-not-allowed'
                            : isLoading
                              ? 'bg-[#19216F] cursor-wait'
                              : 'bg-[#19216F] hover:bg-[#141A5A]'
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : isVerified ? (
                          'Verified'
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="w-full flex justify-end mt-3">
        <div className="flex items-center justify-center font-[inter] text-sm text-black bg-white rounded-md shadow-md px-4 py-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`mr-2 ${
              currentPage === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:text-[#19216F]'
            }`}
          >
            {'< Prev'}
          </button>
          {getPaginationRange().map(page => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={`mx-1 w-7 h-7 rounded-full ${
                currentPage === page
                  ? 'bg-[#19216F] text-white'
                  : 'hover:bg-[#E5E8FF]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-2 ${
              currentPage === totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:text-[#19216F]'
            }`}
          >
            {'Next >'}
          </button>
        </div>
      </div>
      <style jsx>{`
        .question-pre {
          white-space: pre-wrap; /* Preserve whitespace but allow wrapping */
          overflow-wrap: break-word; /* Break long words to fit container */
          margin: 0; /* Remove default margin */
          font-family: monospace; /* Use monospace font for code-like appearance */
          font-size: 1rem; /* Adjust font size as needed */
          max-width: 100%; /* Ensure it doesn't exceed container width */
          overflow-x: auto; /* Add horizontal scroll for very long lines */
        }
      `}</style>
    </div>
  );
};

export default VerifyMCQ;
