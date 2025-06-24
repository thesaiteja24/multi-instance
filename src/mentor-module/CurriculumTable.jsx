import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoIosArrowDown } from 'react-icons/io';
import './CurriculumTable.css';

const CurriculumTable = ({ subject, batch, mentorId }) => {
  const [tableData, setTableData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedFields, setSubmittedFields] = useState({});
  const [submittingRows, setSubmittingRows] = useState({});

  useEffect(() => {
    if (subject && batch && mentorId) {
      // Reset submittedFields when batch changes
      setSubmittedFields({});
      fetchCurriculumTable();
    }
  }, [subject, batch, mentorId]);

  const fetchCurriculumTable = async () => {
    try {
      setLoading(true);
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/mentorsyllabus?mentorId=${mentorId}&subject=${subject}&batch=${batch}`;
      const response = await axios.get(url);
      setTableData(response.data);
      setEditedData(JSON.parse(JSON.stringify(response.data)));
      // Initialize submittedFields for new data
      setSubmittedFields(prevSubmitted => {
        const newSubmitted = { ...prevSubmitted };
        Object.keys(response.data).forEach(key => {
          if (!newSubmitted.hasOwnProperty(key)) {
            newSubmitted[key] = { subtopics: false, videoUrl: false };
          }
        });
        return newSubmitted;
      });
    } catch (error) {
      toast.error('Error fetching curriculum table.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicChange = (rowId, tag) => {
    setEditedData(prevData => ({
      ...prevData,
      [rowId]: {
        ...prevData[rowId],
        SubTopics: prevData[rowId].SubTopics.map(sub =>
          sub.tag === tag &&
          tableData[rowId]?.SubTopics.find(s => s.tag === tag)?.status !==
            'true'
            ? { ...sub, status: sub.status === 'false' ? 'true' : 'false' }
            : sub
        ),
      },
    }));
  };

  const handleVideoUrlChange = (rowId, value) => {
    setEditedData(prevData => ({
      ...prevData,
      [rowId]: { ...prevData[rowId], videoUrl: value },
    }));
  };

  const isValidVideoUrl = url => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|drive\.google\.com\/file\/d\/)[\w-]+/;
    return regex.test(url.trim());
  };

  const handleRowSubmit = async rowId => {
    const originalRow = tableData[rowId];
    const currentRow = editedData[rowId];
    if (!originalRow || !currentRow) {
      toast.error('Row data is missing.');
      return;
    }
    const subtopicsChanged = originalRow.SubTopics.some((sub, i) => {
      return sub.status !== currentRow.SubTopics[i].status;
    });
    const videoUrlChanged = originalRow.videoUrl !== currentRow.videoUrl;

    const pendingSubtopics =
      subtopicsChanged && !submittedFields[rowId]?.subtopics;
    const pendingVideoUrl =
      videoUrlChanged && !submittedFields[rowId]?.videoUrl;

    if (
      pendingVideoUrl &&
      (!currentRow.videoUrl || !isValidVideoUrl(currentRow.videoUrl))
    ) {
      toast.info('Please enter a valid Google Drive/YouTube video URL.');
      return;
    }

    if (!pendingSubtopics && !pendingVideoUrl) {
      toast.error('No pending changes to submit.');
      return;
    }

    const payload = {
      mentorId,
      subject,
      batch,
      data: { [rowId]: currentRow },
    };

    setSubmittingRows(prev => ({ ...prev, [rowId]: true }));

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentorsyllabus`;
      const response = await axios.post(url, payload);
      if (response.data?.warning) {
        toast.warn(response.data.warning, {
          autoClose: false,
          closeOnClick: true,
          closeButton: true,
          style: { width: '500px', whiteSpace: 'pre-wrap' },
        });
      }
      toast.success(response.data.message || 'Row updated successfully.');
      setSubmittedFields(prev => ({
        ...prev,
        [rowId]: {
          subtopics: pendingSubtopics ? true : prev[rowId]?.subtopics,
          videoUrl: pendingVideoUrl ? true : prev[rowId]?.videoUrl,
        },
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Error submitting row. Please try again.'
      );
    } finally {
      await fetchCurriculumTable();
      setSubmittingRows(prev => ({ ...prev, [rowId]: false }));
    }
  };

  return (
    <div className="w-full px-4 py-6 font-[inter]">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#00007F]"></div>
        </div>
      ) : (
        <div>
          {Object.keys(editedData).length > 0 ? (
            <div className="mt-10 w-full overflow-x-auto rounded-[20px] shadow-md border border-gray-200">
              <div className="min-w-[1174px]">
                <table className="w-full table-fixed border-collapse scrollbar-custom">
                  <thead className="bg-[#00007F] text-white text-[16px] sm:text-[18px] font-bold block w-full">
                    <tr className="w-full flex">
                      <th className="w-[150px] py-4 text-left pl-3 rounded-tl-[20px]">
                        Day Order
                      </th>
                      <th className="w-[300px] py-4 text-left pl-3">Topic</th>
                      <th className="w-[550px] py-4 text-left pl-3">
                        Topics to Cover
                      </th>
                      <th className="w-[344px] py-4 text-left pl-3">
                        Video URL
                      </th>
                      <th className="w-[150px] py-4 text-left pl-3 rounded-tr-[20px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="block max-h-[500px] overflow-y-scroll custom-scroll w-full">
                    {Object.entries(editedData).map(
                      ([id, item], index, arr) => {
                        const originalRow = tableData[id];
                        let subtopicsChanged = false;
                        let videoUrlChanged = false;
                        if (originalRow) {
                          subtopicsChanged = originalRow.SubTopics.some(
                            (sub, i) => {
                              return sub.status !== item.SubTopics[i].status;
                            }
                          );
                          videoUrlChanged =
                            originalRow.videoUrl !== item.videoUrl;
                        }
                        const pendingSubtopics =
                          subtopicsChanged && !submittedFields[id]?.subtopics;
                        const pendingVideoUrl =
                          videoUrlChanged && !submittedFields[id]?.videoUrl;
                        const isPending = pendingSubtopics || pendingVideoUrl;
                        const rowSubmitting = submittingRows[id];
                        const rowComplete =
                          tableData[id]?.videoUrl &&
                          tableData[id].videoUrl === item.videoUrl &&
                          item.SubTopics.every(sub => sub.status === 'true');

                        return (
                          <tr
                            key={id}
                            className={`flex w-full border-t ${
                              index % 2 === 0 ? 'bg-white' : 'bg-[#EFF0F7]'
                            } text-[#000000] text-[14px] sm:text-[16px] font-medium ${
                              index === arr.length - 1 ? 'rounded-b-[20px]' : ''
                            }`}
                          >
                            <td className="w-[150px] py-4 px-4">
                              Class {index + 1}
                            </td>
                            <td className="w-[300px] px-4 py-4">
                              {item.Topics}
                            </td>
                            <td className="w-[550px] px-4 py-4">
                              <ul className="list-none space-y-1">
                                {item.SubTopics.sort((a, b) => {
                                  const parseTag = tag => {
                                    const match = tag.match(/Day-(\d+):(\d+)/);
                                    if (match) {
                                      return {
                                        day: parseInt(match[1], 10),
                                        id: parseInt(match[2], 10),
                                      };
                                    }
                                    return { day: 0, id: 0 };
                                  };
                                  const aInfo = parseTag(a.tag || '');
                                  const bInfo = parseTag(b.tag || '');
                                  if (aInfo.day !== bInfo.day) {
                                    return aInfo.day - bInfo.day;
                                  }
                                  return aInfo.id - bInfo.id;
                                }).map((sub, subIndex) => (
                                  <li
                                    key={subIndex}
                                    className={
                                      'Day-' + (index + 1) !==
                                      (sub.tag.match(/(Day-\d+)/)?.[0] || '')
                                        ? 'text-red-500'
                                        : ''
                                    }
                                  >
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        className="mr-2 accent-[#00007F]"
                                        checked={sub.status === 'true'}
                                        disabled={
                                          tableData[id]?.SubTopics.find(
                                            s => s.tag === sub.tag
                                          )?.status === 'true' ||
                                          submittedFields[id]?.subtopics
                                        }
                                        onChange={() =>
                                          handleSubtopicChange(id, sub.tag)
                                        }
                                      />
                                      {sub.title}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="w-[344px] px-4 py-4">
                              {rowComplete ? (
                                <a
                                  href={item.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {item.videoUrl}
                                </a>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Enter video URL"
                                  value={item.videoUrl || ''}
                                  onChange={e =>
                                    handleVideoUrlChange(id, e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-[#00007F] rounded-md bg-[#E0E4FE] text-[#00007F] focus:outline-none"
                                />
                              )}
                            </td>
                            <td className="w-[150px] px-4 py-4">
                              <button
                                disabled={
                                  loading || !isPending || rowSubmitting
                                }
                                onClick={() => handleRowSubmit(id)}
                                className={`w-[100px] h-[36px] text-white text-sm font-semibold rounded-md transition ${
                                  !loading && isPending && !rowSubmitting
                                    ? 'bg-[#00007F] hover:bg-blue-900'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {rowSubmitting ? 'Submitting' : 'Submit'}
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-center text-gray-500">
              No curriculum data available.
            </p>
          )}
        </div>
      )}
      <style>
        {`
          .custom-scroll::-webkit-scrollbar {
            width: 6.84px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background-color: #D9D9D9;
            border-radius: 10px;
          }
        `}
      </style>
    </div>
  );
};

export default CurriculumTable;
