import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

const SetExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { examData, batch, type } = location.state || {};
  const { userInfo } = useSelector(state => state.auth);

  const managerId = userInfo?.id;
  const managerLocation = userInfo?.location;

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedMCQs, setSelectedMCQs] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [selectedCoding, setSelectedCoding] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [totalMCQs, setTotalMCQs] = useState({ easy: 0, medium: 0, hard: 0 });
  const [totalCoding, setTotalCoding] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [displaySubtopics, setDisplaySubtopics] = useState([]);
  const [displayTopics, setDisplayTopics] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [creatingExam, setCreatingExam] = useState(false);
  const [isTimeCollapsed, setIsTimeCollapsed] = useState(true);
  const [subjectList, setSubjectList] = useState([]);

  const datetimeRef = useRef();

  useEffect(() => {
    if (examData) {
      setSubjectList(Object.keys(examData));
    }
  }, [examData]);

  useEffect(() => {
    if (selectedSubject && examData?.[selectedSubject]) {
      const breakdown = examData[selectedSubject].breakdown;
      if (breakdown) {
        setTotalMCQs(breakdown.mcq || { easy: 0, medium: 0, hard: 0 });
        setTotalCoding(breakdown.code || { easy: 0, medium: 0, hard: 0 });
      } else {
        setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
        setTotalCoding({ easy: 0, medium: 0, hard: 0 });
      }

      const { subtitles } = examData[selectedSubject];
      setDisplaySubtopics(subtitles || []);
      setDisplayTopics([]);

      setSelectedMCQs({ easy: 0, medium: 0, hard: 0 });
      setSelectedCoding({ easy: 0, medium: 0, hard: 0 });
    } else {
      setTotalMCQs({ easy: 0, medium: 0, hard: 0 });
      setTotalCoding({ easy: 0, medium: 0, hard: 0 });
      setDisplaySubtopics([]);
      setDisplayTopics([]);
    }
  }, [selectedSubject, examData]);

  const handleMCQInputChange = e => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    const safeValue = Math.min(
      Math.max(0, isNaN(parsedValue) ? 0 : parsedValue),
      totalMCQs[name] || 0
    );
    setSelectedMCQs({ ...selectedMCQs, [name]: safeValue });
  };

  const handleCodingInputChange = e => {
    const { name, value } = e.target;
    const parsedValue = parseInt(value, 10);
    const safeValue = Math.min(
      Math.max(0, isNaN(parsedValue) ? 0 : parsedValue),
      totalCoding[name] || 0
    );
    setSelectedCoding({ ...selectedCoding, [name]: safeValue });
  };

  const handleSetSubject = () => {
    if (!selectedSubject) {
      toast.info('Please select a subject first.');
      return;
    }

    const existingIndex = examSubjects.findIndex(
      item => item.subject === selectedSubject
    );

    const tags = examData[selectedSubject]?.tags || [];
    const mcqTime = selectedMCQs.easy + selectedMCQs.medium + selectedMCQs.hard;
    const codingTime =
      selectedCoding.easy * 5 +
      selectedCoding.medium * 10 +
      selectedCoding.hard * 15;
    const totalTime = mcqTime + codingTime;

    const newEntry = {
      subject: selectedSubject,
      tags,
      selectedMCQs: { ...selectedMCQs },
      selectedCoding: { ...selectedCoding },
      totalTime,
    };

    if (existingIndex >= 0) {
      setExamSubjects(prev =>
        prev.map((item, idx) => (idx === existingIndex ? newEntry : item))
      );
      toast.success(`Updated questions for ${selectedSubject}.`);
    } else {
      setExamSubjects(prev => [...prev, newEntry]);
      toast.success(`Questions set for ${selectedSubject}.`);
    }
  };

  const handleDeleteSubject = subjectName => {
    setExamSubjects(prev => prev.filter(item => item.subject !== subjectName));
    toast.success(`Deleted questions for ${subjectName}.`);
  };

  const handleEditSubject = subjectName => {
    const found = examSubjects.find(item => item.subject === subjectName);
    if (found) {
      setSelectedSubject(found.subject);
      setSelectedMCQs(found.selectedMCQs);
      setSelectedCoding(found.selectedCoding);
    }
  };

  const handleCreateExam = async () => {
    if (examSubjects.length === 0 || !startDate || !startTime) {
      toast.info('Please select at least one subject and enter date/time.');
      return;
    }

    setCreatingExam(true);

    const totalExamTime = examSubjects.reduce(
      (sum, item) => sum + item.totalTime,
      0
    );
    const type = 'Daily-Exam';
    const newExamPayload = {
      type: type,
      batch: batch?.Batch,
      subjects: examSubjects,
      totalExamTime,
      startDate,
      startTime,
      managerId,
      managerLocation,
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/generate-exam-paper`,
        newExamPayload
      );
      toast.success(response.data.message);
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to create exam. Try again.'
      );
    } finally {
      setCreatingExam(false);
    }
  };

  const handleIconClick = () => {
    datetimeRef.current && datetimeRef.current.showPicker();
  };

  return (
    <div className="font-[Inter] p-4 sm:p-6 md:p-8 flex flex-col justify-start md:justify-center items-center w-full">
      <div className="flex justify-center items-center mx-auto w-full">
        <div className="flex w-[80%] flex-col lg:flex-row gap-6 justify-center items-stretch">
          {/* Left Panel - Question Setup */}
          <div className="w-full  bg-white p-6 rounded-2xl border border-blue-100 shadow-lg flex flex-col">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#00007F] mb-4 text-center">
              Set Questions for {batch?.Batch}
            </h2>

            {/* Subject Selection */}
            <div className="mb-6">
              <label
                htmlFor="subject"
                className="block text-lg font-medium text-[#07169A] mb-1"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-[#07169A] rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm sm:text-base"
                >
                  <option value="">Select Subject</option>
                  {subjectList.map(subKey => (
                    <option key={subKey} value={subKey}>
                      {subKey}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Subtopics Display */}
            {selectedSubject && (
              <div className="mt-6">
                <h3 className="text-lg sm:text-xl font-semibold text-[#00007F] mb-2">
                  Topics for Exam
                </h3>
                {displaySubtopics.length > 0 ? (
                  <ul className="list-disc list-inside text-sm sm:text-lg text-[#00007F]">
                    {displaySubtopics.map((subtopic, idx) => (
                      <li key={idx}>{subtopic.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">
                    No subtopics available.
                  </p>
                )}
              </div>
            )}

            {/* Question Breakdown */}
            {selectedSubject && (
              <>
                {/* MCQ Questions */}
                {totalMCQs.easy + totalMCQs.medium + totalMCQs.hard > 0 && (
                  <div className="mb-6">
                    <label className="block text-lg sm:text-xl font-semibold text-[#00007F] mb-2">
                      MCQ Questions
                    </label>
                    <h4 className="text-sm sm:text-lg font-medium text-[#07169A] mb-2">
                      Enter the count of the Questions{' '}
                      <span className="text-red-500">*</span>
                    </h4>
                    <div className="w-full grid grid-cols-1 gap-4">
                      {['easy', 'medium', 'hard'].map(level => {
                        const total = totalMCQs[level] || 0;
                        if (!total) return null;
                        return (
                          <div key={level} className="flex flex-col">
                            <label className="mb-1 font-medium text-sm sm:text-base text-[#07169A]">
                              {level.charAt(0).toUpperCase() + level.slice(1)}{' '}
                              (Total: {total})
                            </label>
                            <input
                              type="text"
                              name={level}
                              value={selectedMCQs[level] || ''}
                              onChange={handleMCQInputChange}
                              placeholder="Enter Count"
                              min="0"
                              max={total}
                              className="w-full p-3 border border-[#07169A] rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00007F] text-sm sm:text-base"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coding Questions */}
                {totalCoding.easy + totalCoding.medium + totalCoding.hard >
                  0 && (
                  <div className="mb-6">
                    <label className="block text-lg sm:text-xl font-semibold text-[#00007F] mb-2">
                      Coding Questions
                    </label>
                    <h4 className="text-sm sm:text-lg font-medium text-[#07169A] mb-2">
                      Enter the count of the Questions{' '}
                      <span className="text-red-500">*</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {['easy', 'medium', 'hard'].map(level => {
                        const total = totalCoding[level] || 0;
                        if (total > 0) {
                          return (
                            <div key={level} className="flex flex-col">
                              <label className="mb-1 font-medium text-sm sm:text-base text-[#07169A]">
                                {level.charAt(0).toUpperCase() + level.slice(1)}{' '}
                                (Total: {total})
                              </label>
                              <input
                                type="text"
                                name={level}
                                value={
                                  selectedCoding[level] === 0
                                    ? ''
                                    : selectedCoding[level]
                                }
                                onChange={handleCodingInputChange}
                                placeholder="Enter Count"
                                min="0"
                                max={total}
                                className="w-full p-3 border border-[#07169A] rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00007F] text-sm sm:text-base"
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {/* Set Questions Button */}
                {(totalMCQs.easy + totalMCQs.medium + totalMCQs.hard > 0 ||
                  totalCoding.easy + totalCoding.medium + totalCoding.hard >
                    0) && (
                  <button
                    onClick={handleSetSubject}
                    className={`w-full sm:w-auto p-3 mt-4 rounded-md text-sm sm:text-base font-medium text-white ${
                      creatingExam
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-[#00007F] hover:bg-blue-900'
                    }`}
                    disabled={creatingExam}
                  >
                    Set Questions
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right Panel - Exam Summary */}
          {examSubjects.length > 0 && (
            <div className="w-full  bg-white p-6 rounded-2xl border border-blue-100 shadow-lg flex flex-col">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#00007F] mb-4 text-center">
                Exam Summary
              </h2>

              <div className="flex items-center justify-center gap-2 mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.2 15.94C16.07 15.94 15.94 15.91 15.82 15.83L12.72 13.98C11.95 13.52 11.38 12.51 11.38 11.62V7.52C11.38 7.11 11.72 6.77 12.13 6.77C12.54 6.77 12.88 7.11 12.88 7.52V11.62C12.88 11.98 13.18 12.51 13.49 12.69L16.59 14.54C16.95 14.75 17.07 15.21 16.85 15.57C16.71 15.81 16.46 15.94 16.2 15.94Z"
                    fill="#00007F"
                  />
                </svg>
                <span className="text-[#00007F] font-semibold text-sm sm:text-lg">
                  Total Time:{' '}
                  {examSubjects.reduce((sum, s) => sum + s.totalTime, 0)} mins
                </span>
              </div>

              {examSubjects.map((item, index) => {
                const { subject, selectedMCQs, selectedCoding } = item;
                return (
                  <div
                    key={index}
                    className="border border-[#00007F] m-4 p-4 rounded-lg bg-[#EFF3FF]"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg sm:text-xl text-[#00007F] font-semibold mb-2">
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 22H3C2.59 22 2.25 21.66 2.25 21.25C2.25 20.84 2.59 20.5 3 20.5H21C21.41 20.5 21.75 20.84 21.75 21.25C21.75 21.66 21.41 22 21 22Z"
                              fill="#95FA6E"
                            />
                            <path
                              d="M19.0201 3.47967C17.0801 1.53967 15.1801 1.48967 13.1901 3.47967L11.9801 4.68967C11.8801 4.78967 11.8401 4.94967 11.8801 5.08967C12.6401 7.73967 14.7601 9.85967 17.4101 10.6197C17.4501 10.6297 17.4901 10.6397 17.5301 10.6397C17.6401 10.6397 17.7401 10.5997 17.8201 10.5197L19.0201 9.30967C20.0101 8.32967 20.4901 7.37967 20.4901 6.41967C20.5001 5.42967 20.0201 4.46967 19.0201 3.47967Z"
                              fill="#95FA6E"
                            />
                            <path
                              d="M15.6098 11.5308C15.3198 11.3908 15.0398 11.2508 14.7698 11.0908C14.5498 10.9608 14.3398 10.8208 14.1298 10.6708C13.9598 10.5608 13.7598 10.4008 13.5698 10.2408C13.5498 10.2308 13.4798 10.1708 13.3998 10.0908C13.0698 9.81078 12.6998 9.45078 12.3698 9.05078C12.3398 9.03078 12.2898 8.96078 12.2198 8.87078C12.1198 8.75078 11.9498 8.55078 11.7998 8.32078C11.6798 8.17078 11.5398 7.95078 11.4098 7.73078C11.2498 7.46078 11.1098 7.19078 10.9698 6.91078C10.9486 6.86539 10.9281 6.82022 10.9083 6.77532C10.7607 6.442 10.3261 6.34455 10.0683 6.60231L4.33983 12.3308C4.20983 12.4608 4.08983 12.7108 4.05983 12.8808L3.51983 16.7108C3.41983 17.3908 3.60983 18.0308 4.02983 18.4608C4.38983 18.8108 4.88983 19.0008 5.42983 19.0008C5.54983 19.0008 5.66983 18.9908 5.78983 18.9708L9.62983 18.4308C9.80983 18.4008 10.0598 18.2808 10.1798 18.1508L15.9011 12.4295C16.1607 12.1699 16.0628 11.7245 15.7252 11.5804C15.6872 11.5642 15.6488 11.5476 15.6098 11.5308Z"
                              fill="#95FA6E"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M19.24 5.58055H18.84L15.46 2.20055C15.19 1.93055 14.75 1.93055 14.47 2.20055C14.2 2.47055 14.2 2.91055 14.47 3.19055L16.86 5.58055H7.14L9.53 3.19055C9.8 2.92055 9.8 2.48055 9.53 2.20055C9.26 1.93055 8.82 1.93055 8.54 2.20055L5.17 5.58055H4.77C3.87 5.58055 2 5.58055 2 8.14055C2 9.11055 2.2 9.75055 2.62 10.1705C2.86 10.4205 3.15 10.5505 3.46 10.6205C3.75 10.6905 4.06 10.7005 4.36 10.7005H19.64C19.95 10.7005 20.24 10.6805 20.52 10.6205C21.36 10.4205 22 9.82055 22 8.14055C22 5.58055 20.13 5.58055 19.24 5.58055Z"
                              fill="#F24660"
                            />
                            <path
                              d="M19.0502 12H4.87016C4.25016 12 3.78016 12.55 3.88016 13.16L4.72016 18.3C5.00015 20.02 5.75015 22 9.08015 22H14.6902C18.0602 22 18.6602 20.31 19.0202 18.42L20.0302 13.19C20.1502 12.57 19.6802 12 19.0502 12ZM10.6102 18.45C10.6102 18.84 10.3002 19.15 9.92016 19.15C9.53016 19.15 9.22016 18.84 9.22016 18.45V15.15C9.22016 14.77 9.53016 14.45 9.92016 14.45C10.3002 14.45 10.6102 14.77 10.6102 15.15V18.45ZM14.8902 18.45C14.8902 18.84 14.5802 19.15 14.1902 19.15C13.8102 19.15 13.4902 18.84 13.4902 18.45V15.15C13.4902 14.77 13.8102 14.45 14.1902 14.45C14.5802 14.45 14.8902 14.77 14.8902 15.15V18.45Z"
                              fill="#F24660"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-sm sm:text-base text-[#00007F]">
                      <li>
                        MCQs: Easy ({selectedMCQs.easy}), Medium (
                        {selectedMCQs.medium}), Hard ({selectedMCQs.hard})
                      </li>
                      <li>
                        Coding: Easy ({selectedCoding.easy}), Medium (
                        {selectedCoding.medium}), Hard ({selectedCoding.hard})
                      </li>
                    </ul>
                  </div>
                );
              })}

              {/* DateTimeInput Integration */}
              <div className="m-4">
                <label className="block text-sm sm:text-lg font-semibold text-[#07169A] mb-1">
                  Select Date & Time
                </label>
                <div className="relative">
                  <input
                    ref={datetimeRef}
                    type="datetime-local"
                    value={
                      startDate && startTime ? `${startDate}T${startTime}` : ''
                    }
                    onChange={e => {
                      const [date, time] = e.target.value.split('T');
                      setStartDate(date);
                      setStartTime(time);
                    }}
                    min="2025-05-28T11:28"
                    className="w-full p-3 border border-blue-800 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base pr-12"
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={handleIconClick}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 2V5"
                        stroke="#00007F"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 2V5"
                        stroke="#00007F"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.5 9.08984H20.5"
                        stroke="#00007F"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                        stroke="#00007F"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.6947 13.6992H15.7037"
                        stroke="#00007F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.6947 16.6992H15.7037"
                        stroke="#00007F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.9955 13.6992H12.0045"
                        stroke="#00007F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.9955 16.6992H12.0045"
                        stroke="#00007F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.29431 13.6992H8.30329"
                        stroke="#00007F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.29431 16.6992H8.30329"
                        stroke="#00007F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="m-4">
                <button
                  onClick={handleCreateExam}
                  className={`w-full p-4 rounded-md text-sm sm:text-base text-white font-medium ${
                    creatingExam
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[#00007F] hover:bg-blue-900'
                  }`}
                  disabled={creatingExam}
                >
                  {creatingExam ? 'Creating Exam...' : 'Create Exam'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetExam;
