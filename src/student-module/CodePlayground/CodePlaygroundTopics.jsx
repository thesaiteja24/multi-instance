import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const CodePlaygroundTopics = () => {
  const { course, topicname } = useParams();
  const { studentDetails } = useSelector(state => state.student);
  const navigate = useNavigate();

  const [curriculumData, setCurriculumData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(course || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch curriculum data
  const fetchCurriculum = async () => {
    if (!studentDetails?.location || !studentDetails?.BatchNo) {
      setError('Location or Batch Number not available.');
      console.error('Location or Batch Number not available.');
      navigate(-1);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
        {
          params: {
            location: studentDetails.location,
            batchNo: studentDetails.BatchNo,
            subject: course,
          },
        }
      );
      const curriculum = response.data.std_curiculum || [];

      const transformedData = curriculum[0]
        ? Object.values(curriculum[0].curriculumTable).map((item, index) => ({
            subject: course,
            title: item.Topics,
            description: `Explore the key concepts and subtopics under ${item.Topics}.`,
            SubTopics: item.SubTopics.map(sub => ({
              title: sub.title,
              tag: sub.tag,
              status: sub.status,
            })),
          }))
        : [];

      setCurriculumData(transformedData);
    } catch (error) {
      console.error('Curriculum API call failed:', error);
      setError(`Failed to fetch curriculum for ${course}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [course, studentDetails]);

  const subjects = [...new Set(curriculumData.map(item => item.subject))];
  useEffect(() => {
    if (subjects.length > 0 && !subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const handleSubjectChange = useCallback(event => {
    setSelectedSubject(event.target.value);
  }, []);

  const handleSubTopicClick = useCallback(
    (subject, topic, subtopic) => {
      const encodedTopic = encodeURIComponent(
        topic.toLowerCase().replace(/[\s,]+/g, '-')
      );
      const encodedSubTopic = encodeURIComponent(
        subtopic.title.toLowerCase().replace(/\s+/g, '-')
      );
      navigate(
        `/code-playground/${subject}/${encodedTopic}/${encodedSubTopic}`,
        {
          state: {
            tag: subtopic.tag,
            course: subject,
            topicname: encodedTopic,
            subtopic: encodedSubTopic,
          },
        }
      );
    },
    [navigate]
  );

  const handleBackToTopics = () => {
    navigate(`/code-playground/${course}`);
  };

  const filteredCurriculum = curriculumData.filter(
    item => item.subject === selectedSubject
  );

  const displayData = topicname
    ? filteredCurriculum.filter(item => {
        const decodedTopicName = decodeURIComponent(topicname)
          .replace(/-/g, ' ')
          .toLowerCase();
        const normalizedTopic = item.title
          .toLowerCase()
          .replace(/[\s,]+/g, ' ');
        return normalizedTopic === decodedTopicName;
      })
    : filteredCurriculum;

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="w-full bg-gray-200 rounded-xl h-[100px] sm:h-[120px]"
        />
      ))}
    </div>
  );

  const CourseCard = ({ title, description, subtopics, onSubTopicClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleStartClick = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div className="w-full bg-white border border-[#D5D7DA] rounded-xl shadow-lg p-4 flex flex-col gap-4 transition-all duration-200 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-[150px] h-[100px] rounded-lg overflow-hidden flex-shrink-0">
            <img
              src="/kits/course.png"
              alt="Course Banner"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#252B37] font-['Inter'] font-semibold text-base sm:text-lg lg:text-xl leading-tight">
                {title}
              </h3>
              <p className="text-[#414651] font-['Inter'] font-normal text-sm sm:text-base leading-5">
                {description}
              </p>
            </div>
            <button
              onClick={handleStartClick}
              className="w-full sm:w-[120px] h-10 bg-[#2333CB] text-white font-['Inter'] font-semibold text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 hover:bg-[#1b2a9e] transition-colors duration-200"
            >
              {isOpen ? 'Close' : 'Start'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transform ${isOpen ? 'rotate-180' : ''}`}
              >
                <path
                  d="M22 12C22 6.49 17.51 2 12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12ZM11.47 14.79L7.94 11.26C7.79 11.11 7.72 10.92 7.72 10.73C7.72 10.54 7.79 10.35 7.94 10.2C8.23 9.91 8.71 9.91 9 10.2L12 13.2L15 10.2C15.29 9.91 15.77 9.91 16.06 10.2C16.35 10.49 16.35 10.97 16.06 11.26L12.53 14.79C12.24 15.09 11.76 15.09 11.47 14.79Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="transition-all duration-300 ease-in-out">
            <SubTopicsList
              subtopics={subtopics}
              onSubTopicClick={onSubTopicClick}
            />
          </div>
        )}
      </div>
    );
  };

  const SubTopicsList = ({ subtopics, onSubTopicClick }) => {
    return (
      <div className="p-4 sm:p-6  rounded-xl shadow-sm">
        <div className="flex flex-col items-start gap-3 w-full">
          <div className="flex flex-row items-center gap-6 w-full">
            <div className="flex flex-col items-start gap-2 w-full">
              <h2 className="text-[#2333CB] font-['Inter'] font-semibold text-lg sm:text-xl md:text-2xl leading-tight">
                Topics
              </h2>
              <div className="flex flex-row items-start w-full h-1">
                <div className="w-16 sm:w-20 h-1 bg-[#2333CB] rounded-l-md"></div>
                <div className="flex-1 h-1 bg-[#E9EAEB] rounded-r-md"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 mt-4 pb-4 scrollbar-hide">
          {subtopics.map((subtopic, index) => (
            <div
              key={index}
              className="bg-[#6B46C1] text-white rounded-xl p-4 flex flex-col min-w-[250px] max-w-[250px] shadow-md cursor-pointer hover:bg-[#5a3a9e] hover:shadow-lg transition-all duration-200"
              onClick={() => onSubTopicClick(subtopic)}
            >
              {/* Title + Button in a row */}
              <div className="flex flex-col justify-between gap-2 w-full h-full">
                {/* Title on left */}
                <h3 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 text-center">
                  {subtopic.title}
                </h3>

                {/* Button on right */}
                <button
                  className="bg-white text-[#6B46C1] font-semibold text-xs sm:text-sm py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={e => {
                    e.stopPropagation();
                    onSubTopicClick(subtopic);
                  }}
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-10 m-0 sm:m-2 w-full font-['Inter'] bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row px-0 sm:px-5 gap-4 sm:gap-0">
        <div className="flex-1">
          <h2 className="text-[#252B37] font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight text-center sm:text-left">
            {selectedSubject || 'Loading...'}
          </h2>
          <span className="text-[#414651] font-normal text-xs sm:text-sm md:text-base lg:text-lg leading-5 sm:leading-[22px] block mt-2 text-center sm:text-left">
            Explore the curriculum and subtopics for {selectedSubject}.
          </span>
        </div>
        {topicname && (
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={handleBackToTopics}
              className="flex items-center gap-2 bg-[#19216F] text-white h-[46px] px-4 rounded-md hover:bg-[#151b5a] transition-colors"
              aria-label="Back to topics"
            >
              Back to Topics
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 px-0 sm:px-5">
        <div className="flex flex-col items-start gap-3 sm:gap-4 w-full">
          <div className="flex flex-row items-center gap-6 sm:gap-8 w-full">
            <div className="flex flex-col items-start gap-2 sm:gap-3 w-full">
              <h2 className="text-[#252B37] font-['Inter'] font-medium text-base sm:text-lg md:text-xl lg:text-2xl leading-tight w-full">
                List Items
              </h2>
              <div className="flex flex-row items-start w-full h-1">
                <div className="w-12 sm:w-16 md:w-20 lg:w-24 h-1 bg-[#2333CB] rounded-l-md"></div>
                <div className="flex-1 h-1 bg-[#E9EAEB] rounded-r-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
            <button
              onClick={fetchCurriculum}
              className="ml-4 underline text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {subjects.length === 0
              ? 'No curriculum data available.'
              : `No curriculum data available for ${selectedSubject}.`}
          </div>
        ) : (
          displayData.map((item, index) => (
            <CourseCard
              key={index}
              title={item.title}
              description={item.description}
              subtopics={item.SubTopics}
              onSubTopicClick={subtopic =>
                handleSubTopicClick(item.subject, item.title, subtopic)
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CodePlaygroundTopics;
