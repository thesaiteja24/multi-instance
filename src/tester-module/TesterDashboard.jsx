import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';

const TesterDashboard = () => {
  const [curriculumData, setCurriculumData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showChoice, setShowChoice] = useState({
    visible: false,
    subject: '',
    tag: '',
  });
  const [openDays, setOpenDays] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const testerId = userInfo?.id;

  // Fetch syllabus data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/tester-curriculum`,
        {
          params: { id: testerId },
        }
      );

      const data = response.data;

      // Validate curriculumTable exists
      if (!data.curriculumTable) {
        throw new Error('Curriculum table not found in response');
      }

      // Transform and sort the API response
      const transformedData = Object.entries(data.curriculumTable).flatMap(
        ([subject, days]) =>
          Object.entries(days).map(([dayId, dayData]) => ({
            subject,
            DayOrder: dayData.SubTopics[0]?.tag.split(':')[0] || `Day-${dayId}`,
            Topics: dayData.Topics,
            SubTopics: dayData.SubTopics.map(sub => sub.title),
            originalSubTopics: dayData.SubTopics,
          }))
      );

      // Sort by DayOrder numerically (e.g., Day-1, Day-2)
      transformedData.sort((a, b) => {
        const dayA = parseInt(a.DayOrder.split('-')[1] || 0);
        const dayB = parseInt(b.DayOrder.split('-')[1] || 0);
        return dayA - dayB;
      });

      setCurriculumData(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load curriculum. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [testerId]);

  // Set default selectedSubject to first subject
  const subjects = [...new Set(curriculumData.map(item => item.subject))];
  useEffect(() => {
    if (subjects.length > 0 && !subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Memoized handlers
  const handleSubjectChange = useCallback(event => {
    setSelectedSubject(event.target.value);
    setCurrentPage(1);
    setOpenDays({}); // Reset open days when subject changes
  }, []);

  const toggleDay = useCallback(day => {
    setOpenDays(prev => ({ ...prev, [day]: !prev[day] }));
  }, []);

  const handleTagClick = useCallback((subject, tag) => {
    setShowChoice({ visible: true, subject, tag });
  }, []);

  const handleChoiceSelection = useCallback(
    choice => {
      const { subject, tag } = showChoice;
      setShowChoice({ visible: false, subject: '', tag: '' });
      navigate(`/tester/verify-${choice}?subject=${subject}&tags=${tag}`);
    },
    [navigate, showChoice]
  );

  // Filter and group curriculum
  const filteredCurriculum = curriculumData.filter(
    item => item.subject === selectedSubject
  );

  const groupedByDay = filteredCurriculum.reduce((acc, item) => {
    if (!acc[item.DayOrder]) acc[item.DayOrder] = [];
    acc[item.DayOrder].push(item);
    return acc;
  }, {});

  // Pagination
  const dayEntries = Object.entries(groupedByDay);
  const totalPages = Math.ceil(dayEntries.length / itemsPerPage);
  const paginatedDays = dayEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-[53px] bg-gray-200 rounded" />
      ))}
    </div>
  );

  return (
    <div className="w-full  min-h-screen flex flex-col">
      <div className="w-11/12 py-10 px-4 mx-auto pt-5 font-[inter] flex flex-col flex-grow">
        {/* Filter and Upload Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {subjects.length > 1 ? (
            <div className="flex flex-row items-center gap-4">
              <label
                htmlFor="subject-filter"
                className="mb-1 font-medium text-[16px] text-[#000000]"
              >
                Filter by Subject
              </label>
              <div className="relative w-[229px] h-[46px]">
                <select
                  id="subject-filter"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  className="border-[2px] border-[#EDEFFF] rounded-[8px] text-[16px] text-[#000000] px-4 pr-10 w-full h-full shadow-[0px_4px_17px_rgba(19,_46,_224,_0.2)] bg-white appearance-none focus:ring-2 focus:ring-[#19216F]"
                  aria-label="Select subject"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <FaChevronDown
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black"
                  size={16}
                />
              </div>
            </div>
          ) : (
            <h2 className="text-[18px] font-medium text-[#000000]">
              Subject: {subjects[0] || 'Loading...'}
            </h2>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
            <button
              onClick={fetchData}
              className="ml-4 underline text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Accordion Section */}
        <div className="w-full mx-auto mt-10 shadow-[0px_4px_20px_#B3BAF7]">
          {isLoading ? (
            <SkeletonLoader />
          ) : paginatedDays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {subjects.length === 0
                ? 'No curriculum data available.'
                : `No curriculum data available for ${selectedSubject}.`}
            </div>
          ) : (
            paginatedDays.map(([day, items]) => (
              <div key={day} className="shadow-2xl mb-1">
                <button
                  onClick={() => toggleDay(day)}
                  className="flex items-center justify-between border bg-[#161A85] h-[53px] text-white px-4 w-full text-left"
                  aria-expanded={openDays[day]}
                  aria-controls={`day-content-${day}`}
                >
                  <span className="text-[16px]">{day}</span>
                  <FaChevronDown
                    className={`transition-transform duration-300 ${
                      openDays[day] ? 'rotate-0' : '-rotate-90'
                    }`}
                    size={16}
                  />
                </button>

                <div
                  id={`day-content-${day}`}
                  className={`transition-all duration-300 overflow-hidden ${
                    openDays[day] ? 'max-h-[1000px]' : 'max-h-0'
                  }`}
                >
                  <div className="border border-t-0 border-[#EFF0F7] max-h-[400px] overflow-y-auto">
                    <table className="table-auto w-full bg-white">
                      <thead>
                        <tr className="border border-black bg-[#FFDFDF] h-[53px]">
                          <th className="text-left py-2 text-[16px] border-l border-b-2 border-[#000] px-[55px]">
                            Topic Name
                          </th>
                          <th className="text-left px-4 py-2 text-[16px] border-r border-b-2 border-[#000]">
                            Subtopic with tag
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border border-black">
                            <td className="align-middle px-[55px] py-4 text-[18px]">
                              {item.Topics}
                            </td>
                            <td className="px-4 py-4">
                              <ul className="space-y-5">
                                {Array.isArray(item.originalSubTopics) &&
                                item.originalSubTopics.length > 0 ? (
                                  item.originalSubTopics.map(
                                    (subtopic, subIndex) => (
                                      <li
                                        key={subIndex}
                                        className="flex items-center space-x-2"
                                      >
                                        <button
                                          onClick={() =>
                                            handleTagClick(
                                              item.subject,
                                              subtopic.tag
                                            )
                                          }
                                          className="bg-[#19216F] text-white w-6 h-6 flex items-center justify-center text-sm hover:bg-[#151b5a] transition-colors"
                                          aria-label={`Select subtopic ${
                                            subIndex + 1
                                          }`}
                                        >
                                          {subIndex + 1}
                                        </button>
                                        <span
                                          className={`text-[16px] flex items-center gap-2 ${
                                            subtopic.status
                                              ? 'text-green-600'
                                              : 'text-gray-800'
                                          }`}
                                        >
                                          {subtopic.title || 'N/A'}
                                          {subtopic.status && (
                                            <FaCheck
                                              className="text-green-600"
                                              size={14}
                                              title="Completed"
                                            />
                                          )}
                                        </span>
                                      </li>
                                    )
                                  )
                                ) : (
                                  <li className="text-[16px]">N/A</li>
                                )}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex justify-end" aria-label="Curriculum pagination">
            <div className="flex items-center justify-end gap-3 text-black h-[70px] text-sm">
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-[16px] font-bold disabled:text-gray-400"
                  aria-label="Previous page"
                >
                  {'<'}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="hover:underline text-[16px] disabled:text-gray-400 disabled:pointer-events-none"
                >
                  Prev
                </button>
              </div>
              {Array.from(
                { length: Math.min(4, totalPages) },
                (_, i) => currentPage - 2 + i
              )
                .filter(num => num >= 1 && num <= totalPages)
                .map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`hover:underline text-[16px] ${
                      currentPage === num ? 'font-bold' : ''
                    }`}
                    aria-current={currentPage === num ? 'page' : undefined}
                  >
                    {num}
                  </button>
                ))}
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="hover:underline text-[16px] disabled:text-gray-400 disabled:pointer-events-none"
                >
                  Next
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="text-[16px] font-bold disabled:text-gray-400"
                  aria-label="Next page"
                >
                  {'>'}
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* Choice Overlay */}
        {showChoice.visible && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="choice-dialog-title"
          >
            <div className="bg-white rounded-md shadow-md w-full max-w-md p-6 py-14 relative">
              <button
                onClick={() =>
                  setShowChoice({ visible: false, subject: '', tag: '' })
                }
                className="absolute top-3 right-4 text-[#19216F] text-lg font-normal"
                aria-label="Close dialog"
              >
                X
              </button>
              <h2
                id="choice-dialog-title"
                className="text-[#19216F] text-xl sm:text-2xl font-semibold text-center mb-6 font-[Inter]"
              >
                Select Question Type
              </h2>
              <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                <button
                  onClick={() => handleChoiceSelection('mcq')}
                  className="w-full sm:w-[148px] h-[49px] bg-[#19216F] text-white rounded-md text-[18px] font-semibold hover:bg-[#151b5a] transition"
                >
                  MCQ
                </button>
                <button
                  onClick={() => handleChoiceSelection('coding')}
                  className="w-full sm:w-[148px] h-[49px] border border-[#19216F] text-[#19216F] bg-white rounded-md text-[18px] font-semibold hover:bg-[#f5f6ff] transition"
                >
                  Coding
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TesterDashboard);
