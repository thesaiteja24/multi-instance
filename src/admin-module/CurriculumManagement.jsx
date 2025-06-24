import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { FaUpload, FaFileExcel, FaUser, FaDownload } from 'react-icons/fa';
import { COLLEGE_SUBJECTS } from '../constants/AppConstants';

const CurriculumManagement = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dayOrder, setDayOrder] = useState('');
  const [topic, setTopic] = useState('');
  const [curriculumData, setCurriculumData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [showExcelUploadTab, setShowExcelUploadTab] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        subject: 'Python',
        dayOrder: 'Day-1',
        topic: 'Python Introduction',
        subTopics: 'Programming Language,Data Types',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Curriculum_Template.xlsx');
  };

  const fetchCurriculumData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/syllabus`
      );
      if (response.status === 200 && response.data?.data) {
        const formattedData = response.data.data.map(item => ({
          ...item,
        }));
        setCurriculumData(formattedData);
        setFilteredData(formattedData.filter(data => data.subject));
        setShowTable(true);
      } else {
        setCurriculumData([]);
        setFilteredData([]);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch curriculum data. Please try again later.',
      });
    }
  }, []);

  useEffect(() => {
    fetchCurriculumData();
  }, [fetchCurriculumData]);

  const handleFilterChange = subject => {
    setFilterSubject(subject);
    if (subject) {
      const filtered = curriculumData.filter(data => data.subject === subject);
      setFilteredData(filtered);
    } else {
      setFilteredData(curriculumData);
    }
  };

  const handleAddTopic = async () => {
    if (!selectedSubject.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Subject',
        text: 'Please select a subject.',
      });
      return;
    }
    if (!dayOrder.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Day Order',
        text: 'Please enter a valid Day Order.',
      });
      return;
    }
    if (!topic.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Topic',
        text: 'Please enter a valid Topic.',
      });
      return;
    }
    if (subTopics.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Topics/Subtopics',
        text: 'Please add at least one topic and one subtopic.',
      });
      return;
    }

    const newCurriculum = {
      subject: selectedSubject,
      dayOrder,
      topic,
      subTopics,
    };

    try {
      setIsSubmitting(true);
      Swal.fire({
        title: 'Adding Curriculum',
        text: 'Please wait while we add the curriculum...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/syllabus`,
        newCurriculum
      );
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Curriculum Added',
          text: 'The curriculum has been added successfully!',
        });
        fetchCurriculumData();
        setCurriculumData(prevData => [...prevData, { ...newCurriculum }]);
        setShowTable(true);
        setSelectedSubject('');
        setDayOrder('');
        setTopic('');
        setSubTopics([]);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Add',
          text: 'Failed to add curriculum. Please try again.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the curriculum. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjects = COLLEGE_SUBJECTS;

  const handleAddSubTopicToList = newSubTopic => {
    if (newSubTopic.trim() !== '') {
      setSubTopics(prevSubTopics => [...prevSubTopics, newSubTopic]);
    }
  };

  const handleExcelUpload = async e => {
    const fileInput = document.getElementById('excelUpload');
    const file = e.target.files[0];

    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please choose a file to upload.',
      });
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      Swal.fire({
        title: 'Invalid File Type',
        text: 'Only Excel or CSV files are supported.',
        icon: 'error',
      });
      fileInput.value = '';
      return;
    }

    try {
      const processExcelData = (rows, headers) => {
        let errors = [];
        let extractedData = [];
        let expectedDayOrder = 1;

        rows.slice(1).forEach((row, index) => {
          const rowNum = index + 2;
          const subject = row[headers.indexOf('subject')]?.toString().trim();
          let rawDayOrder = row[headers.indexOf('dayorder')]?.toString().trim();

          if (/^\d+$/.test(rawDayOrder)) {
            errors.push(
              `❌ Row ${rowNum}: Invalid Day Order "${rawDayOrder}". It should be in format "Day-1", "Day-2", etc.`
            );
          }

          if (!/^Day-\d+$/.test(rawDayOrder)) {
            errors.push(
              `❌ Row ${rowNum}: Invalid Day Order "${rawDayOrder}". Use format "Day-1", "Day-2", etc.`
            );
          } else {
            const dayNumber = parseInt(rawDayOrder.replace('Day-', ''), 10);
            if (dayNumber !== expectedDayOrder) {
              errors.push(
                `❌ Row ${rowNum}: Incorrect sequence. Expected "Day-${expectedDayOrder}", but found "${rawDayOrder}".`
              );
            } else {
              expectedDayOrder++;
            }
          }

          if (!subjects.includes(subject)) {
            errors.push(
              `❌ Row ${rowNum}: Invalid Subject "${subject}". Allowed: ${subjects.join(', ')}`
            );
          }

          if (errors.length === 0) {
            extractedData.push({
              subject,
              dayOrder: rawDayOrder,
              topic: row[headers.indexOf('topic')]?.toString() || '',
              subTopics: row[headers.indexOf('subtopics')]
                ? row[headers.indexOf('subtopics')]
                    .split(',')
                    .map(item => item.trim())
                : [],
            });
          }
        });

        if (errors.length > 0) {
          Swal.fire({
            title: 'Data Validation Errors',
            html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">${errors.join('<br>')}</div>`,
            icon: 'error',
          });
          fileInput.value = '';
          return;
        }

        setExcelData(extractedData);
        Swal.fire({
          title: 'File Uploaded Successfully',
          text: `${extractedData.length} rows processed.`,
          icon: 'success',
        });
      };

      if (fileExtension === 'csv') {
        const reader = new FileReader();
        reader.onload = event => {
          const csvContent = event.target.result;
          const parsedData = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
          });

          if (parsedData.data.length > 0) {
            const headers = Object.keys(parsedData.data[0]).map(h =>
              h.toLowerCase().trim()
            );
            processExcelData(parsedData.data.map(Object.values), headers);
          } else {
            Swal.fire({
              title: 'Invalid CSV File',
              text: 'The file is empty or missing headers.',
              icon: 'error',
            });
            fileInput.value = '';
          }
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = event => {
          const content = new Uint8Array(event.target.result);
          const workbook = XLSX.read(content, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (rows.length > 1) {
            const headers = rows[0].map(
              header => header?.toLowerCase().trim() || ''
            );
            processExcelData(rows, headers);
          } else {
            Swal.fire({
              title: 'Invalid Excel File',
              text: 'The file is empty or missing headers.',
              icon: 'error',
            });
            fileInput.value = '';
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `An error occurred: ${error.message}`,
      });
      fileInput.value = '';
    }
  };

  const handleSubmitExcel = async () => {
    if (excelData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Uploaded',
        text: 'Please upload an Excel file before submitting.',
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/syllabus`,
        excelData
      );
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'File Uploaded Successfully',
          text: 'The file has been uploaded and is being processed.',
        });
        await fetchCurriculumData();
        const fileInput = document.getElementById('excelUpload');
        if (fileInput) {
          fileInput.value = '';
        }
        setExcelData([]);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'There was an issue uploading the file. Please try again.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while uploading the file. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="w-full">
        <div>
          <h2 className="font-[poppins] font-semibold text-[20px] md:text-[25px] text-center text-[#00007F]">
            Curriculum Management
          </h2>
        </div>
        {!showExcelUploadTab && (
          <div className="flex flex-wrap gap-3 items-center justify-center p-2 sm:p-4">
            <button
              onClick={() => setShowExcelUploadTab(false)}
              className={`flex items-center w-fit rounded-[6px] p-2 px-3 gap-2 ${
                !showExcelUploadTab
                  ? 'bg-[#00007F] text-white'
                  : 'bg-[#8D8D8D] text-white'
              }`}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.4545 9.93431C12.7404 9.93431 14.5935 8.0812 14.5935 5.79528C14.5935 3.50936 12.7404 1.65625 10.4545 1.65625C8.16854 1.65625 6.31543 3.50936 6.31543 5.79528C6.31543 8.0812 8.16854 9.93431 10.4545 9.93431Z"
                  stroke="white"
                  strokeWidth="2.06952"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.5655 19.0388C17.5655 15.8352 14.3784 13.2441 10.4546 13.2441C6.5308 13.2441 3.34375 15.8352 3.34375 19.0388"
                  stroke="white"
                  strokeWidth="2.06952"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="font-[poppins] font-medium text-[14px] text-center">
                Manual Entry
              </h2>
            </button>
            <button
              onClick={() => setShowExcelUploadTab(true)}
              className={`flex items-center w-fit rounded-[6px] p-2 px-3 gap-2 ${
                showExcelUploadTab
                  ? 'bg-[#00007F] text-white'
                  : 'bg-[#8D8D8D] text-white'
              }`}
            >
              <svg
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.3174 13.6586V9.51953"
                  stroke="white"
                  strokeWidth="2.06952"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.3373 11.5898H8.19824"
                  stroke="white"
                  strokeWidth="2.06952"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5454 9.10651V14.0733C18.5454 17.3846 17.7176 18.2124 14.4063 18.2124H6.12829C2.81706 18.2124 1.98926 17.3846 1.98926 14.0733V5.79528C1.98926 2.48406 2.81706 1.65625 6.12829 1.65625H7.37C8.61171 1.65625 8.88488 2.02048 9.35673 2.64962L10.5984 4.30523C10.913 4.71913 11.0951 4.96747 11.9229 4.96747H14.4063C17.7176 4.96747 18.5454 5.79528 18.5454 9.10651Z"
                  stroke="white"
                  strokeWidth="2.06952"
                  strokeMiterlimit="10"
                />
              </svg>
              <h2 className="font-[poppins] font-medium text-[14px] text-center">
                Excel Upload
              </h2>
            </button>
          </div>
        )}

        {!showExcelUploadTab ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-[30%_68%] gap-3 sm:gap-4 p-2">
            <div
              className="bg-white p-2 sm:p-3 rounded-[12px] sm:rounded-[20px]"
              style={{ boxShadow: '2px 2px 10px 0px #B3BAF7' }}
            >
              <div className="p-2">
                <h2 className="font-[poppins] font-semibold text-[24px] text-[#00007F]">
                  Select Subject
                </h2>
              </div>
              <div className="p-2">
                <span className="font-[poppins] font-medium text-[20px] text-[#00007F]">
                  Choose a Subject <span className="text-[#EC5F70]">*</span>
                </span>
                <br />
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="border border-[#00007F] p-2 sm:p-3 px-3 sm:px-4  w-full rounded-[4px] py-2 sm:py-3 mt-2"
                >
                  <option value="">Select a Subject</option>
                  {subjects.map((subject, index) => (
                    <option
                      key={index}
                      value={subject}
                      className="p-2 sm:p-3 px-3 sm:px-4"
                    >
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className="bg-white w-full p-2 sm:p-3 rounded-[12px] sm:rounded-[20px]"
              style={{ boxShadow: '0px 2px 10px 0px #B3BAF7' }}
            >
              <div className="p-2">
                <h2 className="font-[poppins] font-semibold text-[24px] text-[#00007F]">
                  Add Curriculum Details
                </h2>
              </div>
              <div className="grid grid-cols-1 p-2 w-full lg:grid-cols-[50%_50%] xl:grid-cols-[28%_28%_28%_11%] gap-2 sm:gap-3 items-center">
                <div className="p-2">
                  <span className="font-[poppins] font-medium text-[20px] text-[#00007F]">
                    Day Order <span className="text-[#EC5F70]">*</span>
                  </span>
                  <br />
                  <input
                    id="dayOrder"
                    type="text"
                    value={dayOrder}
                    onChange={e => setDayOrder(e.target.value)}
                    placeholder="Day Order (eg: Day-1)"
                    className="border border-[#00007F] p-2 sm:p-3 px-3 sm:px-4 w-full rounded-[4px] py-2 sm:py-3 mt-2"
                  />
                </div>
                <div className="p-2">
                  <span className="font-[poppins] font-medium text-[20px] text-[#00007F]">
                    Topic <span className="text-[#EC5F70]">*</span>
                  </span>
                  <br />
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Topic (eg: Intro to Python)"
                    className="border border-[#00007F] p-2 sm:p-3 px-3 sm:px-4 w-full rounded-[4px] py-2 sm:py-3 mt-2"
                  />
                </div>
                <div className="p-2">
                  <span className="font-[poppins] font-medium text-[20px] text-[#00007F]">
                    Sub topics <span className="text-[#EC5F70]">*</span>
                  </span>
                  <br />
                  <input
                    id="subTopic"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleAddSubTopicToList(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    placeholder="Press Enter to Add"
                    className="border border-[#00007F] p-2 sm:p-3 px-3 sm:px-4 w-full rounded-[4px] py-2 sm:py-3 mt-2"
                  />
                </div>
                <div className="flex py-2 sm:py-[9px] items-end w-full h-full">
                  <button
                    onClick={handleAddTopic}
                    className={`w-full h-[40px] sm:h-[50px] rounded-[8px] text-white font-[inter] text-[16px] ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#00007F]'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : '+ Add'}
                  </button>
                </div>
              </div>
              {subTopics.length > 0 && (
                <div className="p-2">
                  <h4 className="font-[poppins] font-medium text-[20px] text-[#00007F] mb-2">
                    Subtopics:
                  </h4>
                  <ul className="list-disc list-inside text-[#181D27]">
                    {subTopics.map((subTopic, index) => (
                      <li key={index}>{subTopic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full p-4 sm:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] pt-6 sm:pt-9 gap-6 sm:gap-10 p-3 sm:p-5">
              <div className="space-y-6 sm:space-y-10">
                <div className="flex justify-center gap-2 sm:gap-4 items-center">
                  <button
                    onClick={() => setShowExcelUploadTab(false)}
                    className="flex items-center w-fit rounded-[6px] p-2 px-3 gap-2 bg-[#8D8D8D] text-white"
                  >
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.4545 9.93431C12.7404 9.93431 14.5935 8.0812 14.5935 5.79528C14.5935 3.50936 12.7404 1.65625 10.4545 1.65625C8.16854 1.65625 6.31543 3.50936 6.31543 5.79528C6.31543 8.0812 8.16854 9.93431 10.4545 9.93431Z"
                        stroke="white"
                        strokeWidth="2.06952"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.5655 19.0388C17.5655 15.8352 14.3784 13.2441 10.4546 13.2441C6.5308 13.2441 3.34375 15.8352 3.34375 19.0388"
                        stroke="white"
                        strokeWidth="2.06952"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <h2 className="font-[poppins] font-medium text-[14px] text-center">
                      Manual Entry
                    </h2>
                  </button>
                  <button
                    onClick={() => setShowExcelUploadTab(true)}
                    className="flex items-center w-fit rounded-[6px] p-2 px-3 gap-2 bg-[#00007F] text-white"
                  >
                    <svg
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.3174 13.6586V9.51953"
                        stroke="white"
                        strokeWidth="2.06952"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.3373 11.5898H8.19824"
                        stroke="white"
                        strokeWidth="2.06952"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.5454 9.10651V14.0733C18.5454 17.3846 17.7176 18.2124 14.4063 18.2124H6.12829C2.81706 18.2124 1.98926 17.3846 1.98926 14.0733V5.79528C1.98926 2.48406 2.81706 1.65625 6.12829 1.65625H7.37C8.61171 1.65625 8.88488 2.02048 9.35673 2.64962L10.5984 4.30523C10.913 4.71913 11.0951 4.96747 11.9229 4.96747H14.4063C17.7176 4.96747 18.5454 5.79528 18.5454 9.10651Z"
                        stroke="white"
                        strokeWidth="2.06952"
                        strokeMiterlimit="10"
                      />
                    </svg>
                    <h2 className="font-[poppins] font-medium text-[14px] text-center">
                      Excel Upload
                    </h2>
                  </button>
                </div>
                <div className="w-full bg-white p-4 sm:p-5 rounded-[20px]">
                  <div className="flex justify-center p-3 sm:p-4 pb-4 sm:pb-6">
                    <div className="flex items-center justify-center bg-[#00007F] w-full sm:w-[50%] pb-3 rounded-[6px] p-2 px-3 gap-2">
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.6397 9.26562C20.2397 9.57563 21.7097 11.4256 21.7097 15.4756V15.6056C21.7097 20.0756 19.9197 21.8656 15.4497 21.8656H8.93969C4.46969 21.8656 2.67969 20.0756 2.67969 15.6056V15.4756C2.67969 11.4556 4.12969 9.60563 7.66969 9.27563"
                          stroke="#FDFDFD"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.1992 2.36523V15.2452"
                          stroke="#FDFDFD"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M15.5496 13.0156L12.1996 16.3656L8.84961 13.0156"
                          stroke="#FDFDFD"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <h2
                        className="font-[poppins] font-medium text-[14px] text-center text-white cursor-pointer"
                        onClick={handleDownloadTemplate}
                      >
                        Download Template
                      </h2>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <svg
                        width="29"
                        height="30"
                        viewBox="0 0 29 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M25.1996 8.86719V20.8672C25.1996 24.4672 23.3996 26.8672 19.1996 26.8672H9.59961C5.39961 26.8672 3.59961 24.4672 3.59961 20.8672V8.86719C3.59961 5.26719 5.39961 2.86719 9.59961 2.86719H19.1996C23.3996 2.86719 25.1996 5.26719 25.1996 8.86719Z"
                          stroke="#535862"
                          strokeWidth="1.8"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.4004 5.86719V8.26719C17.4004 9.58719 18.4804 10.6672 19.8004 10.6672H22.2004"
                          stroke="#535862"
                          strokeWidth="1.8"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.59961 16.0664H14.3996"
                          stroke="#535862"
                          strokeWidth="1.8"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.59961 20.8672H19.1996"
                          stroke="#535862"
                          strokeWidth="1.8"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <h2 className="text-gray-600 text-[18px] sm:text-[21px] font-semibold font-[inter]">
                        Upload Excel
                      </h2>
                    </div>
                    <div className="flex flex-col items-center gap-4 pt-4 sm:pt-5 pb-3 sm:pb-4">
                      <div className="w-full">
                        <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-500 cursor-pointer hover:border-gray-400 transition">
                          <svg
                            width="30"
                            height="29"
                            viewBox="0 0 30 29"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2"
                          >
                            <path
                              d="M11.6002 26.5664H9.2002C4.4002 26.5664 3.2002 25.3664 3.2002 20.5664V8.56641C3.2002 3.76641 4.4002 2.56641 9.2002 2.56641H11.0002C12.8002 2.56641 13.1962 3.09442 13.8802 4.00642L15.6802 6.40642C16.1362 7.00642 16.4002 7.36641 17.6002 7.36641H21.2002C26.0002 7.36641 27.2002 8.56641 27.2002 13.3664V15.7664"
                              stroke="#717680"
                              strokeWidth="1.8"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M17.3113 22.1505C14.4913 22.3545 14.4913 26.4345 17.3113 26.6385H23.9833C24.7873 26.6385 25.5793 26.3385 26.1673 25.7985C28.1473 24.0705 27.0913 20.6145 24.4873 20.2905C23.5513 14.6625 15.4153 16.7985 17.3353 22.1625"
                              stroke="#717680"
                              strokeWidth="1.8"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Choose file</span>
                          <input
                            id="excelUpload"
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleExcelUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <button
                        onClick={handleSubmitExcel}
                        className={`bg-[#00007F] text-white font-semibold py-2 w-full justify-center px-6 rounded-md flex items-center gap-2 ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#00007F]'
                        }`}
                        disabled={isSubmitting}
                      >
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.6407 9.46484C20.2407 9.77484 21.7107 11.6248 21.7107 15.6748V15.8048C21.7107 20.2748 19.9207 22.0648 15.4507 22.0648H8.94066C4.47066 22.0648 2.68066 20.2748 2.68066 15.8048V15.6748C2.68066 11.6548 4.13066 9.80484 7.67066 9.47484"
                            stroke="#FDFDFD"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.2002 15.5675V4.1875"
                            stroke="#FDFDFD"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15.5506 6.41641L12.2006 3.06641L8.85059 6.41641"
                            stroke="#FDFDFD"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {isSubmitting ? 'Submitting...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="p-4">
                  <img
                    src="/sframes.png"
                    alt="Curriculum Preview"
                    width={560}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!showExcelUploadTab && showTable && curriculumData.length > 0 && (
          <div
            className="p-2 w-full bg-white rounded-[12px] sm:rounded-[20px]"
            style={{ boxShadow: '0px 2px 10px 0px #B3BAF7' }}
          >
            <div className="p-2 pt-3 sm:pt-4">
              <h2 className="font-[poppins] font-semibold text-[24px] text-[#00007F]">
                Curriculum Data
              </h2>
            </div>
            <div className="p-2">
              <h2 className="font-[poppins] font-medium text-[20px] top-level text-[#00007F] pb-2">
                Filter by Subject
              </h2>
              <select
                id="filterSubject"
                value={filterSubject}
                onChange={e => handleFilterChange(e.target.value)}
                className="border rounded-[4px] border-[#00007F] w-full p-2 sm:p-3"
              >
                <option value="">Show All Subjects</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-2 sm:p-4">
              {/* Desktop/Table View */}
              <div
                className="hidden md:block max-h-[60vh] overflow-y-auto"
                style={{ boxShadow: '0px 2px 10px 0px #B3BAF7' }}
              >
                <div className="grid grid-cols-4 bg-[#00007F] text-white text-[18px] font-[inter] font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-t-[12px] sticky top-0 z-10">
                  <div>Subject</div>
                  <div>Day Order</div>
                  <div>Topic</div>
                  <div>SubTopics</div>
                </div>
                {filteredData.map((data, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-4 px-3 sm:px-4 items-center border py-1 sm:py-2 text-[#181D27] font-[inter] font-medium text-[16px] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    <div>{data.subject}</div>
                    <div>{data.DayOrder}</div>
                    <div>{data.Topics}</div>
                    <div>
                      <ul className="list-disc list-inside">
                        {(data.SubTopics || []).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile/Tablet View */}
              <div className="md:hidden space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                {filteredData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white shadow rounded-lg p-3 sm:p-4 border border-gray-200"
                  >
                    <p className="text-sm font-semibold text-gray-700">
                      <span className="block text-[#00007F]">
                        Subject:{' '}
                        <span className="text-gray-700">{data.subject}</span>
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      <span className="block text-[#00007F]">
                        Day Order:{' '}
                        <span className="text-gray-700">{data.DayOrder}</span>
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      <span className="block text-[#00007F]">
                        Topic:{' '}
                        <span className="text-gray-700">{data.Topics}</span>
                      </span>
                    </p>
                    <div className="text-sm font-semibold text-gray-700">
                      <span className="block text-[#00007F]">SubTopics:</span>
                      <ul className="list-disc list-inside">
                        {(data.SubTopics || []).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurriculumManagement;
