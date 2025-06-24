import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  return (
    <div
      className="box-border flex flex-col justify-end items-center p-4 sm:p-5 gap-4 sm:gap-5 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-[#F9F9F9] border border-[#D5D7DA] shadow-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        navigate(`/student/code-playground/${course.language}`);
      }}
    >
      <div className="flex flex-col items-start gap-3 sm:gap-4 w-full flex-1">
        <div className="flex flex-col items-start gap-2 sm:gap-3 w-full">
          <div className="flex flex-row justify-start items-start gap-2 w-full">
            <h3 className="text-[#414651] font-['Inter'] truncate font-semibold text-[20px] sm:text-2xl leading-tight w-full">
              {course.title}
            </h3>
          </div>
          <div className="flex flex-row justify-start items-start gap-2 w-full">
            <p className="text-[#535862] font-['Inter'] text-ellipsis truncate font-medium text-sm sm:text-base leading-relaxed w-full">
              {course.subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:gap-3 w-full">
          <div className="flex flex-row items-center gap-1 sm:gap-2 w-full">
            <span className="w-5 h-5 sm:w-6 ml-1 sm:h-6 text-[#717680] text-sm sm:text-base">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 18 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.1667 12.8337L16 7.00033L10.1667 1.16699M2 12.8337L7.83333 7.00033L2 1.16699"
                  stroke="#717680"
                  strokeWidth="2.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[#717680] font-['Inter'] font-medium text-sm sm:text-base leading-tight">
              {course.language}
            </span>
          </div>
          <div className="flex flex-row items-center gap-1 sm:gap-2 w-full">
            <span className="w-5 h-5 sm:w-6 ml-1 sm:h-6 text-[#717680] text-sm sm:text-base">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
                  stroke="#717680"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.7089 15.1798L12.6089 13.3298C12.0689 13.0098 11.6289 12.2398 11.6289 11.6098V7.50977"
                  stroke="#717680"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[#717680] font-['Inter'] font-medium text-sm sm:text-base leading-tight">
              {course.time}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center gap-2 w-full">
        <button className="flex flex-row justify-center items-center p-3 sm:p-4 gap-2 w-full bg-[#2333CB] border border-[#2333CB] shadow-sm rounded-lg hover:bg-[#1b2ca6] transition-colors">
          <span className="text-[#FFFFFF] font-['Inter'] font-semibold text-sm sm:text-base leading-tight">
            Start
          </span>
          <span className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFFFFF] text-sm sm:text-base">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 2C6.99 2 2.5 6.49 2.5 12C2.5 17.51 6.99 22 12.5 22C18.01 22 22.5 17.51 22.5 12C22.5 6.49 18.01 2 12.5 2ZM15.29 12.53L11.76 16.06C11.61 16.21 11.42 16.28 11.23 16.28C11.04 16.28 10.85 16.21 10.7 16.06C10.41 15.77 10.41 15.29 10.7 15L13.7 12L10.7 9C10.41 8.71 10.41 8.23 10.7 7.94C10.99 7.65 11.47 7.65 11.76 7.94L15.29 11.47C15.59 11.76 15.59 12.24 15.29 12.53Z"
                fill="white"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

const CodePlaygroundHome = () => {
  const { studentDetails } = useSelector(state => state.student);
  const defaultCourses = [
    {
      title: 'C Programming Essentials',
      subtitle: 'Explore the foundations of C language',
      language: 'C',
      time: 'No Time Limit',
    },
    {
      title: 'Data Structures with C',
      subtitle: 'Master core concepts of data structures',
      language: 'DS-C',
      time: 'No Time Limit',
    },
    {
      title: 'Python Programming',
      subtitle: 'Dive into Python essentials for development',
      language: 'Python',
      time: 'No Time Limit',
    },
  ];

  const courses = studentDetails?.subjects
    ? studentDetails.subjects.map(subject => {
        const defaultCourse = defaultCourses.find(
          c => c.language === subject
        ) || {
          title: `${subject} Course`,
          subtitle: `Explore ${subject} curriculum`,
          language: subject,
          time: 'No Time Limit',
        };
        return defaultCourse;
      })
    : defaultCourses;

  return (
    <div className="p-6">
      <div className="box-border flex flex-col items-start p-4 sm:p-6 md:p-8 lg:p-10 gap-6 sm:gap-8 w-full mx-auto my-4 sm:my-6 md:my-8 bg-[#F9F9F9] border border-[#E1E1E1] shadow-md rounded-2xl">
        <div className="flex flex-col items-start p-4 sm:p-5 gap-3 sm:gap-4 w-full">
          <div className="flex flex-col items-start gap-3 sm:gap-4 w-full">
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
              <span className="text-[#535862] font-['Inter'] font-medium text-xl sm:text-2xl md:text-3xl leading-tight text-center">
                Hi {studentDetails?.name || 'Student'},
              </span>
              <span className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-[#535862] text-lg sm:text-xl">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 33 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.668 19.417C10.668 19.417 12.8555 22.3337 16.5013 22.3337C20.1471 22.3337 22.3346 19.417 22.3346 19.417M20.8763 12.1253H20.8909M12.1263 12.1253H12.1409M31.0846 16.5003C31.0846 24.5545 24.5555 31.0837 16.5013 31.0837C8.44715 31.0837 1.91797 24.5545 1.91797 16.5003C1.91797 8.44617 8.44715 1.91699 16.5013 1.91699C24.5555 1.91699 31.0846 8.44617 31.0846 16.5003ZM21.6055 12.1253C21.6055 12.528 21.279 12.8545 20.8763 12.8545C20.4736 12.8545 20.1471 12.528 20.1471 12.1253C20.1471 11.7226 20.4736 11.3962 20.8763 11.3962C21.279 11.3962 21.6055 11.7226 21.6055 12.1253ZM12.8555 12.1253C12.8555 12.528 12.529 12.8545 12.1263 12.8545C11.7236 12.8545 11.3971 12.528 11.3971 12.1253C11.3971 11.7226 11.7236 11.3962 12.1263 11.3962C12.529 11.3962 12.8555 11.7226 12.8555 12.1253Z"
                    stroke="#535862"
                    strokeWidth="2.91667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <h1 className="text-[#252B37] font-['Inter'] font-semibold text-[40px] sm:text-4xl md:text-5xl leading-tight w-full">
              Welcome Back
            </h1>
          </div>
          <p className="text-[#414651] font-['Inter'] font-medium text-base sm:text-lg md:text-xl leading-relaxed w-full">
            Dive into curated coding modules, complete sessions, and celebrate
            your progress. Engage with structured modules, track completions,
            and stay ahead in your journey.
          </p>
        </div>
        <div className="flex flex-col items-start p-4 sm:p-5 gap-6 sm:gap-8 w-full flex-1">
          <div className="flex flex-col items-start gap-3 sm:gap-4 w-full">
            <div className="flex flex-row items-center gap-6 sm:gap-8 w-full">
              <div className="flex flex-col items-start gap-2 sm:gap-3 w-full">
                <h2 className="text-[#2333CB] font-['Inter'] font-medium text-lg sm:text-xl md:text-2xl leading-tight w-full">
                  Sessions
                </h2>
                <div className="flex flex-row items-start w-full h-1">
                  <div className="w-16 sm:w-20 md:w-24 h-1 bg-[#2333CB] rounded-l-md"></div>
                  <div className="flex-1 h-1 bg-[#E9EAEB] rounded-r-md"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start gap-4 sm:gap-6 w-full">
            {courses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlaygroundHome;
