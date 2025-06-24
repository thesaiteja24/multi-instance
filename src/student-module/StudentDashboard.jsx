import React, { useState, useEffect, Suspense } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateProfilePicture,
  fetchResume,
  uploadResume,
} from '../reducers/studentSlice.js';
import { getResumeScore } from '../services/studentService.js';
import { setEdit } from '../reducers/editslice.js';
import { AiOutlineEye } from 'react-icons/ai';
import { FaUserCircle, FaEdit, FaMoneyCheckAlt } from 'react-icons/fa';
import Modal from 'react-modal';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import AtsResult from './AtsResult.jsx';
import EditProfile from './EditProfile.jsx';
import Cameraicon from './CameraIcon.jsx';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import CustomScaleLoader from '../ui/CustomScaleLoader.jsx';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

Modal.setAppElement('#root');

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const {
    studentDetails,
    profilePicture,
    resumeUrl,
    loading,
    error,
    resumeLoading,
    resumeError,
  } = useSelector(state => state.student);
  const { userInfo } = useSelector(state => state.auth);
  const { id } = userInfo;
  const { edit } = useSelector(state => state.editslice);
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [resumeScore, setResumeScore] = useState(null);
  const [resumeScoreData, setResumeScoreData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [feesModalOpen, setFeesModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  const pdfPlugin = defaultLayoutPlugin();
  const resumeId = id;

  // Fetch resume on mount
  useEffect(() => {
    if (studentDetails?.studentId && resumeId) {
      dispatch(fetchResume(resumeId));
    }
  }, [dispatch, studentDetails, resumeId]);

  // Handle profile picture change
  const handleProfilePicChange = async e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!studentDetails?.studentId) {
      Swal.fire({
        icon: 'error',
        title: 'Student ID Missing',
        text: 'Please wait for student details to load.',
      });
      return;
    }
    if (file) {
      if (file.size > 20 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload an image smaller than 20KB.',
        });
        return;
      }
      if (
        !file.type.includes('image/png') &&
        !file.type.includes('image/jpeg')
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload a PNG or JPEG image.',
        });
        return;
      }
      setSelectedProfilePic(file);
      setUploadingPic(true);
      try {
        await dispatch(
          updateProfilePicture({
            studentId: studentDetails.studentId,
            newFile: file,
          })
        ).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Profile Picture Updated!',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text:
            error.message ||
            'There was an issue updating your profile picture.',
        });
      } finally {
        setUploadingPic(false);
        setSelectedProfilePic(null);
      }
    }
  };

  // Update Resume
  const updateResumeHandler = async e => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please select a file before submitting.',
      });
      return;
    }
    if (!file.type.includes('application/pdf')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a PDF file.',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Please upload a file smaller than 5 MB.',
      });
      return;
    }
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Student ID Missing',
        text: 'Unable to retrieve student ID.',
      });
      return;
    }

    try {
      await dispatch(uploadResume({ studentId: id, file })).unwrap();

      toast.success('Resume updated successfully 🎉', { autoClose: 3000 });

      // clear <input type="file"> value and local state
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
    } catch (err) {
      toast.error(
        err?.message ||
          'There was an issue updating your resume. Please try again later.',
        { autoClose: 4000 }
      );
    }
  };

  // Fetch Resume Score
  const getResumeScoreHandler = async () => {
    if (!studentDetails?.studentId) {
      Swal.fire({
        icon: 'error',
        title: 'Student ID Missing',
        text: 'Your student ID is not available. Please try again later.',
      });
      return;
    }

    setScoreLoading(true);
    try {
      const data = await getResumeScore(resumeId);
      const score = data.ats_score;
      setResumeScore(score);
      setResumeScoreData(data);
      setScoreModalOpen(true);

      Swal.fire({
        title: 'Resume Score Retrieved',
        text: `Your ATS Resume Score is ${score}/100`,
        icon: 'success',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Retrieve Score',
        text:
          error.message ||
          'There was an issue fetching your resume score. Please try again later.',
      });
    } finally {
      setScoreLoading(false);
    }
  };

  // Handle profile picture upload errors
  useEffect(() => {
    if (
      error &&
      selectedProfilePic &&
      !error.includes('401') &&
      !error.includes('403')
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error,
      });
      setSelectedProfilePic(null);
      setUploadingPic(false);
    }
  }, [error, selectedProfilePic]);

  // Sync uploading state
  useEffect(() => {
    setUploadingPic(loading && selectedProfilePic);
  }, [loading, selectedProfilePic]);

  // Cleanup resume URL
  useEffect(() => {
    return () => {
      if (resumeUrl) {
        URL.revokeObjectURL(resumeUrl);
      }
    };
  }, [resumeUrl]);

  // Loading or Edit mode
  if (loading && !selectedProfilePic) {
    return <CustomScaleLoader />;
  }
  if (
    error &&
    !error.includes('401') &&
    !error.includes('403') &&
    !selectedProfilePic
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-[1.125rem]">{error}</p>
      </div>
    );
  }
  if (edit) {
    return <EditProfile />;
  }

  const hasFeesDetails =
    studentDetails &&
    (studentDetails.total ||
      studentDetails.paidamount ||
      studentDetails.balance ||
      studentDetails.duedate ||
      studentDetails.invoiceURL);

  return (
    <ErrorBoundary>
      <div className="mt-0 lg:px-[2rem] px-[1.25rem] py-[1.25rem] flex flex-col font-[inter] relative">
        {/* MAIN CARD */}
        <div className="bg-white rounded-[1.4375rem] shadow-[0_0.25rem_0.25rem_rgba(0,0,0,0.25)] w-full mx-auto p-[1rem] ml-[0.5rem] sm:p-[1.5rem] relative">
          <div className="grid grid-cols-1 xl:grid-cols-[20%_35%_30%_10%] gap-[1rem] w-full">
            {/* Profile Section */}
            <div className="relative flex flex-col items-center justify-center border-b-[0.125rem] xl:border-b-0 xl:border-r-[0.125rem] border-[#E7E7E7] py-[1rem]">
              <button
                onClick={() => dispatch(setEdit(true))}
                className="absolute top-[0.5rem] right-[0.5rem] xl:hidden w-[4.375rem] h-[1.8125rem] bg-[var(--color-secondary)] text-white text-[0.875rem] font-medium rounded-[0.5rem] shadow-md hover:shadow-lg transition-transform hover:scale-105 flex items-center justify-center z-10"
              >
                <FaEdit className="mr-[0.25rem]" /> Edit
              </button>

              <div className="relative w-[8rem] h-[8rem] sm:w-[9.3125rem] sm:h-[9.3125rem]">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    onClick={() => setProfileModalOpen(true)}
                    className="rounded-full object-cover w-full h-full cursor-pointer transition-transform hover:scale-105"
                  />
                ) : (
                  <div
                    onClick={() => setProfileModalOpen(true)}
                    className="bg-[#D9D9D9] w-full h-full rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <FaUserCircle className="text-gray-300 w-3/4 h-3/4" />
                  </div>
                )}
                <label
                  htmlFor="profilePicInput"
                  className="absolute bottom-0 right-0 text-white rounded-full p-[0.5rem] cursor-pointer"
                >
                  {uploadingPic ? (
                    <span className="text-[0.75rem]">Uploading...</span>
                  ) : (
                    <Cameraicon className="w-[1.25rem] h-[1.25rem]" />
                  )}
                </label>
                <input
                  type="file"
                  id="profilePicInput"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  disabled={uploadingPic}
                />
              </div>
              <div className="text-center mt-[1rem]">
                <p className="text-[1.25rem] sm:text-[1.5rem] leading-tight font-semibold text-black">
                  {studentDetails?.name || 'Full Name'}
                </p>
                <p className="text-[0.875rem] sm:text-[0.875rem] font-medium text-black">
                  ID: {studentDetails?.studentId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="xl:contents">
              <div className="flex flex-col xl:contents items-start sm:flex-row sm:items-center gap-[1rem] w-full sm:col-span-3"></div>

              {/* Personal Information */}
              <div className="space-y-[1rem] p-0 sm:p-[1.25rem]">
                <div className="text-[1.125rem] sm:text-[1.25rem] font-bold text-[var(--color-secondary)] flex items-center gap-[0.5rem]">
                  <img
                    src="/studentProfile/personalinfo.svg"
                    alt="personal"
                    className="w-[1.5rem] h-[1.5rem]"
                  />
                  <span>Personal Information</span>
                </div>
                <table className="text-black text-[0.75rem] sm:text-[0.875rem] w-full leading-[1.25rem] xl:leading-[1.75rem] 2xl:leading-[2rem]">
                  <tbody>
                    {[
                      { label: 'Student ID', value: studentDetails?.studentId },
                      { label: 'Batch No', value: studentDetails?.BatchNo },
                      { label: 'Email ID', value: studentDetails?.email },
                      { label: 'Age', value: studentDetails?.age },
                      { label: 'State', value: studentDetails?.state },
                      {
                        label: 'Phone',
                        value: studentDetails?.studentPhNumber,
                      },
                      {
                        label: 'Parent No',
                        value: studentDetails?.parentNumber,
                      },
                      {
                        label: 'Github',
                        value: studentDetails?.githubLink ? (
                          <a
                            href={studentDetails.githubLink}
                            className="text-blue-500 hover:underline break-all"
                          >
                            {studentDetails.githubLink}
                          </a>
                        ) : (
                          'N/A'
                        ),
                      },
                      {
                        label: 'Skills',
                        value: studentDetails?.studentSkills?.length
                          ? studentDetails.studentSkills.join(', ')
                          : 'N/A',
                      },
                      ...(studentDetails?.arrears === 'true'
                        ? [
                            { label: 'Arrears', value: 'Yes' },
                            {
                              label: 'Arrears Count',
                              value: studentDetails?.ArrearsCount,
                            },
                          ]
                        : []),
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="font-semibold pr-[0.5rem] py-[0.25rem] sm:pr-[0.75rem] sm:py-[0.5rem] w-1/3">
                          {item.label}
                        </td>
                        <td className="pr-[0.5rem] py-[0.25rem] sm:pr-[0.75rem] sm:py-[0.5rem]">
                          :
                        </td>
                        <td className="py-[0.25rem] sm:py-[0.5rem] break-words">
                          {item.value || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Academic Information */}
              <div className="space-y-[1rem] p-0 sm:p-[1.25rem]">
                <div className="text-[1.125rem] sm:text-[1.25rem] font-bold text-[var(--color-secondary)] flex items-center gap-[0.5rem]">
                  <img
                    src="/studentProfile/academic.svg"
                    alt="academic"
                    className="w-[1.5rem] h-[1.5rem]"
                  />
                  <span>Academic Information</span>
                </div>
                <table className="text-black text-[0.75rem] sm:text-[0.875rem] w-full leading-[1.25rem] xl:leading-[1.75rem] 2xl:leading-[2rem]">
                  <tbody>
                    {[
                      { label: 'College', value: studentDetails?.collegeName },
                      { label: 'USN', value: studentDetails?.collegeUSNNumber },
                      {
                        label: 'Department',
                        value: studentDetails?.department,
                      },
                      {
                        label: 'Qualification',
                        value: studentDetails?.qualification,
                      },
                      {
                        label: '10th Percentage',
                        value: studentDetails?.tenthStandard,
                        suffix: '%',
                      },
                      {
                        label: '12th Percentage',
                        value: studentDetails?.twelfthStandard,
                        suffix: '%',
                      },
                      {
                        label: 'Graduation %',
                        value: studentDetails?.highestGraduationpercentage,
                        suffix: '%',
                      },
                      {
                        label: 'Passout Year',
                        value: studentDetails?.yearOfPassing,
                      },
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="font-semibold pr-[0.5rem] py-[0.25rem] sm:pr-[0.75rem] sm:py-[0.5rem] w-1/3 inline-block text-nowrap">
                          {item.label}
                        </td>
                        <td className="pr-[0.5rem] py-[0.25rem] sm:pr-[0.75rem] sm:py-[0.5rem]">
                          :
                        </td>
                        <td className="py-[0.25rem] sm:py-[0.5rem] break-words">
                          {item.value
                            ? `${item.value}${item.suffix || ''}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Buttons Section */}
              <div className="flex flex-col justify-between items-end sm:items-end p-0 sm:p-[1.25rem] space-y-[1rem]">
                <button
                  onClick={() => dispatch(setEdit(true))}
                  className="hidden xl:flex w-[4.375rem] h-[1.8125rem] bg-[var(--color-primary)] text-white text-[1rem] font-medium rounded-[0.5rem] shadow-md hover:shadow-lg transition-transform hover:scale-105 items-center justify-center"
                >
                  <FaEdit className="mr-[0.25rem]" /> Edit
                </button>
                {hasFeesDetails && (
                  <button
                    onClick={() => setFeesModalOpen(true)}
                    className="bg-[var(--color-secondary)] w-[7.5rem] text-white text-[0.75rem] font-medium rounded-[0.5rem] px-[1rem] py-[0.5rem] shadow-md hover:shadow-lg transition-transform hover:scale-105 flex items-center justify-end"
                  >
                    <FaMoneyCheckAlt size={'1rem'} className="mr-[0.5rem]" />{' '}
                    Fee Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-[35%_65%] gap-[1.5rem] w-full mx-auto px-[0.25rem] py-[1.5rem]">
          {/* Upload Resume */}
          <div className="bg-white rounded-[1.4375rem] shadow-[0_0.25rem_0.25rem_rgba(0,0,0,0.25)] p-[1.25rem] flex flex-col w-full min-h-[8.9375rem]">
            <div className="flex items-center gap-[0.5rem] mb-[1rem] flex-shrink-0">
              <svg
                width="1.5625rem"
                height="1.5625rem"
                viewBox="0 0 28 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 0H19.3107L28 8.379V33H0V0ZM24.2449 9L18.6667 3.621V9H24.2449ZM15.5556 3H3.11111V30H24.8889V12H15.5556V3ZM6.22222 16.5H21.7778V19.5H6.22222V16.5ZM6.22222 22.5H21.7778V25.5H6.22222V22.5Z"
                  fill="#00007F"
                />
              </svg>
              <h3 className="text-[1.125rem] font-semibold text-[var(--color-secondary)]">
                Upload Resume
              </h3>
            </div>
            <form
              onSubmit={updateResumeHandler}
              className="flex flex-col xl:flex-row"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="flex-1 text-[0.875rem] text-gray-700 border xl:w-[0.625rem] border-gray-200 shadow-lg bg-[#EFEFEF] p-[0.5rem] cursor-pointer"
                onChange={e => setFile(e.target.files[0])}
              />
              <button
                type="submit"
                disabled={resumeLoading}
                className={`flex items-center  rounded-[0.25rem] justify-center gap-[0.5rem] bg-[var(--color-secondary)] text-white px-[0.5rem] py-[0.5rem] shadow-md hover:shadow-lg transition-transform hover:scale-105 ${
                  resumeLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg
                  width="1.0625rem"
                  height="1.125rem"
                  viewBox="0 0 17 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.43039 13.6517V5.01979L4.67665 7.77352L3.19387 6.23779L8.48952 0.942139L13.7852 6.23779L12.3024 7.77352L9.54865 5.01979V13.6517H7.43039ZM2.13474 17.8882C1.55222 17.8882 1.05372 17.681 0.639247 17.2665C0.224775 16.852 0.0171856 16.3532 0.0164795 15.77V12.5926H2.13474V15.77H14.8443V12.5926H16.9626V15.77C16.9626 16.3525 16.7553 16.8513 16.3408 17.2665C15.9264 17.6817 15.4275 17.8889 14.8443 17.8882H2.13474Z"
                    fill="white"
                  />
                </svg>
                {resumeLoading ? 'Updating...' : 'Upload'}
              </button>
            </form>
          </div>

          {/* Resume + Score */}
          <div className="flex flex-col xl:flex-row w-full bg-white shadow-[0_0.25rem_0.25rem_rgba(0,0,0,0.25)] border rounded-[1.4375rem] min-h-[8.9375rem]">
            <div className="flex flex-col items-center justify-center p-[1rem] md:flex-row md:gap-[1.25rem] flex-grow xl:basis-2/3">
              <div className="flex gap-[0.5rem] items-center">
                <svg
                  width="1.5625rem"
                  height="1.5625rem"
                  viewBox="0 0 28 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 0H19.3107L28 8.379V33H0V0ZM24.2449 9L18.6667 3.621V9H24.2449ZM15.5556 3H3.11111V30H24.8889V12H15.5556V3ZM6.22222 16.5H21.7778V19.5H6.22222V16.5ZM6.22222 22.5H21.7778V25.5H6.22222V22.5Z"
                    fill="#00007F"
                  />
                </svg>
                <h3 className="text-[1.3125rem] font-semibold text-[var(--color-secondary)]">
                  Your Resume
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-[0.5rem] h-min mt-[0.75rem] md:mt-0 w-full sm:w-auto">
                <button
                  onClick={() => setModalIsOpen(true)}
                  disabled={!resumeUrl || resumeLoading}
                  className={`flex items-center justify-between gap-[0.5rem] w-full sm:flex-1 border border-[var(--color-primary)] text-[var(--color-secondary)] text-[0.9375rem] font-medium px-[1rem] py-[0.5rem] rounded-[0.5rem] hover:bg-[var(--color-secondary)] hover:text-white transition-transform hover:scale-105 ${
                    !resumeUrl || resumeLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <span>{resumeLoading ? 'Loading...' : 'View Resume'}</span>
                  <AiOutlineEye size={'1.25rem'} />
                </button>
                <button
                  disabled={true}
                  onClick={getResumeScoreHandler}
                  className={`flex  items-center justify-between w-full gap-[0.5rem] sm:flex-1 border border-[#19216f] text-[var(--color-secondary)] text-[0.9375rem] text-nowrap font-medium px-[1rem] py-[0.5rem] rounded-[0.5rem] hover:bg-[var(--color-secondary)] hover:text-white transition-transform hover:scale-105 ${
                    scoreLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>
                    {scoreLoading ? 'Fetching...' : 'View Resume Score'}
                  </span>
                  <AiOutlineEye size={'1.25rem'} />
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-secondary)] text-white p-[1rem] flex flex-col items-center justify-center flex-grow xl:basis-1/3 xl:rounded-r-[1.4375rem]">
              <span className="font-semibold text-[1.125rem]">
                ATS Resume Score
              </span>
              <span className="text-[0.875rem] font-bold text-center">
                {resumeScore !== null
                  ? `${resumeScore}/100`
                  : 'Check Your Resume Score'}
              </span>
            </div>
          </div>
        </div>

        {/* Resume Preview Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-[1.5rem] rounded-[0.5rem] shadow-xl max-w-[64rem] w-full mx-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="flex justify-between items-center mb-[1rem]">
            <h2 className="text-[1.125rem] font-semibold text-gray-700">
              Resume Preview
            </h2>
            <button
              onClick={() => setModalIsOpen(false)}
              className="text-red-500 text-[1.25rem] font-bold"
            >
              ✖
            </button>
          </div>
          <div
            className="h-[70vh] overflow-auto border rounded-[0.5rem] shadow-lg"
            style={{ maxHeight: '70vh' }}
          >
            <Suspense fallback={<p>Loading PDF viewer...</p>}>
              {resumeUrl ? (
                <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
                  <Viewer fileUrl={resumeUrl} plugins={[pdfPlugin]} />
                </Worker>
              ) : (
                <p className="text-center text-gray-500 text-[1rem]">
                  No resume available to display.
                </p>
              )}
            </Suspense>
          </div>
        </Modal>

        {/* Resume Score Modal */}
        <Modal
          isOpen={scoreModalOpen}
          onRequestClose={() => setScoreModalOpen(false)}
          className="bg-white p-[2rem] rounded-[0.75rem] shadow-2xl max-w-[80rem] w-full mx-auto overflow-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          style={{
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '0.75rem',
            padding: '0.9375rem',
          }}
        >
          <div className="flex justify-between items-center mb-[1.5rem]">
            <h2 className="text-[1.5rem] font-bold text-gray-800">
              Resume Score Analysis
            </h2>
            <button
              onClick={() => setScoreModalOpen(false)}
              className="text-red-500 text-[1.5rem] font-bold hover:scale-110 transition-transform"
            >
              ✖
            </button>
          </div>
          <div className="overflow-y-auto max-h-[75vh] p-[1rem]">
            {resumeScoreData ? (
              <AtsResult analysis={resumeScoreData} />
            ) : (
              <p className="text-center text-gray-500 text-[1rem]">
                No resume score data available.
              </p>
            )}
          </div>
        </Modal>

        {/* Profile Picture Preview Modal */}
        <Modal
          isOpen={profileModalOpen}
          onRequestClose={() => setProfileModalOpen(false)}
          className="bg-white p-[1.5rem] rounded-[0.5rem] shadow-xl max-w-[32rem] w-full mx-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="flex justify-end">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="text-red-500 text-[1.5rem] font-bold"
            >
              ✖
            </button>
          </div>
          <div className="flex justify-center items-center">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile Large"
                className="max-w-full max-h-[80vh] rounded"
              />
            ) : (
              <p className="text-[1rem]">No profile picture available.</p>
            )}
          </div>
        </Modal>

        {/* Fees Details Modal */}
        <Modal
          isOpen={feesModalOpen}
          onRequestClose={() => setFeesModalOpen(false)}
          className="bg-white p-[2rem] rounded-[0.75rem] shadow-2xl max-w-[28rem] w-full mx-auto transform transition-all"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center"
        >
          <div className="flex justify-between items-center mb-[1.5rem]">
            <h2 className="text-[1.5rem] font-bold text-gray-800 tracking-tight">
              Fees Details
            </h2>
            <button
              onClick={() => setFeesModalOpen(false)}
              className="text-red-500 text-[1.5rem] font-bold hover:text-red-600 transition-colors"
            >
              ✖
            </button>
          </div>
          <div className="text-left bg-gray-50 p-[1.5rem] rounded-[0.5rem] border border-gray-200">
            <p className="text-[1rem] font-medium text-gray-700 mb-[1rem] flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-green-600">
                ₹{studentDetails?.total || 'N/A'}
              </span>
            </p>
            <p className="text-[1rem] font-medium text-gray-700 mb-[1rem] flex justify-between">
              <span className="font-semibold text-gray-900">Paid Amount:</span>
              <span className="text-blue-600">
                ₹{studentDetails?.paidamount || 'N/A'}
              </span>
            </p>
            <p className="text-[1rem] font-medium text-gray-700 mb-[1rem] flex justify-between">
              <span className="font-semibold text-gray-900">Balance:</span>
              <span className="text-red-600">
                ₹{studentDetails?.balance || 'N/A'}
              </span>
            </p>
            <p className="text-[1rem] font-medium text-gray-700 mb-[1rem] flex justify-between">
              <span className="font-semibold text-gray-900">Due Date:</span>
              <span className="text-gray-600">
                {studentDetails?.duedate || 'N/A'}
              </span>
            </p>
            <p className="text-[1rem] font-medium text-gray-700 flex justify-between">
              <span className="font-semibold text-gray-900">Invoice:</span>
              {studentDetails?.invoiceURL ? (
                <a
                  href={studentDetails.invoiceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 hover:underline transition-colors break-all"
                >
                  View Invoice
                </a>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </p>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}
