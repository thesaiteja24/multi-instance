import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Card Component (Adapted from NewDashboard)
const Card = ({ title, members, total, onMemberClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0px_4.16px_20.82px_0px_#B3BAF7]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#00007F] p-4 rounded-2xl">
        <h1 className="text-white font-semibold text-base lg:text-lg">
          {title}
        </h1>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.1961 7.77C18.1261 7.76 18.0561 7.76 17.9861 7.77C16.4361 7.72 15.2061 6.45 15.2061 4.89C15.2061 3.3 16.4961 2 18.0961 2C19.6861 2 20.9861 3.29 20.9861 4.89C20.9761 6.45 19.7461 7.72 18.1961 7.77Z"
              fill="white"
            />
            <path
              d="M21.4586 14.7004C20.3386 15.4504 18.7686 15.7304 17.3186 15.5404C17.6986 14.7204 17.8986 13.8104 17.9086 12.8504C17.9086 11.8504 17.6886 10.9004 17.2686 10.0704C18.7486 9.8704 20.3186 10.1504 21.4486 10.9004C23.0286 11.9404 23.0286 13.6504 21.4586 14.7004Z"
              fill="white"
            />
            <path
              d="M7.10715 7.77C7.17715 7.76 7.24715 7.76 7.31715 7.77C8.86715 7.72 10.0971 6.45 10.0971 4.89C10.0971 3.29 8.80715 2 7.20715 2C5.61715 2 4.32715 3.29 4.32715 4.89C4.32715 6.45 5.55715 7.72 7.10715 7.77Z"
              fill="white"
            />
            <path
              d="M7.21809 12.8506C7.21809 13.8206 7.42809 14.7406 7.80809 15.5706C6.39809 15.7206 4.92809 15.4206 3.84809 14.7106C2.26809 13.6606 2.26809 11.9506 3.84809 10.9006C4.91809 10.1806 6.42809 9.89059 7.84809 10.0506C7.43809 10.8906 7.21809 11.8406 7.21809 12.8506Z"
              fill="white"
            />
            <path
              d="M12.7878 15.87C12.7078 15.86 12.6178 15.86 12.5278 15.87C10.6878 15.81 9.21777 14.3 9.21777 12.44C9.22777 10.54 10.7578 9 12.6678 9C14.5678 9 16.1078 10.54 16.1078 12.44C16.0978 14.3 14.6378 15.81 12.7878 15.87Z"
              fill="white"
            />
            <path
              d="M9.53777 17.9406C8.02777 18.9506 8.02777 20.6106 9.53777 21.6106C11.2578 22.7606 14.0778 22.7606 15.7978 21.6106C17.3078 20.6006 17.3078 18.9406 15.7978 17.9406C14.0878 16.7906 11.2678 16.7906 9.53777 17.9406Z"
              fill="white"
            />
          </svg>
          <h1 className="text-white font-semibold text-base lg:text-lg">
            Total :
          </h1>
          <h1 className="text-white font-semibold text-sm md:text-base">
            {total}
          </h1>
        </div>
      </div>
      {/* Body */}
      <div className="max-h-[55vh] overflow-auto p-4 space-y-1 font-semibold">
        {members.map((member, idx) => (
          <p
            key={idx}
            className="text-[#414651] cursor-pointer hover:text-[#00007F] transition-colors duration-200"
            onClick={() => onMemberClick(member)}
          >
            {member.name}
          </p>
        ))}
      </div>
    </div>
  );
};

