/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCheckCircle,
  FaBookOpen,
  FaLock,
  FaArrowLeft,
  FaRocket,
} from 'react-icons/fa';

import 'sweetalert2/dist/sweetalert2.min.css';
import './SubjectDetails.css';
import { useSelector } from 'react-redux';

const SubjectDetails = () => {
  const { state } = useLocation();
  const { studentDetails } = useSelector(state => state.student);
  const { userInfo } = useSelector(state => state.auth);
  const { location } = userInfo;
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (state?.subject?.name) {
      fetchCurriculum(state.subject.name);
    }
  }, [state]);

  const fetchCurriculum = async subject => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/stdcurriculum`,
        {
          params: {
            location: location,
            batchNo: studentDetails.BatchNo,
            subject,
          },
        }
      );
      const curriculumData = response.data.std_curiculum || [];
      const curriculumTable = curriculumData
        .map(item => {
          const topics = Object.values(item.curriculumTable);
          return topics.map(topic => {
            topic.SubTopics = topic.SubTopics.map(sub => ({
              ...sub,
              locked: sub.status === 'false',
            }));
            topic.locked = topic.SubTopics.some(sub => sub.locked);
            topic.videoUrl = topic.videoUrl || '';
            return topic;
          });
        })
        .flat();
      setCurriculum(curriculumTable);

      if (!selectedTopic) {
        const firstCompletedTopic = curriculumTable.find(
          topic => !topic.locked && topic.videoUrl
        );
        if (firstCompletedTopic) {
          setSelectedTopic(firstCompletedTopic);
        }
      }
    } catch (err) {
      console.error('Failed to fetch curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = videoUrl => {
    try {
      const url = new URL(videoUrl);
      if (url.hostname.includes('youtube.com') && url.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${url.searchParams.get(
          'v'
        )}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
      }
      if (url.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${url.pathname.slice(
          1
        )}?controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1`;
      }
      if (url.hostname.includes('drive.google.com')) {
        const fileId = url.pathname.split('/d/')[1]?.split('/')[0];
        return fileId
          ? `https://drive.google.com/file/d/${fileId}/preview?modestbranding=1&rel=0&showinfo=0&fs=0`
          : videoUrl;
      }
      return videoUrl;
    } catch (error) {
      console.error('Invalid video URL:', videoUrl);
      return '';
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter' && !item.locked) {
      setSelectedTopic(item);
    }
  };

  const videoUrls = Array.isArray(selectedTopic?.videoUrl)
    ? selectedTopic.videoUrl
    : [selectedTopic?.videoUrl];

  return (
    <>
      <div className="flex items-center mt-[0.5rem] gap-[1rem] p-[1rem] font-[Inter]">
        <button
          onClick={() => navigate('/student/courses')}
          className="flex items-center justify-center gap-[0.5rem] px-[0.75rem] py-[0.5rem] text-[var(--color-secondary)] rounded-md"
        >
          <FaArrowLeft className="text-[1rem]" />
        </button>
        <h2 className="text-[var(--color-secondary)] font-[inter] text-[1rem] font-semibold">
          {state?.subject?.name} Curriculum
        </h2>
      </div>
      <hr className="border-b-0 ml-[2.5rem] mr-[1.25rem] border mt-[1.25rem] mb-[0.75rem] border-black" />

      <div className="flex relative transition-all duration-500 ease-in-out mt-[3.5rem]">
        {!sidebarOpen && (
          <button
            className="absolute -top-[3rem] left-[1rem] mr-[2.5rem] text-white bg-[#19216F] p-[0.75rem] rounded-md text-[1.5rem] focus:outline-none hover:bg-gray-800 transition-all duration-500 ease-in-out z-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <img src="/icon.svg" alt="Menu Icon" />
          </button>
        )}

        <div
          ref={sidebarRef}
          style={{ boxShadow: '0rem 0.25rem 0.25rem 0rem #00000040' }}
          className={`scrollable-sidebar ml-[2.5rem] mt-[0.25rem] mb-[0.25rem] fixed lg:relative bg-[#E1EFFF] text-white max-h-[32.5rem] flex flex-col transition-all duration-500 ease-in-out rounded-r-2xl 
            ${
              sidebarOpen
                ? 'w-[20rem] h-[32.5rem] overflow-y-auto p-[1rem]'
                : 'w-[5rem] h-[32.5rem] opacity-0 overflow-hidden'
            }`}
        >
          <ul className="space-y-[0.75rem]">
            {curriculum.map((item, index) => (
              <React.Fragment key={index}>
                <li
                  key={index}
                  onClick={() => !item.locked && setSelectedTopic(item)}
                  onKeyDown={event => handleKeyDown(event, item)}
                  tabIndex={0}
                  aria-disabled={item.locked}
                  className={`flex items-center gap-[0.75rem] p-[0.75rem] rounded-lg transition group
                ${
                  item.locked
                    ? 'bg-gray-300 hover:bg-[var(--color-secondary)] text-black cursor-not-allowed opacity-50'
                    : 'bg-[#E1EFFF] hover:bg-[var(--color-secondary)] text-black hover:text-white cursor-pointer'
                }`}
                >
                  {item.locked ? (
                    <FaLock className="text-red-400" />
                  ) : (
                    <FaCheckCircle className="text-green-400" />
                  )}
                  {item.type === 'video' && (
                    <FaBookOpen className="text-blue-400" />
                  )}
                  {item.type === 'practice' && (
                    <FaEdit className="text-yellow-400" />
                  )}

                  <div>
                    <p className="text-[1rem] font-[inter] text-inherit group-hover:text-white">
                      {item.Topics}
                    </p>
                    {item.duration && (
                      <p className="text-[0.875rem] text-gray-500 group-hover:text-gray-200">
                        {item.duration}
                      </p>
                    )}
                  </div>
                </li>

                <hr className="size-0 mt-[0.5rem] ml-0 grow border-[0.0625rem] w-[17.5rem] border-[var(--color-secondary)]" />
              </React.Fragment>
            ))}
          </ul>
        </div>

        <div
          className={`flex-1 max-h-screen overflow-y-auto pl-[1.25rem] transition-all -mt-[4rem] duration-500 
              ${sidebarOpen ? 'lg:ml-[0.625rem]' : 'lg:ml-0'}`}
        >
          <h1 className="text-[1.5rem] lg:text-[1.5rem] font-bold lg:ml-0 ml-[2.5rem] text-[var(--color-secondary)] mb-[1.5rem] text-center md:text-left mt-[1rem] font-[Inter]">
            {selectedTopic?.Topics || 'Select a Topic'}
          </h1>

          <div>
            <div className="flex w-[100%] h-[45rem] gap-[0.5rem] md:gap-[2.5rem] lg:gap-[1rem] flex-col pr-[1.25rem] md:flex-col lg:flex-row">
              <div className="w-full md:w-full lg:flex-1 rounded-md overflow-hidden">
                {loading ? (
                  <div className="w-full h-[32.5rem] flex items-center justify-center bg-gradient-to-br from-[#E1EFFF] to-white rounded-xl shadow-lg">
                    <div className="relative">
                      <svg
                        className="w-[1rem] h-[1rem] text-[var(--color-secondary)] animate-spin"
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
                      <div className="absolute inset-0 bg-[var(--color-secondary)]/20 rounded-full blur-xl animate-pulse"></div>
                    </div>
                  </div>
                ) : videoUrls[0] ? (
                  <div className="flex flex-col gap-[1rem]">
                    {videoUrls.map((url, idx) => (
                      <iframe
                        key={idx}
                        className="w-full h-[15rem] md:h-[23.75rem] lg:h-[26.25rem] xl:h-[32.5rem] aspect-video rounded-md"
                        src={getEmbedUrl(url)}
                        title={`Video ${idx + 1}`}
                        frameBorder="0"
                        allowFullScreen
                        sandbox="allow-same-origin allow-scripts allow-forms"
                      ></iframe>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-[32.5rem] flex flex-col items-center justify-center bg-gradient-to-br from-[#E1EFFF] to-white rounded-xl shadow-lg p-[2rem] animate-fadeIn relative overflow-hidden">
                    <div className="absolute w-[4rem] h-[4rem] bg-[var(--color-secondary)]/20 rounded-full blur-3xl -top-[5rem] -left-[5rem] z-0"></div>
                    <div className="relative z-10 animate-float">
                      <FaRocket className="text-[var(--color-secondary)] w-[5rem] h-[5rem] drop-shadow-md" />
                      <div className="absolute inset-0 bg-[var(--color-secondary)]/10 rounded-full blur-xl animate-pulse z-[-1]"></div>
                    </div>
                    <h2 className="text-[1.875rem] font-bold text-[var(--color-secondary)] mt-[1.5rem] tracking-tight z-10">
                      Content Coming Soon!
                    </h2>
                    <p className="text-gray-600 mt-[0.75rem] text-[1.125rem] text-center max-w-sm font-[Inter] z-10">
                      Our team is crafting something amazing for you. Check back
                      soon for updates!
                    </p>
                    <button
                      onClick={() => navigate('/student/courses')}
                      className="mt-[1.5rem] px-[1.5rem] py-[0.5rem] bg-[var(--color-secondary)] text-white rounded-md shadow-md hover:bg-[#19216F] transition-colors duration-300 z-10"
                    >
                      Back to Courses
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full md:w-full lg:w-[23.8125rem] lg:h-[32.5rem] rounded-md flex flex-col">
                <div className="bg-[var(--color-secondary)] text-white text-center font-[inter] py-[1rem] rounded-t-md text-[1.125rem]">
                  Subtopics Covered
                </div>
                <div className="p-[1.25rem] flex-1 overflow-hidden scrollable-sidebar bg-white">
                  <ul className="space-y-[0.75rem] text-black font-[inter] text-[1rem] leading-[1.1875rem]">
                    {selectedTopic?.SubTopics?.map((sub, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-700 text-[1.125rem] mr-[0.5rem] flex justify-center items-center font-bold">
                          •
                        </span>{' '}
                        {sub.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectDetails;
