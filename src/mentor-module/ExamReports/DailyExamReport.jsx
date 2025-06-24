import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useSelector, useDispatch } from 'react-redux';
import { getMentorStudentsThunk } from '../../reducers/mentorStudentsSlice';

const DailyExamReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const mentorId = userInfo?.id;
  const loc = userInfo?.location;
  const { scheduleData } = useSelector(state => state.mentorStudents);

  // Fetch data on mount
  useEffect(() => {
    if (scheduleData.length === 0) {
      dispatch(getMentorStudentsThunk({ location: loc, mentorId }));
    }
  }, [dispatch, location, mentorId, scheduleData.length]);

  // Extract unique subjects from scheduleData
  const uniqueSubjects = useMemo(() => {
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const allSubjects = scheduleData
        .map(entry => entry.subject)
        .filter(Boolean);
      return [...new Set(allSubjects)];
    }
    return [];
  }, [scheduleData]);

  // Check if all uniqueSubjects are present in the subjects of the exam
  useEffect(() => {
    const missingSubjects = uniqueSubjects.filter(subject => {
      return !data?.reports?.some(report =>
        report.subjects.hasOwnProperty(subject)
      );
    });
  }, [data?.reports, uniqueSubjects, navigate]);

  // Redirect if data is missing or doesn't have reports
  useEffect(() => {
    if (!data || !data.reports) {
      navigate('/exam-dashboard');
    }
  }, [data, navigate]);

  if (!data || !data.reports) return null;

  // -----------------------------
  // Utility Functions
  // -----------------------------
  const getSubjectWiseAnalysis = subjects => {
    if (!subjects || Object.keys(subjects).length === 0) return [];
    return Object.entries(subjects).map(([subjectName, subjData]) => {
      const maxCode = subjData.max_code_marks || 0;
      const maxMCQ = subjData.max_mcq_marks || 0;
      const obtainedCode = subjData.obtained_code_marks || 0;
      const obtainedMCQ = subjData.obtained_mcq_marks || 0;
      return {
        subject: subjectName,
        scoreObtained: obtainedCode + obtainedMCQ,
        totalPossible: maxCode + maxMCQ,
        scoreText:
          maxCode + maxMCQ === 0
            ? 'N/A'
            : `${obtainedCode + obtainedMCQ}/${maxCode + maxMCQ}`,
      };
    });
  };

  const getTotalScore = subjects => {
    const analysis = getSubjectWiseAnalysis(subjects);
    return analysis.reduce((acc, subj) => acc + subj.scoreObtained, 0);
  };

  // -----------------------------
  // Enrich the Data
  // -----------------------------
  const enrichedData = useMemo(() => {
    return data.reports.map(report => {
      const totalScore = getTotalScore(report.subjects);
      return {
        ...report,
        totalScore,
        exam: {
          examName: data.examName,
          batch: data.batch,
        },
        examDetails: report.examDetails,
      };
    });
  }, [data.reports, data.examName, data.batch]);

  // Extract exam details
  const examDetails = useMemo(() => {
    return enrichedData.length > 0 ? enrichedData[0].examDetails : null;
  }, [enrichedData]);

  // -----------------------------
  // Filtering and Sorting
  // -----------------------------
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [studentNameFilter, setStudentNameFilter] = useState('');
  const [attemptStatusFilter, setAttemptStatusFilter] = useState('all');
  const [scoreSort, setScoreSort] = useState('none');

  const filteredData = useMemo(() => {
    return enrichedData.filter(item => {
      const { student, subjects } = item;

      if (
        studentIdFilter.trim() &&
        !(student.studentId || '')
          .toLowerCase()
          .includes(studentIdFilter.trim().toLowerCase())
      ) {
        return false;
      }

      if (
        studentNameFilter.trim() &&
        !(student.name || '')
          .toLowerCase()
          .includes(studentNameFilter.trim().toLowerCase())
      ) {
        return false;
      }

      const attempted =
        subjects &&
        Object.keys(subjects).some(subject => {
          const subjData = subjects[subject];
          return (
            subjData &&
            (typeof subjData.max_code_marks !== 'undefined' ||
              typeof subjData.max_mcq_marks !== 'undefined' ||
              subjData.obtained_code_marks > 0 ||
              subjData.obtained_mcq_marks > 0)
          );
        });

      if (attemptStatusFilter !== 'all') {
        if (attemptStatusFilter === 'attempted' && !attempted) return false;
        if (attemptStatusFilter === 'not attempted' && attempted) return false;
      }

      return true;
    });
  }, [enrichedData, studentIdFilter, studentNameFilter, attemptStatusFilter]);

  const sortedData = useMemo(() => {
    let dataToSort = [...filteredData];
    if (scoreSort === 'highest') {
      dataToSort.sort((a, b) => b.totalScore - a.totalScore);
    } else if (scoreSort === 'lowest') {
      dataToSort.sort((a, b) => a.totalScore - b.totalScore);
    }
    return dataToSort;
  }, [filteredData, scoreSort]);

  // Calculate Attempted and Not Attempted counts
  const attemptCounts = useMemo(() => {
    let attemptedCount = 0;
    let notAttemptedCount = 0;

    sortedData.forEach(item => {
      const { subjects } = item;
      const attempted =
        subjects &&
        Object.keys(subjects).some(subject => {
          const subjData = subjects[subject];
          return (
            subjData &&
            (typeof subjData.max_code_marks !== 'undefined' ||
              typeof subjData.max_mcq_marks !== 'undefined' ||
              subjData.obtained_code_marks > 0 ||
              subjData.obtained_mcq_marks > 0)
          );
        });
      if (attempted) {
        attemptedCount++;
      } else {
        notAttemptedCount++;
      }
    });

    return { attemptedCount, notAttemptedCount };
  }, [sortedData]);

  // -----------------------------
  // Pagination
  // -----------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = pageNumber => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // -----------------------------
  // Export to Excel
  // -----------------------------
  const exportToExcel = () => {
    const exportData = sortedData.map(item => {
      const { student, exam, totalScore, subjects, examDetails } = item;
      const subjectAnalysis = getSubjectWiseAnalysis(subjects);
      const attempted =
        subjects &&
        Object.keys(subjects).some(subject => {
          const subjData = subjects[subject];
          return (
            subjData &&
            (typeof subjData.max_code_marks !== 'undefined' ||
              typeof subjData.max_mcq_marks !== 'undefined' ||
              subjData.obtained_code_marks > 0 ||
              subjData.obtained_mcq_marks > 0)
          );
        });
      const subjectAnalysisString = uniqueSubjects
        .map(subject => {
          const subjData = subjectAnalysis.find(s => s.subject === subject);
          return subjData
            ? `${subject}: ${subjData.scoreText}`
            : `${subject}: N/A`;
        })
        .join(', ');
      return {
        'Student ID': student?.studentId || '',
        Name: student?.name || 'Unknown',
        Phone: student?.phNumber || '',
        Batch: exam?.batch || '',
        'Attempt Status': attempted ? 'Attempted' : 'Not Attempted',
        'Marks Overall': totalScore,
        'Subject-wise Analysis': subjectAnalysisString || 'N/A',
        Date: examDetails?.startDate || 'N/A',
        Time: examDetails?.startTime || 'N/A',
        'Total Time (mins)': examDetails?.totalExamTime || 'N/A',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, 'DailyPerformance.xlsx');
  };

  return (
    <div className="p-4 w-full font-[Inter]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0 relative">
        <button
          onClick={() => navigate(-1)}
          className="text-blackhsl font-medium flex items-center text-base sm:text-lg hover:text-blue-800 transition"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 33 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M26.125 12.4997H6.875M6.875 12.4997L16.5 19.7913M6.875 12.4997L16.5 5.20801"
              stroke="#181D27"
              strokeWidth="2.10849"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-secondary)]">
          Exam Performance Dashboard
        </h1>
        {/* Attempt Counts */}
        <div className="absolute right-0 top-0 sm:static flex flex-col text-sm sm:text-base">
          <span className="font-semibold text-[var(--color-secondary)]">
            Attempted:{' '}
            <span className="text-[#ED1334]">
              {attemptCounts.attemptedCount}
            </span>
          </span>
          <span className="font-semibold text-[var(--color-secondary)]">
            Not Attempted:{' '}
            <span className="text-[#ED1334]">
              {attemptCounts.notAttemptedCount}
            </span>
          </span>
        </div>
      </div>

      <div className="border border-gray-500 my-5"></div>

      {/* Exam Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 my-6 text-sm text-gray-700 font-[Poppins]">
        <div>
          <span className="font-semibold text-base sm:text-xl text-[var(--color-secondary)]">
            Exam:
          </span>
          <span className="font-semibold text-base sm:text-xl text-[#ED1334]">
            {' '}
            {data.examName}
          </span>
        </div>
        <div>
          <span className="font-semibold text-base sm:text-xl text-[var(--color-secondary)]">
            Batch:
          </span>
          <span className="font-semibold text-base sm:text-xl text-[#ED1334]">
            {' '}
            {data.batch}
          </span>
        </div>
        <div>
          <span className="font-semibold text-base sm:text-xl text-[var(--color-secondary)]">
            Exam Date:
          </span>
          <span className="font-semibold text-base sm:text-xl text-[#ED1334]">
            {' '}
            {examDetails?.startDate || 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-base sm:text-xl text-[var(--color-secondary)]">
            Exam Time:
          </span>
          <span className="font-semibold text-base sm:text-xl text-[#ED1334]">
            {' '}
            {examDetails?.startTime || 'N/A'}
          </span>
        </div>
        <div>
          <span className="font-semibold text-base sm:text-xl text-[var(--color-secondary)]">
            Total Time:
          </span>
          <span className="font-semibold text-base sm:text-xl text-[#ED1334]">
            {' '}
            {examDetails?.totalExamTime || 'N/A'} mins
          </span>
        </div>
      </div>

      {/* Filter and Export Section */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 sm:p-6 bg-white border rounded-2xl"
        style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
      >
        <input
          type="text"
          placeholder="Student ID"
          value={studentIdFilter}
          onChange={e => setStudentIdFilter(e.target.value)}
          className="border rounded p-3 text-sm sm:text-base placeholder:text-black bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontFamily: 'Inter' }}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={studentNameFilter}
          onChange={e => setStudentNameFilter(e.target.value)}
          className="border rounded p-3 text-sm sm:text-base placeholder:text-black bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontFamily: 'Inter' }}
        />
        <select
          value={attemptStatusFilter}
          onChange={e => setAttemptStatusFilter(e.target.value)}
          className="border rounded p-3 text-sm sm:text-base bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontFamily: 'Inter' }}
        >
          <option value="all">All</option>
          <option value="attempted">Attempted</option>
          <option value="not attempted">Not Attempted</option>
        </select>
        <select
          value={scoreSort}
          onChange={e => setScoreSort(e.target.value)}
          className="border rounded p-3 text-sm sm:text-base bg-[#EFF0F7] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontFamily: 'Inter' }}
        >
          <option value="none">Sort by Score</option>
          <option value="highest">Descending</option>
          <option value="lowest">Ascending</option>
        </select>
        <button
          onClick={exportToExcel}
          className="bg-[var(--color-secondary)] text-white p-3 rounded-md text-sm sm:text-base hover:bg-blue-800 transition"
        >
          Export to Excel
        </button>
      </div>

      {/* Table Section */}
      <div
        className="hidden md:block w-full mt-6 rounded-[20px]"
        style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
      >
        <table className="min-w-full bg-white border rounded-[20px] overflow-hidden">
          <thead>
            <tr className="bg-[#19216F] font-semibold text-white text-xs sm:text-sm">
              <th className="p-3 sm:p-4 text-left">Student ID</th>
              <th className="p-3 sm:p-4 text-left">Name</th>
              <th className="p-3 sm:p-4 text-left">Phone</th>
              <th className="p-3 sm:p-4 text-left">Attempt Status</th>
              <th className="p-3 sm:p-4 text-left">Marks Overall</th>
              <th className="p-3 sm:p-4 text-left">Subject-wise Analysis</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item, index) => {
              const { student, totalScore, subjects, examDetails } = item;
              const subjectAnalysis = getSubjectWiseAnalysis(subjects);
              const attempted =
                subjects &&
                Object.keys(subjects).some(subject => {
                  const subjData = subjects[subject];
                  return (
                    subjData &&
                    (typeof subjData.max_code_marks !== 'undefined' ||
                      typeof subjData.max_mcq_marks !== 'undefined' ||
                      subjData.obtained_code_marks > 0 ||
                      subjData.obtained_mcq_marks > 0)
                  );
                });
              const rowKey = `${student.id}-${index}`;
              const rowClassName = attempted
                ? index % 2 === 0
                  ? 'bg-green-50'
                  : 'bg-green-100'
                : 'bg-white';

              return (
                <tr
                  key={rowKey}
                  className={`${rowClassName} border-b hover:bg-gray-50`}
                >
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[#000000]">
                    {student.studentId || ''}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[#000000]">
                    {student.name || 'Unknown'}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[#000000]">
                    {student.phNumber || 'N/A'}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[#000000]">
                    {attempted ? 'Attempted' : 'Not Attempted'}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[#000000]">
                    {totalScore === 0
                      ? attempted
                        ? '0 (Attempted)'
                        : '0 (Not Attempted)'
                      : totalScore}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-semibold text-[#000000]">
                    {uniqueSubjects.length > 0
                      ? uniqueSubjects.map((subject, idx) => {
                          const subjData = subjectAnalysis.find(
                            s => s.subject === subject
                          );
                          return (
                            <div key={idx}>
                              <strong>{subject}:</strong>{' '}
                              {subjData ? subjData.scoreText : 'N/A'}
                            </div>
                          );
                        })
                      : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card layout for small screens */}
      <div className="md:hidden grid gap-4 mt-6">
        {currentPageData.map((item, index) => {
          const { student, totalScore, subjects, examDetails } = item;
          const subjectAnalysis = getSubjectWiseAnalysis(subjects);
          const attempted =
            subjects &&
            Object.keys(subjects).some(subject => {
              const subjData = subjects[subject];
              return (
                subjData &&
                (typeof subjData.max_code_marks !== 'undefined' ||
                  typeof subjData.max_mcq_marks !== 'undefined' ||
                  subjData.obtained_code_marks > 0 ||
                  subjData.obtained_mcq_marks > 0)
              );
            });
          const rowKey = `${student.id}-${index}`;
          const cardClassName = attempted ? 'bg-green-50' : 'bg-white';

          return (
            <div
              key={rowKey}
              className={`rounded-xl p-4 border ${cardClassName}`}
              style={{ boxShadow: '0px 4.16px 20.82px 0px #B3BAF7' }}
            >
              <p className="text-sm font-semibold text-[#000000]">
                <span className="text-[var(--color-secondary)]">ID:</span>{' '}
                {student.studentId || ''}
              </p>
              <p className="text-sm font-semibold text-[#000000]">
                <span className="text-[var(--color-secondary)]">Name:</span>{' '}
                {student.name || 'Unknown'}
              </p>
              <p className="text-sm font-semibold text-[#000000]">
                <span className="text-[var(--color-secondary)]">Phone:</span>{' '}
                {student.phNumber || 'N/A'}
              </p>
              <p className="text-sm font-semibold text-[#000000]">
                <span className="text-[var(--color-secondary)]">
                  Attempt Status:
                </span>{' '}
                {attempted ? 'Attempted' : 'Not Attempted'}
              </p>
              <p className="text-sm font-semibold text-[#000000]">
                <span className="text-[var(--color-secondary)]">Marks:</span>{' '}
                {totalScore === 0
                  ? attempted
                    ? '0 (Attempted)'
                    : '0 (Not Attempted)'
                  : totalScore}
              </p>
              <p className="text-sm font-semibold text-[#000000]">
                <span className="text-[var(--color-secondary)]">Analysis:</span>{' '}
                {uniqueSubjects.length > 0
                  ? uniqueSubjects.map((subject, idx) => {
                      const subjData = subjectAnalysis.find(
                        s => s.subject === subject
                      );
                      return (
                        <span key={idx}>
                          {subject}: {subjData ? subjData.scoreText : 'N/A'}
                          {idx < uniqueSubjects.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })
                  : 'N/A'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="w-full flex justify-end max-w-full mt-1 px-4">
          <div className="text-black font-medium text-[16px] font-['Inter'] tracking-[3px] leading-[70px] space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${currentPage === 1 ? 'text-[#0C1BAA] font-semibold' : 'hover:text-[#0C1BAA]'}`}
            >
              {'< '}Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${currentPage === page ? 'text-[#0C1BAA] font-semibold' : 'hover:text-[#0C1BAA]'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:text-[#0C1BAA]'}`}
            >
              Next {'>'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyExamReport;
