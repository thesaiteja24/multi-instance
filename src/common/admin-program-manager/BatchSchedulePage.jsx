import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Card = ({
  course,
  instructor,
  startDate,
  endDate,
  startTime,
  endTime,
}) => {
  return (
    <div className="grid grid-cols-1 md:max-w-[425px] max-w-[320px] bg-[#FDFDFD] px-4 lg:px-6 xl:px-8 py-2 lg:py-4 xl:py-6 rounded-xl shadow-[0_4px_20px_0_rgba(179,186,247,1)] gap-y-2">
      <div className="grid grid-cols-1">
        <div className="flex flex-row items-center md:gap-x-1 gap-x-2">
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.2375 2.5H9.7625C5.2125 2.5 2.5 5.2125 2.5 9.7625V20.225C2.5 24.7875 5.2125 27.5 9.7625 27.5H20.225C24.775 27.5 27.4875 24.7875 27.4875 20.2375V9.7625C27.5 5.2125 24.7875 2.5 20.2375 2.5ZM20.25 22.8125C18.8375 22.8125 17.6875 21.6625 17.6875 20.25C17.6875 19.425 18.0875 18.7 18.7 18.225C18.175 16.85 16.8625 15.9 15.3875 15.95L12.8125 15.9625H12.8C12.0375 15.9625 11.3125 15.7375 10.7 15.35V17.875C11.65 18.25 12.325 19.175 12.325 20.25C12.325 21.6625 11.175 22.8125 9.7625 22.8125C8.35 22.8125 7.2 21.6625 7.2 20.25C7.2 19.1625 7.875 18.25 8.825 17.875V12.4375C7.875 12 7.2 11.05 7.2 9.9375C7.2 8.425 8.4375 7.1875 9.95 7.1875C11.4625 7.1875 12.7 8.425 12.7 9.9375C12.7 11.1625 11.8875 12.1875 10.775 12.55C11.025 13.4625 11.85 14.1 12.8 14.1C12.8 14.1 12.8 14.1 12.8125 14.1L15.3875 14.0875C15.4 14.0875 15.4 14.0875 15.4125 14.0875C17.7125 14.0875 19.775 15.55 20.525 17.725C21.8125 17.8625 22.825 18.9375 22.825 20.2625C22.8125 21.6625 21.6625 22.8125 20.25 22.8125Z"
              fill="#00007F"
            />
          </svg>
          <p className="font-semibold text-lg md:text-xl">{course}</p>
        </div>
      </div>

      <div className="grid grid-cols-[45%_auto] items-center">
        <div className="flex flex-row items-center md:gap-x-1 gap-x-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.41016 22C3.41016 18.13 7.26015 15 12.0002 15C12.9602 15 13.8902 15.13 14.7602 15.37"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 18C22 18.75 21.79 19.46 21.42 20.06C21.21 20.42 20.94 20.74 20.63 21C19.93 21.63 19.01 22 18 22C16.54 22 15.27 21.22 14.58 20.06C14.21 19.46 14 18.75 14 18C14 16.74 14.58 15.61 15.5 14.88C16.19 14.33 17.06 14 18 14C20.21 14 22 15.79 22 18Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.4399 17.9995L17.4299 18.9895L19.5599 17.0195"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm md:text-base xl:text-lg">Instructor</p>
        </div>
        <p>: {instructor}</p>
      </div>

      <div className="grid grid-cols-[45%_auto] items-center">
        <div className="flex flex-row items-center md:gap-x-1 gap-x-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 2V5"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 2V5"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 9.08984H20.5"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.6947 13.6992H15.7037"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.6947 16.6992H15.7037"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.9955 13.6992H12.0045"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.9955 16.6992H12.0045"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.29431 13.6992H8.30329"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.29431 16.6992H8.30329"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm md:text-base xl:text-lg">Start Date</p>
        </div>
        <p>: {startDate}</p>
      </div>

      <div className="grid grid-cols-[45%_auto] items-center">
        <div className="flex flex-row items-center md:gap-x-1 gap-x-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 2V5"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 2V5"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.5 9.08984H20.5"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.6947 13.6992H15.7037"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.6947 16.6992H15.7037"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.9955 13.6992H12.0045"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.9955 16.6992H12.0045"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.29431 13.6992H8.30329"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.29431 16.6992H8.30329"
              stroke="#414651"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm md:text-base xl:text-lg">End Date</p>
        </div>
        <p>: {endDate}</p>
      </div>

      <div className="grid grid-cols-[45%_auto] items-center">
        <div className="flex flex-row items-center md:gap-x-1 gap-x-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.7099 15.1798L12.6099 13.3298C12.0699 13.0098 11.6299 12.2398 11.6299 11.6098V7.50977"
              stroke="#414651"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm md:text-base xl:text-lg">Time</p>
        </div>
        <p className="inline-block text-wrap">
          : {startTime} - {endTime}
        </p>
      </div>
    </div>
  );
};

const BatchSchedulePage = () => {
  const { state } = useLocation();
  const batch = state?.batch || {};
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batch || !batch.location || !batch.Batch) {
      console.error('Batch data is missing or incomplete:', batch);
      setError(
        'No batch data available. Please select a batch from the batch list page.'
      );
      setLoading(false);
      return;
    }

    const fetchScheduledData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule?location=${batch.location}`
        );
        const filteredSchedule = response.data.schedule_data.filter(item =>
          item.batchNo.includes(batch.Batch)
        );
        setScheduleData(filteredSchedule);
        setError(null);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        setError('Failed to load schedule data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledData();
  }, [batch, navigate]);

  if (loading) {
    return (
      <section className="flex flex-col mt-6 lg:mt-8 xl:mt-10 px-5 md:px-8 lg:px-10 xl:px-12 font-[inter] gap-y-8">
        <div className="text-center text-xl text-gray-600">
          Loading schedule...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col mt-6 lg:mt-8 xl:mt-10 px-5 md:px-8 lg:px-10 xl:px-12 font-[inter] gap-y-8">
        <div className="text-center text-xl text-red-600">
          {error}
          <button
            onClick={() => navigate('/batch-list')}
            className="ml-2 text-blue-500 underline"
          >
            Go to Batch List
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col mt-6 lg:mt-8 xl:mt-10 px-5 md:px-8 lg:px-10 xl:px-12 font-[inter] gap-y-8 ">
      <h1 className="text-center font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl text-[var(--color-secondary)]">
        Schedule for {batch.Batch}
      </h1>
      {scheduleData.length === 0 ? (
        <div className="text-center text-xl text-gray-600">
          No schedule data available for this batch.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-8 md:gap-10 xl:gap-12 items-center justify-center">
          {scheduleData.map(item => (
            <Card
              key={item._id}
              course={item.subject}
              instructor={item.MentorName}
              startDate={item.StartDate}
              endDate={item.EndDate}
              startTime={item.StartTime}
              endTime={item.EndTime}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BatchSchedulePage;
