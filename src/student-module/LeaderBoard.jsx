import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchStudentDetails } from '../reducers/studentSlice.js';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const picUrl = raw =>
  raw?.startsWith('http') ? raw : `${BASE_URL}/api/v1/pic?student_id=${raw}`;

const LeaderBoard = () => {
  const {
    studentDetails,
    profilePicture,
    resumeUrl,
    loading: studentLoading,
    error: studentError,
  } = useSelector(state => state.student);
  const { userInfo } = useSelector(state => state.auth);
  const { location } = userInfo;
  const [activeTab, setActiveTab] = useState('Class');
  const [topThree, setTopThree] = useState([]);
  const [others, setOthers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const fetchData = useCallback(
    async tab => {
      if (!studentDetails) {
        dispatch(fetchStudentDetails());
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const isClass = tab === 'Class';
        const params = {
          mode: isClass ? 'class' : 'overall',
          location: location,
          limit: 50,
          ...(isClass && { batchNo: studentDetails.BatchNo }),
        };

        const { data } = await axios.get(`${BASE_URL}/api/v1/leaderboard`, {
          params,
        });

        if (data.success) {
          setTopThree(data.topThree || []);
          setOthers(data.others || []);
        } else {
          throw new Error(data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        setError(err.message || 'Could not load leaderboard');
        toast.error(err.message || 'Could not load leaderboard');
      } finally {
        setIsLoading(false);
      }
    },
    [studentDetails, dispatch]
  );

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const positionCardBg = useMemo(
    () => pos =>
      pos === 1
        ? 'bg-blue-800 text-white'
        : 'bg-white text-gray-900 border border-blue-200',
    []
  );

  const positionCrown = pos => `/kits/card${pos}.png`;
  const orderClass = pos => {
    switch (pos) {
      case 2:
        return 'lg:order-1';
      case 1:
        return 'lg:order-2';
      case 3:
        return 'lg:order-3';
      default:
        return '';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg font-semibold">
          Error: {error}
          <button
            onClick={() => fetchData(activeTab)}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen font-sans text-white mt-16 px-4">
      {/* Tabs */}
      <div
        className="w-full max-w-md bg-blue-800 rounded-full p-1 flex items-center justify-between mb-6"
        role="tablist"
        aria-label="Leaderboard tabs"
      >
        {['Class', 'Overall'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            disabled={isLoading}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white text-blue-900'
                : 'text-white hover:bg-blue-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top-3 Cards */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 w-full justify-center items-center mt-12">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex flex-col items-center bg-blue-800/60 rounded-lg p-5 w-full max-w-[250px] h-[320px]"
              >
                <div className="w-16 h-16 bg-gray-600 rounded-full mb-4"></div>
                <div className="w-32 h-4 bg-gray-600 rounded mb-2"></div>
                <div className="w-24 h-4 bg-gray-600 rounded"></div>
              </div>
            ))
          : topThree.map(p => (
              <div
                key={p.position}
                className={`flex flex-col items-center justify-between rounded-lg p-5 w-full max-w-[250px] h-[320px] shadow-lg transition-transform duration-300 hover:scale-105 ${positionCardBg(p.position)} ${p.position === 1 ? 'lg:-translate-y-16' : ''} ${orderClass(p.position)}`}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={positionCrown(p.position)}
                    alt={`Position ${p.position} crown`}
                    className="w-16 h-11 object-contain mb-2"
                    loading="lazy"
                  />
                  <div
                    className={`w-24 h-24 rounded-full border-4 overflow-hidden ${p.position === 1 ? 'border-white' : 'border-blue-800'}`}
                  >
                    <img
                      src={picUrl(p.img)}
                      alt={`${p.name}'s profile`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h2
                    className="text-md font-semibold text-center line-clamp-2"
                    title={p.name}
                  >
                    {p.name}
                  </h2>
                  <p
                    className={`text-sm font-medium ${p.position !== 1 ? 'text-gray-600' : 'text-gray-200'}`}
                  >
                    {activeTab === 'Class' ? `Class ${p.batchNo}` : p.batchNo}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${p.position !== 1 ? 'bg-blue-800 text-white' : 'bg-white text-blue-800'}`}
                >
                  <img
                    src="/kits/worldcup.png"
                    alt="Trophy icon"
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                  <span>Score: {p.score}</span>
                </div>
              </div>
            ))}
      </div>

      {/* Leaderboard Rows */}
      <div className="w-full max-w-6xl mt-12 p-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between bg-blue-800/60 rounded-3xl px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-6 bg-gray-600 rounded"></div>
                  <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
                  <div className="w-32 h-4 bg-gray-600 rounded"></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-4 bg-gray-600 rounded"></div>
                  <div className="w-24 h-4 bg-gray-600 rounded"></div>
                  <div className="w-32 h-6 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex sm:hidden flex-col gap-4">
              {others.map(p => (
                <div
                  key={p.position}
                  className="flex flex-col items-center bg-blue-800 rounded-3xl p-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/kits/generalcard.png"
                        alt="Position icon"
                        className="w-8 h-5 object-contain"
                        loading="lazy"
                      />
                      <div className="w-16 h-16 rounded-full border-2 border-gray-400/60 shadow overflow-hidden">
                        <img
                          src={picUrl(p.img)}
                          alt={`${p.name}'s profile`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <span
                      className="text-base font-semibold text-center whitespace-nowrap"
                      title={p.name}
                    >
                      {p.name}
                    </span>
                    <p className="text-sm font-semibold text-center">
                      {activeTab === 'Class' ? `Class ${p.batchNo}` : p.batchNo}
                    </p>
                    <p className="text-sm font-medium text-gray-200 text-center">
                      Date: {p.date}
                    </p>
                    <div className="flex items-center gap-2 px-4 py-1 bg-pink-500 rounded-full">
                      <img
                        src="/kits/worldcup.png"
                        alt="Trophy icon"
                        className="w-4 h-4 object-contain"
                        loading="lazy"
                      />
                      <span className="text-sm font-semibold">
                        Score: {p.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:flex flex-col gap-2">
              {others.map(p => (
                <div
                  key={p.position}
                  className="flex items-center justify-between bg-blue-800 rounded-3xl px-6 py-4 hover:bg-blue-700/10 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-12 text-center">
                      {p.position}.
                    </span>
                    <img
                      src="/kits/generalcard.png"
                      alt="Position icon"
                      className="w-10 h-6 object-contain"
                      loading="lazy"
                    />
                    <div className="w-16 h-16 rounded-full border-[3px] border-white/60 shadow-md overflow-hidden">
                      <img
                        src={picUrl(p.img)}
                        alt={`${p.name}'s profile`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span
                      className="text-md font-semibold whitespace-nowrap max-w-xs truncate"
                      title={p.name}
                    >
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-base font-semibold text-center w-32">
                      {activeTab === 'Class' ? `Class ${p.batchNo}` : p.batchNo}
                    </p>
                    <p className="text-sm font-medium text-gray-200 text-center w-32">
                      Date: {p.date}
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 bg-pink-500 rounded-full">
                      <img
                        src="/kits/worldcup.png"
                        alt="Trophy icon"
                        className="w-6 h-6 object-contain"
                        loading="lazy"
                      />
                      <span className="text-sm font-semibold">
                        Score: {p.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
    </div>
  );
};

export default LeaderBoard;
