import React from 'react';
import { useNavigate } from 'react-router-dom';

const MentorDashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = path => {
    navigate(path);
  };

  return (
    <div className="p-4 font-[Poppins] m-2">
      <div>
        <h2 className="text-center text-[22px] font-semibold text-[var(--color-secondary)] mb-7">
          Mentor Dashboard
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl-custom:grid-cols-3 gap-6 md:gap-4">
        <div
          className="bg-white p-6 md:p-8 rounded-[20px] shadow-lg flex items-center space-x-4 cursor-pointer min-w-[250px] min-h-30"
          onClick={() => handleNavigation('/mentor/assigned-batches')}
          style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
        >
          <div className="min-w-[60px] min-h-[60px] flex items-center justify-center">
            <svg
              className="w-12 h-12 md:w-16 md:h-16"
              width="60"
              height="60"
              viewBox="0 0 60 61"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_872_128)">
                <path
                  d="M5.00021 6.75C5.00021 3.2975 7.79771 0.5 11.2502 0.5C14.7027 0.5 17.5002 3.2975 17.5002 6.75C17.5002 10.2025 14.7027 13 11.2502 13C7.79771 13 5.00021 10.2025 5.00021 6.75ZM35.0002 20.5C36.3802 20.5 37.5002 19.3825 37.5002 18C37.5002 16.6175 36.3802 15.5 35.0002 15.5H10.0002C4.48521 15.5 0.000214591 19.985 0.000214591 25.5V33C0.000214591 34.3825 1.12021 35.5 2.50021 35.5C3.88021 35.5 5.00021 34.3825 5.00021 33V25.5C5.00021 22.7425 7.24271 20.5 10.0002 20.5H15.0002V33C15.0002 34.3825 16.1202 35.5 17.5002 35.5C18.8802 35.5 20.0002 34.3825 20.0002 33V20.5H35.0002ZM48.7502 0.5H25.0002C23.6202 0.5 22.5002 1.6175 22.5002 3C22.5002 4.3825 23.6202 5.5 25.0002 5.5H48.7502C52.1952 5.5 55.0002 8.3025 55.0002 11.75V24.25C55.0002 27.6975 52.1952 30.5 48.7502 30.5H47.5002V28C47.5002 26.6175 46.3802 25.5 45.0002 25.5H40.0002C38.6202 25.5 37.5002 26.6175 37.5002 28V30.5H27.5002C26.1202 30.5 25.0002 31.6175 25.0002 33C25.0002 34.3825 26.1202 35.5 27.5002 35.5H48.7502C54.9527 35.5 60.0002 30.4525 60.0002 24.25V11.75C60.0002 5.5475 54.9527 0.5 48.7502 0.5ZM51.2502 53C48.1077 53 45.1677 54.195 43.1877 56.2775C42.2352 57.2775 42.2752 58.8625 43.2777 59.8125C44.2777 60.7675 45.8602 60.7225 46.8127 59.725C48.8627 57.5675 53.6377 57.5675 55.6902 59.725C56.1802 60.24 56.8402 60.5025 57.5027 60.5025C58.1227 60.5025 58.7427 60.275 59.2252 59.815C60.2252 58.865 60.2677 57.28 59.3152 56.28C57.3352 54.1975 54.3977 53.0025 51.2527 53.0025L51.2502 53ZM30.0002 53C26.8577 53 23.9177 54.195 21.9377 56.2775C20.9852 57.2775 21.0252 58.8625 22.0277 59.8125C23.0277 60.7675 24.6127 60.7225 25.5627 59.725C27.6127 57.5675 32.3877 57.5675 34.4402 59.725C34.9302 60.24 35.5902 60.5025 36.2527 60.5025C36.8727 60.5025 37.4927 60.275 37.9752 59.815C38.9752 58.865 39.0177 57.28 38.0652 56.28C36.0852 54.1975 33.1477 53.0025 30.0027 53.0025L30.0002 53ZM8.75021 53C5.60771 53 2.66771 54.195 0.687715 56.2775C-0.264785 57.2775 -0.224785 58.8625 0.777715 59.8125C1.77771 60.7675 3.36271 60.7225 4.31271 59.725C6.36271 57.5675 11.1377 57.5675 13.1902 59.725C13.6802 60.24 14.3402 60.5025 15.0027 60.5025C15.6227 60.5025 16.2427 60.275 16.7252 59.815C17.7252 58.865 17.7677 57.28 16.8152 56.28C14.8352 54.1975 11.8977 53.0025 8.75271 53.0025L8.75021 53ZM13.7502 45.5C13.7502 42.7375 11.5127 40.5 8.75021 40.5C5.98771 40.5 3.75021 42.7375 3.75021 45.5C3.75021 48.2625 5.98771 50.5 8.75021 50.5C11.5127 50.5 13.7502 48.2625 13.7502 45.5ZM35.0002 45.5C35.0002 42.7375 32.7627 40.5 30.0002 40.5C27.2377 40.5 25.0002 42.7375 25.0002 45.5C25.0002 48.2625 27.2377 50.5 30.0002 50.5C32.7627 50.5 35.0002 48.2625 35.0002 45.5ZM56.2502 45.5C56.2502 42.7375 54.0127 40.5 51.2502 40.5C48.4877 40.5 46.2502 42.7375 46.2502 45.5C46.2502 48.2625 48.4877 50.5 51.2502 50.5C54.0127 50.5 56.2502 48.2625 56.2502 45.5Z"
                  fill="#00007F"
                />
              </g>
              <defs>
                <clipPath id="clip0_872_128">
                  <rect
                    width="60"
                    height="60"
                    fill="white"
                    transform="translate(0 0.5)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-semibold text-[#121212]">
              Live Batches
            </h3>
            <p className="text-[#6E6E6E] text-sm md:text-base mt-2">
              Ongoing live batches
            </p>
          </div>
        </div>
        <div
          className="bg-white p-6 md:p-8 rounded-[20px] shadow-lg flex items-center space-x-4 cursor-pointer min-w-[250px] min-h-30"
          onClick={() => handleNavigation('/mentor/students-list')}
          style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
        >
          <div className="min-w-[60px] min-h-[60px] flex items-center justify-center">
            <svg
              width="60"
              height="60"
              viewBox="0 0 56 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.29175 7.16667L17.5001 2L31.7084 7.16667L25.2501 11.0417V14.9167C25.2501 14.9167 23.527 13.625 17.5001 13.625C11.4732 13.625 9.75008 14.9167 9.75008 14.9167V11.0417L3.29175 7.16667ZM3.29175 7.16667V17.5"
                stroke="#00007F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25.25 13.6243V15.9209C25.25 20.3591 21.7806 23.9577 17.5 23.9577C13.2194 23.9577 9.75 20.3591 9.75 15.9209V13.6243M36.4048 20.1602C36.4048 20.1602 37.6577 19.2483 42.0417 19.2483C46.4256 19.2483 47.6785 20.1576 47.6785 20.1576M36.4048 20.1602V17.4993L31.7083 14.916L42.0417 11.041L52.375 14.916L47.6785 17.4993V20.1576M36.4048 20.1602V20.9042C36.4048 22.3992 36.9987 23.8329 38.0558 24.89C39.1129 25.9471 40.5467 26.541 42.0417 26.541C43.5366 26.541 44.9704 25.9471 46.0275 24.89C47.0846 23.8329 47.6785 22.3992 47.6785 20.9042V20.1576M38.1667 43.3327H47.7379C49.7348 43.3327 51.321 42.3613 52.747 41.0025C55.6662 38.2228 50.8741 36.0012 49.0477 34.9136C47.4234 33.9549 45.6198 33.3394 43.7483 33.1053C41.8767 32.8711 39.9771 33.0232 38.1667 33.5522M8.16125 32.8082C5.72516 34.1696 -0.663419 36.9467 3.22708 40.4213C5.12841 42.1185 7.24416 43.3327 9.90758 43.3327H25.0924C27.7532 43.3327 29.8716 42.1185 31.7729 40.4213C35.6634 36.9467 29.2748 34.1696 26.8387 32.8082C21.1244 29.6178 13.8756 29.6178 8.16125 32.8082Z"
                stroke="#00007F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-semibold text-[#121212]">
              Students
            </h3>
            <p className="text-[#6E6E6E] text-sm md:text-base mt-2">
              Monitor student progress and engagement
            </p>
          </div>
        </div>
        <div
          className="bg-white p-6 md:p-8 rounded-[20px] shadow-lg flex items-center space-x-4 cursor-pointer min-w-[250px] min-h-30"
          onClick={() => handleNavigation('/mentor/attendance-management')}
          style={{ boxShadow: '0px 4px 20px 0px #B3BAF7' }}
        >
          <div className="min-w-[60px] min-h-[60px] flex items-center justify-center">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 5V12.5"
                stroke="#00007F"
                strokeWidth="3.75"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M40 5V12.5"
                stroke="#00007F"
                strokeWidth="3.75"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.75 22.7246H51.25"
                stroke="#00007F"
                strokeWidth="3.75"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M52.5 21.25V42.5C52.5 50 48.75 55 40 55H20C11.25 55 7.5 50 7.5 42.5V21.25C7.5 13.75 11.25 8.75 20 8.75H40C48.75 8.75 52.5 13.75 52.5 21.25Z"
                stroke="#00007F"
                strokeWidth="3.75"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M39.2368 34.248H39.2592"
                stroke="#00007F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M39.2368 41.748H39.2592"
                stroke="#00007F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M29.9887 34.248H30.0112"
                stroke="#00007F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M29.9887 41.748H30.0112"
                stroke="#00007F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.7358 34.248H20.7582"
                stroke="#00007F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.7358 41.748H20.7582"
                stroke="#00007F"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-semibold text-[#121212]">
              Attendance
            </h3>
            <p className="text-[#6E6E6E] text-sm md:text-base mt-2">
              Track and manage attendance records
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
