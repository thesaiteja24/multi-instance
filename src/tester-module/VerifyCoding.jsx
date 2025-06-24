import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { ChevronDown, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useSelector } from 'react-redux';

const VerifyCoding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subjectParam = searchParams.get('subject') || 'MySQL';
  const tagsParam = searchParams.get('tags')?.toLowerCase() || 'day-1:1';
  const { userInfo } = useSelector(state => state.auth);
  const testerId = userInfo?.id;

  const [questions, setQuestions] = useState([]);
  const [isDumping, setIsDumping] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tagCountPerDay, setTagCountPerDay] = useState({});
  const [tagToTopicMap, setTagToTopicMap] = useState({});
  const [nextTag, setNextTag] = useState(null);
  const [prevTag, setPrevTag] = useState(null);
  const [verifications, setVerifications] = useState({});

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

  // Fetch verification data
  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/verify-question?internId=${testerId}&subject=${subjectParam.toLowerCase()}&questionType=code_test`;
        const response = await axios.get(url);
        const data = response.data;
        if (!data.success || !Array.isArray(data.verifications)) {
          throw new Error('Invalid verification response');
        }
        const verificationMap = {};
        data.verifications.forEach(v => {
          if (v.questionId && v.tag === tagsParam) {
            verificationMap[v.questionId] = {
              verified: v.verified,
              sourceCode: v.sourceCode || '',
            };
          }
        });
        setVerifications(verificationMap);
      } catch (error) {
        console.error('Error fetching verification data:', error);
        toast.error('Failed to fetch verification status.');
      }
    };
    fetchVerifications();
  }, [testerId, subjectParam, tagsParam]);

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
            item.originalSubTopics.forEach((sub, subIndex) => {
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

  // Fetch coding questions
  useEffect(() => {
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/v1/question-crud?internId=${testerId}&subject=${subjectParam}&tags=${tagsParam}`;
    axios
      .get(url)
      .then(response => {
        const data = response.data;
        if (data?.codeQuestions) {
          const formattedQuestions = data.codeQuestions.map((q, index) => ({
            ...q,
            Question_No: q.Question_No || index + 1,
          }));
          setQuestions(formattedQuestions);
        }
      })
      .catch(err => {
        console.error('Error fetching coding data:', err);
        toast.error('Failed to fetch questions.');
      });
  }, [subjectParam, tagsParam]);

  const getDayNumber = dayOrderStr => {
    const parts = dayOrderStr.split('-');
    return parts.length > 1 ? parseInt(parts[1]) : parseInt(dayOrderStr);
  };

  const getNextAndPreviousTags = useCallback(
    (currentTag, groupedByDay, tagCountPerDay) => {
      if (!currentTag || !currentTag.includes('day-')) {
        console.warn('Invalid tagsParam:', currentTag);
        return { nextTag: null, prevTag: null };
      }

      const match = currentTag.match(/day-(\d+):(\d+)/i);
      if (!match) {
        console.warn('Regex match failed for tag:', currentTag);
        return { nextTag: null, prevTag: null };
      }

      const currentDayNumber = parseInt(match[1]);
      const currentTagIndex = parseInt(match[2]);

      const dayNumbers = Object.keys(groupedByDay)
        .map(dayOrder => getDayNumber(dayOrder))
        .sort((a, b) => a - b);

      const currentDayKey = `day-${currentDayNumber}`;
      const totalTagsInCurrentDay = tagCountPerDay[currentDayKey] || 0;
      const currentDayIndex = dayNumbers.indexOf(currentDayNumber);

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
        const totalTagsInPrevDay = tagCountPerDay[prevDayKey] || 0;
        if (totalTagsInPrevDay > 0) {
          prevTag = `day-${prevDayNumber}:${totalTagsInPrevDay}`;
        }
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

  const handleTestButton = (q, idx) => {
    const verification = verifications[q.questionId];
    // Calculate the absolute index in the full questions array
    const absoluteIndex = indexOfFirstQuestion + idx;
    navigate(
      `/tester/verify-coding/test?questionId=${
        q.questionId
      }&subject=${subjectParam}&tags=${tagsParam}&questionType=${
        q.Question_Type || 'code_test'
      }`,
      {
        state: {
          question: q,
          index: absoluteIndex,
          questions: questions,
          codeMap: verification?.sourceCode
            ? { [absoluteIndex]: verification.sourceCode }
            : {},
        },
      }
    );
  };

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
          questionToDelete.Question_Type || 'Code'
        }`;

        axios
          .delete(deleteUrl)
          .then(() => {
            const updatedQuestions = questions.filter(
              q => q.questionId !== questionId
            );
            setQuestions(updatedQuestions);
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
            console.error('Error deleting question:', err);
            toast.error('Failed to delete the question.');
          });
      }
    });
  };

  const downloadXLSX = () => {
    const maxHiddenCount = Math.max(
      ...questions.map(q => q.Hidden_Test_Cases?.length || 0)
    );

    const baseHeaders = [
      'Question_No',
      'Question_Type',
      'Subject',
      'Question',
      'Sample_Input',
      'Sample_Output',
      'Constraints',
    ];

    const hiddenHeaders = [];
    for (let i = 0; i < maxHiddenCount; i++) {
      hiddenHeaders.push(`Hidden_Test_case_${i + 1}_Input`);
      hiddenHeaders.push(`Hidden_Test_case_${i + 1}_Output`);
    }

    const otherHeaders = [
      'Score',
      'Tags',
      'Difficulty',
      'Text_Explanation',
      'Explanation_URL',
    ];

    const headers = [...baseHeaders, ...hiddenHeaders, ...otherHeaders];

    // Filter only verified questions
    const verifiedQuestions = questions.filter(q => {
      const verification = verifications[q.questionId];
      return verification?.verified && verification?.sourceCode;
    });

    const data = verifiedQuestions.map(q => {
      const row = {
        Question_No: q.Question_No ?? '',
        Question_Type: 'Code',
        Subject: q.Subject ?? subjectParam,
        Question: q.Question ?? '',
        Sample_Input: q.Sample_Input ?? '',
        Sample_Output: q.Sample_Output ?? '',
        Constraints: q.Constraints ?? '',
      };

      for (let i = 0; i < maxHiddenCount; i++) {
        row[`Hidden_Test_case_${i + 1}_Input`] =
          q.Hidden_Test_Cases?.[i]?.Input ?? '';
        row[`Hidden_Test_case_${i + 1}_Output`] =
          q.Hidden_Test_Cases?.[i]?.Output ?? '';
      }

      row.Score = q.Score ?? '';
      row.Tags = q.Tags ?? tagsParam;
      row.Difficulty = q.Difficulty ?? '';
      row.Text_Explanation = q.Text_Explanation ?? '';
      row.Explanation_URL = q.Explanation_URL ?? '';

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Verified Coding Questions'
    );

    XLSX.writeFile(
      workbook,
      `${subjectParam}_${tagsParam}_verified_coding_questions.xlsx`
    );
  };

  const handleTagNavigation = tag => {
    if (tag) {
      navigate(`/tester/verify-coding?subject=${subjectParam}&tags=${tag}`);
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

    // Filter only verified questions
    const verifiedQuestions = questions.filter(q => {
      const verification = verifications[q.questionId];
      return verification?.verified && verification?.sourceCode;
    });

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
      Swal.close();
      toast.success(response.data.message || 'Questions dumped successfully!', {
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error dumping questions:', err);
      Swal.close();
      toast.error('Failed to dump questions.');
    } finally {
      setIsDumping(false);
    }
  };

  // Determine if there are any verified questions
  const hasVerifiedQuestions = questions.some(q => {
    const verification = verifications[q.questionId];
    return verification?.verified && verification?.sourceCode;
  });

  return (
    <div className="w-full font-[inter] px-4 sm:px-6 text-[12px] lg:px-12 mt-3 md:mt-8 mb-5  flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 sm:text-xl font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-black">Questions Type:</span>
            <span className="text-[#ED1334]">Code</span>
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
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded ${
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
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded ${
              nextTag
                ? 'bg-[#19216F] text-white hover:bg-[#141A5A]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
          <button
            onClick={downloadXLSX}
            className="flex items-center gap-2 bg-[#19216F] text-white text-sm font-medium px-1 sm:px-[20px] py-2 rounded sm:w-auto justify-center hover:bg-[#141A5A] transition-colors"
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
          <div className="text-gray-500 text-center">
            No coding questions found.
          </div>
        ) : (
          currentQuestions.map((q, index) => {
            const isOpen = openIndex === index;
            const isLong = isLongQuestion(q.Question);
            const verification = verifications[q.questionId];
            const isVerified =
              verification?.verified && verification?.sourceCode;

            return (
              <div key={q.questionId || index} className="flex flex-col w-full">
                <div
                  onClick={() => toggleAccordion(index)}
                  className={`grid grid-cols-1 sm:grid-cols-[45%_20%_25%_auto_42px] h-auto sm:h-[60px] shadow-md items-center sm:text-lg font-bold cursor-pointer ${
                    isOpen
                      ? 'bg-[#19216F] text-white'
                      : 'bg-[#E5E8FF] text-[#19216F]'
                  }`}
                >
                  <div className="px-4 py-2 sm:py-0 flex items-center gap-2">
                    {`Q${q.Question_No}. ${
                      isLong ? truncateQuestion(q.Question) : q.Question
                    }`}
                  </div>
                  <div className="px-4 py-2 sm:py-0 flex items-center gap-1">
                    <span
                      className={`${
                        isOpen ? 'text-white' : 'text-[#19216F]'
                      } font-bold`}
                    >
                      Level:
                    </span>
                    <span
                      className={`${
                        isOpen ? 'text-white' : getDifficultyColor(q.Difficulty)
                      } font-bold`}
                    >
                      {q.Difficulty}
                    </span>
                  </div>
                  <div className="px-4 py-2 sm:py-0 flex items-center gap-1">
                    <span
                      className={`${
                        isOpen ? 'text-white' : 'text-[#19216F]'
                      } font-bold`}
                    >
                      Score:
                    </span>
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
                  <div
                    className="h-auto sm:h-[60px] sm:px-0 py-2 sm:py-0 w-full sm:w-[42px] bg-[#ED3001] flex items-center justify-center cursor-pointer"
                    onClick={() => handleDelete(q.questionId)}
                  >
                    <Trash2 size={18} color="white" />
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen
                      ? 'opacity-100 max-h-[1500px] py-6 px-6'
                      : 'opacity-0 max-h-0 py-0 px-6'
                  } bg-white border border-gray-200 shadow-md sm:text-lg font-[inter] rounded-b`}
                  style={{ transitionProperty: 'max-height, opacity, padding' }}
                >
                  <div className="space-y-4 transition-opacity duration-500">
                    {isLong && (
                      <div className="text-black font-semibold text-[18px]">
                        Question:{' '}
                        <span className="font-normal ml-1">{q.Question}</span>
                      </div>
                    )}
                    <div className="text-black font-semibold text-[18px]">
                      Sample Input:{' '}
                      <span className="font-normal ml-1">{q.Sample_Input}</span>
                    </div>
                    <div className="text-black font-semibold text-[18px]">
                      Sample Output:{' '}
                      <span className="font-normal ml-1">
                        {q.Sample_Output}
                      </span>
                    </div>
                    <div className="text-black font-semibold text-[18px] max-w-[90%]">
                      Constraints:{' '}
                      <span className="font-normal ml-1">{q.Constraints}</span>
                    </div>
                    <button
                      onClick={() => handleTestButton(q, index)}
                      className="w-[184px] h-[46px] bg-[#19216F] text-white text-[18px] font-semibold rounded mt-4 hover:bg-[#141A5A] transition-colors"
                    >
                      Test
                    </button>
                  </div>
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
    </div>
  );
};

export default VerifyCoding;
