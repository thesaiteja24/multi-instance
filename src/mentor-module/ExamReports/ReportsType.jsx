import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { getMentorStudentsThunk } from '../../reducers/mentorStudentsSlice.js';
import axios from 'axios'; // Import axios
import { COLLEGE_CODE } from '../../constants/AppConstants.js';

const ReportsType = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { batch, location } = useParams();
  const [locationFilter, setLocationFilter] = useState('all');
  const [loadingId, setLoadingId] = useState(null);
  const { userInfo } = useSelector(state => state.auth);
  const sessionStorageLocation = userInfo?.location;
  const mentorId = userInfo?.id;
  const locations = [COLLEGE_CODE];

  const {
    scheduleData,
    mentorData,
    mentorStudentsListError,
    mentorStudentsListLoading,
  } = useSelector(state => state.mentorStudents);

  const uniqueBatches = useMemo(() => {
    if (Array.isArray(scheduleData) && scheduleData.length > 0) {
      const allBatches = scheduleData.map(entry => entry.batchNo).flat();
      return [...new Set(allBatches)];
    }
    return [];
  }, [scheduleData]);

  useEffect(() => {
    if (scheduleData.length === 0 && !mentorStudentsListLoading) {
      dispatch(
        getMentorStudentsThunk({ location: sessionStorageLocation, mentorId })
      );
    }
  }, [dispatch, scheduleData.length, mentorStudentsListLoading]);

  const cardData = [
    {
      title: 'Daily Exam',
      color: '#354128',
      textColor: '#354128',
      route: 'daily',
      disabled: false,
      examType: 'Daily-Exam',
    },
    {
      title: 'Weekly Exam',
      color: '#4B4B85',
      textColor: '#4B4B85',
      route: 'weekly',
      disabled: true,
      examType: 'Weekly-Exam',
    },
    {
      title: 'Monthly Exam',
      color: '#FF6000',
      textColor: '#FF6000',
      route: 'monthly',
      disabled: true,
      examType: 'Monthly-Exam',
    },
    {
      title: 'Grand Test',
      color: '#21B1CA',
      textColor: '#21B1CA',
      route: 'grand',
      disabled: true,
      examType: 'Grand-Exam',
    },
  ];

  const handleCardClick = async card => {
    if (card.disabled || loadingId || mentorStudentsListLoading) {
      toast.warn('Please wait, data is still loading.', {
        autoClose: 5000,
        closeOnClick: true,
        closeButton: true,
      });
      return;
    }

    if (!Array.isArray(mentorData) || mentorData.length === 0) {
      toast.warn('Mentor data is missing or invalid.', {
        autoClose: 5000,
        closeOnClick: true,
        closeButton: true,
      });
      return;
    }

    const mentor = mentorData[0];
    if (
      !mentor ||
      !Array.isArray(mentor.Designation) ||
      mentor.Designation.length === 0
    ) {
      toast.info('Mentor designation data is missing or invalid.', {
        autoClose: 5000,
        closeOnClick: true,
        closeButton: true,
      });
      return;
    }

    if (!uniqueBatches.includes(batch)) {
      toast.info('Selected batch is not valid for this mentor.', {
        autoClose: 5000,
        closeOnClick: true,
        closeButton: true,
      });
      return;
    }

    setLoadingId(card.examType);
    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentor-exam-day-list`;
      const requestParams = {
        batch,
        location: sessionStorageLocation,
        subjects: JSON.stringify(mentor.Designation),
      };

      const response = await axios.get(apiUrl, {
        params: requestParams,
      });

      const { batch: batchName, examNames } = response.data;
      const exams = Array.isArray(examNames)
        ? examNames
            .map(examName => ({
              examName,
              batch: batchName,
            }))
            .filter(exam => exam.examName.startsWith(card.examType))
            .filter(exam => locationFilter === 'all' || exam.batch === batch)
        : [];

      if (exams.length === 0) {
        toast.warn(
          `No ${card.examType.replace('-Exam', ' Exam')} data available for this batch and location.`,
          {
            autoClose: 5000,
            closeOnClick: true,
            closeButton: true,
          }
        );
        return;
      }

      if (!batch || !location || !card.route) {
        console.error('Missing required parameters');
        return;
      }
      navigate(`/mentor/reports/${batch}/${location}/${card.route}`, {
        state: { examType: card.examType, exams },
      });
    } catch (error) {
      console.error('Error fetching exam data:', error);
      let errorMessage = 'No Reports are available at this moment';
      if (error.response) {
        errorMessage = `${
          error.response.data?.message || 'Failed to fetch exam data'
        }`;
      } else if (error.request) {
        errorMessage = 'Network Error: Unable to reach the server';
      } else {
        errorMessage = `Request Error: ${error.message}`;
      }
      toast.info(errorMessage, {
        autoClose: false,
        closeOnClick: true,
        closeButton: true,
        style: { width: '500px', whiteSpace: 'pre-wrap' },
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="m-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleBackClick}
          className="text-black font-medium flex items-center text-sm sm:text-base md:text-lg hover:text-blue-800 transition"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 33 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
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
      </div>

      {mentorStudentsListError ? (
        <p className="text-center text-red-500 mt-10 font-semibold">
          {mentorStudentsListError}
        </p>
      ) : (
        <>
          {sessionStorageLocation === 'all' && (
            <div className="text-center mb-8">
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm sm:text-base"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mentorStudentsListLoading ? (
            <p className="text-center text-gray-600 mt-10">
              Loading batches...
            </p>
          ) : !Array.isArray(mentorData) || mentorData.length === 0 ? (
            <p className="text-center text-red-500 mt-10 font-semibold">
              Mentor data is not available.
            </p>
          ) : (
            <div className="w-full px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center font-[Inter]">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-[28px] shadow-[0px_4.3px_18px_rgba(19,46,224,0.2)] overflow-hidden"
                    style={{
                      height: '260px',
                      width: '100%',
                      maxWidth: '342px',
                    }}
                  >
                    <div
                      className="w-full h-[44px] rounded-t-[28px]"
                      style={{ backgroundColor: card.color }}
                    ></div>
                    <div className="flex flex-col items-center justify-center gap-10 h-[calc(100%-44px)] px-6 py-4 sm:px-6 sm:py-6">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.8174 6.95542C10.8174 6.75046 10.8988 6.5539 11.0437 6.40897C11.1887 6.26404 11.3852 6.18262 11.5902 6.18262H17.7726C17.9776 6.18262 18.1742 6.26404 18.3191 6.40897C18.3191 6.5539 18.5454 6.75046 18.5454 6.95542C18.5454 7.16038 18.464 7.35695 18.3191 7.50188C18.1742 7.64681 17.9776 7.72823 17.7726 7.72823H11.5902C11.3852 7.72823 11.1887 7.64681 11.0437 7.50188C10.8988 7.35695 10.8174 7.16038 10.8174 6.95542ZM11.5902 9.27384C11.3852 9.27384 11.1887 9.35526 11.0437 9.50019C10.8988 9.64512 10.8174 9.84168 10.8174 10.0466C10.8174 10.2516 10.8988 10.4482 11.0437 10.5931C11.1887 10.738 11.3852 10.8194 11.5902 10.8194H17.7726C17.9776 10.8194 18.1742 10.738 18.3191 10.5931C18.464 10.4482 18.5454 10.2516 18.5454 10.0466C18.5454 9.84168 18.464 9.64512 18.3191 9.50019C18.1742 9.35526 17.9776 9.27384 17.7726 9.27384H11.5902ZM10.8174 17.0019C10.8174 16.7969 10.8988 16.6004 11.0437 16.4554C11.1887 16.3105 11.3852 16.2291 11.5902 16.2291H17.7726C17.9776 16.2291 18.1742 16.3105 18.3191 16.4554C18.464 16.6004 18.5454 16.7969 18.5454 17.0019C18.5454 17.2069 18.464 17.4034 18.3191 17.5483C18.1742 17.6933 17.9776 17.7747 17.7726 17.7747H11.5902C11.3852 17.7747 11.1887 17.6933 11.0437 17.5483C10.8988 17.2069 10.8174 17.0019 10.8174 17.0019ZM11.5902 19.3203C11.3852 19.3203 11.1887 19.4017 11.0437 19.5467C10.8988 19.6916 10.8174 19.8882 10.8174 20.0931C10.8174 20.2981 10.8988 20.4946 11.0437 20.6396C11.1887 20.7845 11.3852 20.8659 11.5902 20.8659H17.7726C17.9776 20.8659 18.1742 20.7845 18.3191 20.6396C18.464 20.4946 18.5454 20.2981 18.5454 20.0931C18.5454 19.8882 18.464 19.6916 18.3191 19.5467C18.1742 19.4017 17.9776 19.3203 17.7726 19.3203H11.5902Z"
                            fill={card.color}
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.09082 16.2298C3.09082 16.0249 3.17224 15.8283 3.31717 15.6834C3.4621 15.5385 3.65866 15.457 3.86363 15.457H7.72765C7.93261 15.457 8.12918 15.5385 8.27411 15.6834C8.41904 15.8283 8.50046 15.2298 8.50046 16.2298V20.0939C8.50046 20.2988 8.41904 20.4954 8.27411 20.6403C8.12918 20.7852 7.93261 20.8667 7.72765 20.8667H3.86363C3.65866 20.8667 3.4621 20.7852 3.31717 20.6403C3.17224 20.4954 3.09082 20.2988 3.09082 20.0939V16.2298ZM4.63643 17.0026V19.3211H6.95485V17.0026H4.63643Z"
                            fill={card.color}
                          />
                          <path
                            d="M9.04612 7.50207C9.1869 7.35631 9.26479 7.1611 9.26303 6.95847C9.26127 6.75585 9.17999 6.56202 9.03671 6.41873C8.89342 6.27545 8.6996 6.19417 8.49697 6.19241C8.29434 6.19065 8.09913 6.26855 7.95338 6.40932L5.40853 8.95417L4.40929 7.95493C4.26354 7.81416 4.06833 7.73626 3.8657 7.73802C3.66307 7.73978 3.46924 7.82106 3.32596 7.96434C3.18267 8.10763 3.1014 8.30146 3.09964 8.50408C3.09788 8.70671 3.17577 8.90192 3.31654 9.04768L5.40853 11.1397L9.04612 7.50207Z"
                            fill={card.color}
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.09122 0C2.27138 0 1.48511 0.325681 0.905398 0.905398C0.325681 1.48511 0 2.27138 0 3.09122V24.7298C0 25.5496 0.325681 26.3359 0.905398 26.9156C1.48511 27.4953 2.27138 27.821 3.09122 27.821H18.5473C19.3672 27.821 20.1534 27.4953 20.7332 26.9156C21.3129 26.3359 21.6386 25.5496 21.6386 24.7298V3.09122C21.6386 2.27138 21.3129 1.48511 20.7332 0.905398C20.1534 0.325681 19.3672 0 18.5473 0H3.09122ZM1.54561 3.09122C1.54561 2.6813 1.70845 2.28817 1.99831 1.99831C2.28817 1.70845 2.6813 1.54561 3.09122 1.54561H18.5473C18.9573 1.54561 19.3504 1.70845 19.6402 1.99831C19.9301 2.28817 20.0929 2.6813 20.0929 3.09122V24.7298C20.0929 25.1397 19.9301 25.5328 19.6402 25.8227C19.3504 25.1125 18.9573 26.2754 18.5473 26.2754H3.09122C2.6813 26.2754 2.28817 26.1125 1.99831 25.8227C1.70845 25.5328 1.54561 25.1397 1.54561 24.7298V3.09122ZM23.1842 7.72805C23.1842 7.11317 23.4284 6.52347 23.8632 6.08869C24.298 5.6539 24.8877 5.40964 25.5026 5.40964C26.1175 5.40964 26.7072 5.6539 27.1419 6.08869C27.5767 6.52347 27.821 7.11317 27.821 7.72805V23.4183L25.5026 26.8959L23.1842 23.4183V7.72805ZM25.5026 6.95525C25.2976 6.95525 25.1011 7.03667 24.9561 7.1816C24.8112 7.32653 24.7298 7.52309 24.7298 7.72805V9.27367H26.2754V7.72805C26.2754 7.52309 26.194 7.32653 26.049 7.1816C25.9041 7.03667 25.7075 6.95525 25.5026 6.95525ZM25.5026 24.1092L24.7298 22.95V10.8193H26.2754V22.95L25.5026 24.1092Z"
                            fill={card.color}
                          />
                        </svg>
                        <h3
                          className="text-[25px] font-medium"
                          style={{ color: card.color }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleCardClick(card)}
                        className="px-6 py-2 w-[240px] h-[47px] rounded-[10px] shadow-md flex items-center justify-center gap-2 text-white text-[19px] font-medium transition-colors duration-300"
                        style={{
                          backgroundColor:
                            card.disabled || loadingId === card.examType
                              ? '#A0A0A0'
                              : card.color,
                        }}
                        disabled={card.disabled || loadingId === card.examType}
                      >
                        {loadingId === card.examType ? (
                          <div
                            className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
                            style={{
                              borderColor: card.color,
                              borderTopColor: 'transparent',
                            }}
                          ></div>
                        ) : (
                          <>
                            <FiEye size={20} />
                            {card.disabled ? 'Coming Soon' : 'View'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsType;
