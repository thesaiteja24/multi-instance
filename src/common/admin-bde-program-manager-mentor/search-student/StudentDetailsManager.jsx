import React from 'react';
import { FaUserGraduate } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';

const StudentDetailsManager = ({ data, profile }) => {
  if (!data) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
          alt="No Student"
          className="w-28 h-28 mb-4 opacity-80"
        />
        <p className="text-xl font-semibold text-gray-600 mb-1">
          No Student Data
        </p>
        <p className="text-gray-500 text-sm">
          Search for a student to see their details here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row items-start w-full p-4 bg-white rounded-lg font-[inter] gap-8 xl:gap-12">
      {/* Profile Image Section (always on top for screens below xl) */}
      <div className="w-full xl:w-[35%] mt-16 flex flex-col items-center justify-center">
        <div className="relative w-[120px] h-[120px] md:w-[170px] md:h-[170px] rounded-full overflow-hidden bg-gray-300 border">
          <img
            src={`data:image/jpeg;base64,${profile}`}
            alt="Student Profile"
            className="w-full h-full object-cover"
            onError={e => (e.target.src = '/logo.png')}
          />
        </div>
        <h2 className="mt-4 text-[20px] md:text-[24px] font-semibold text-black text-center break-words">
          {data.name}
        </h2>
        <p className="mt-1 text-[14px] font-medium text-gray-600 text-center">
          ID: {data.studentId}
        </p>
      </div>

      {/* Divider (visible only in row layout) */}
      <div className="hidden xl:block w-[1px] bg-[#E7E7E7] h-auto self-stretch"></div>

      {/* Information Section */}
      <div className="w-full xl:w-[65%] grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Personal Information */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img
              src="/studentProfile/personalinfo.svg"
              alt="personal"
              className="w-6 h-6"
            />
            <h3 className="text-[var(--color-secondary)] font-bold text-[18px]">
              Personal Information
            </h3>
          </div>
          <div className="space-y-3 leading-8 ">
            {[
              ['Student ID', data.studentId],
              ['Batch No', data.BatchNo],
              ['Email ID', data.email],
              ['Age', data.age],
              ['State', data.state],
              ['Student No', data.studentPhNumber],
              ['Parent No', data.parentNumber],
              [
                'Github',
                data.githubLink ? (
                  <a
                    href={data.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {data.githubLink}
                  </a>
                ) : (
                  'N/A'
                ),
              ],
            ].map(([label, value], idx) => (
              <div
                key={idx}
                className="grid grid-cols-[80px_10px_1fr] gap-2 items-start text-[14px]"
              >
                <span className="font-semibold text-black">{label}</span>
                <span className="font-semibold text-black">:</span>
                <span className="text-gray-600 break-words text-[13px]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img
              src="/studentProfile/academic.svg"
              alt="academic"
              className="w-6 h-6"
            />
            <h3 className="text-[var(--color-secondary)] font-bold text-[18px]">
              Academic Information
            </h3>
          </div>
          <div className="space-y-3 leading-10">
            {[
              ['College', data.collegeName],
              ['USN', data.collegeUSNNumber],
              ['Department', data.department],
              ['Qualification', data.qualification],
              ['Graduation %', data.highestGraduationpercentage + '%'],
              ['Year of Passing', data.yearOfPassing],
              [
                'Skills',
                data.studentSkills?.length
                  ? data.studentSkills.join(', ')
                  : 'N/A',
              ],
            ].map(([label, value], idx) => (
              <div
                key={idx}
                className="grid grid-cols-[100px_10px_1fr] gap-2 items-start text-[14px]"
              >
                <span className="font-semibold text-black inline-block text-nowrap">
                  {label}
                </span>
                <span className="font-semibold text-black">:</span>
                <span className="text-gray-600 break-words text-[13px]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsManager;