// MentorDetails Popup Component (Adapted from NewDashboard)
const MentorDetails = ({ mentor, onClose }) => (
  <div
    className="
      w-full max-w-md md:max-w-lg lg:max-w-xl
      bg-white rounded-2xl
      shadow-[0px_4px_17px_rgba(0,73,198,0.2)]
      flex flex-col justify-between
      mx-auto my-8
    "
  >
    {/* Header + fields */}
    <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-8">
      <h2
        className="
          font-poppins font-medium 
          text-lg sm:text-xl md:text-2xl lg:text-3xl 
          leading-snug
        "
      >
        {mentor.usertype} Details
      </h2>

      <div
        className="
          mt-6 md:mt-8
          grid grid-cols-[auto_auto_1fr]
          gap-x-4 gap-y-4 md:gap-x-6 md:gap-y-6
          items-center
          font-poppins
        "
      >
        {[
          ['Name', mentor.name],
          ['Email', mentor.email],
          ['Phone', mentor.PhNumber],
          ['Location', mentor.location],
          [
            'Designation',
            mentor.Designation ? mentor.Designation.join(', ') : 'N/A',
          ],
        ].map(([label, value]) => (
          <React.Fragment key={label}>
            <span
              className="
                text-sm sm:text-base md:text-lg 
                font-normal leading-relaxed
              "
            >
              {label}
            </span>
            <span
              className="
                text-sm sm:text-base md:text-lg 
                font-normal leading-relaxed
              "
            >
              :
            </span>
            <span
              className="
                text-sm sm:text-base md:text-lg 
                font-normal leading-relaxed
              "
            >
              {value}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>

    {/* Close button */}
    <button
      onClick={onClose}
      className="
        mt-6 md:mt-8 mb-6 sm:mb-8
        px-6 py-3 sm:px-8 sm:py-4
        bg-[#00007F] rounded-lg
        text-sm sm:text-base md:text-lg lg:text-xl
        leading-none text-white
        font-poppins font-normal
        self-center
      "
    >
      Close
    </button>
  </div>
);

// Default data arrays (for fallback)
const defaultBDEData = [];
const defaultMentorData = [];
const defaultProgramManagerData = [];

const EmployeesData = () => {
  const [bdeData, setBdeData] = useState(defaultBDEData);
  const [mentorData, setMentorData] = useState(defaultMentorData);
  const [programManagerData, setProgramManagerData] = useState(
    defaultProgramManagerData
  );
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchCounts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/adminsdata`
      );
      const { BDE, Mentors, Managers } = response.data;

      setBdeData(BDE || []);
      setMentorData(Mentors || []);
      setProgramManagerData(Managers || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report counts:', error);
      setBdeData(defaultBDEData);
      setMentorData(defaultMentorData);
      setProgramManagerData(defaultProgramManagerData);
      setLoading(false);
    }
  };

  // Fetch data from API
  useEffect(() => {
    fetchCounts();
  }, []);

  // Filtered data based on location
  const getFilteredData = data =>
    locationFilter
      ? data.filter(item => item.location === locationFilter)
      : data;

  const filteredBDE = getFilteredData(bdeData);
  const filteredMentors = getFilteredData(mentorData);
  const filteredProgramManagers = getFilteredData(programManagerData);

  // Handle modal
  const handleUserClick = user => setSelectedUser(user);
  const handleModalClose = () => setSelectedUser(null);

  // Card data for rendering
  const cardData = [
    {
      title: 'BDE',
      members: filteredBDE,
      total: filteredBDE.length,
    },
    {
      title: 'Mentor',
      members: filteredMentors,
      total: filteredMentors.length,
    },
    {
      title: 'Program Managers',
      members: filteredProgramManagers,
      total: filteredProgramManagers.length,
    },
  ];

  return (
    <section className="font-[inter] lg:px-4">
      <div className="flex flex-col space-y-2 lg:space-y-4">
        <h1 className="text-[#00007F] font-semibold text-lg md:text-xl xl:text-2xl text-center">
          Employees
        </h1>

        {/* Filter Row */}
        {loading ? (
          <p className="text-gray-500 text-center">Loading data...</p>
        ) : (
          <div className="flex items-center gap-x-4 p-4 rounded-2xl">
            <label className="w-[151px] h-[28px] font-[inter] font-semibold text-[18px] leading-[28px] text-[#414651]">
              Filter by Location
            </label>
            <div className="relative w-[240px] h-[50px] bg-white rounded-[5px] px-5 py-[10px] flex items-center justify-between">
              <select
                name="location"
                id="location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full appearance-none bg-transparent font-[inter] text-[16px] leading-[19px] font-medium text-black focus:outline-none pr-6"
              >
                <option value="">Location</option>
                {[
                  ...new Set(
                    [...bdeData, ...mentorData, ...programManagerData].map(
                      item => item.location
                    )
                  ),
                ].map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-[14px] h-[14px] text-black pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cardData.map((card, idx) => (
              <Card
                key={idx}
                title={card.title}
                members={card.members}
                total={card.total}
                onMemberClick={handleUserClick}
              />
            ))}
          </div>
        )}

        {/* Popup Overlay */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <MentorDetails mentor={selectedUser} onClose={handleModalClose} />
          </div>
        )}
      </div>
    </section>
  );
};

export default EmployeesData;
