import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSadTear } from 'react-icons/fa';
import { IoMdStar } from 'react-icons/io'; // Import IoMdStar
import { useSelector } from 'react-redux';

const SubjectMappings = {
  PFS: ['Python', 'Flask', 'Frontend', 'SoftSkills', 'MySQL', 'Aptitude'],
  JFS: ['Java', 'AdvancedJava', 'Frontend', 'SoftSkills', 'MySQL', 'Aptitude'],
  DA: [
    'Python',
    'MySQL',
    'SoftSkills',
    'Aptitude',
    'Statistics',
    'Data Analytics',
  ],
  DS: [
    'Python',
    'MySQL',
    'SoftSkills',
    'Aptitude',
    'Statistics',
    'Data Analytics',
    'Machine Learning',
    'Deep Learning',
  ],
  C: ['C Programming Language'],
  JAVA: ['Java', 'AdvancedJava'],
  PYTHON: ['Python'],
  DSA: ['DSA'],
};

const Subjects = [
  {
    name: 'Python',
    description: 'Learn Python programming from basics to advanced.',
    image: '/curriculum/phyton.webp',
    rating: 5,
  },
  {
    name: 'Java',
    description: 'Master Java programming concepts with practical examples.',
    image: '/curriculum/java.webp',
    rating: 5,
  },
  {
    name: 'AdvancedJava',
    description: 'Deep dive into advanced Java programming concepts.',
    image: '/curriculum/java.webp',
    rating: 5,
  },
  {
    name: 'Frontend',
    description:
      'Build dynamic and responsive UI using modern frontend technologies.',
    image: '/curriculum/FrontEnd.webp',
    rating: 5,
  },
  {
    name: 'MySQL',
    description: 'Learn database management and SQL queries with MySQL.',
    image: '/curriculum/sql.webp',
    rating: 5,
  },
  {
    name: 'Flask',
    description: 'Master web development using the Flask framework in Python.',
    image: '/curriculum/flask.webp',
    rating: 5,
  },
  {
    name: 'SoftSkills',
    description: 'Enhance your communication and teamwork skills.',
    image: '/curriculum/softskills.webp',
    rating: 5,
  },
  {
    name: 'Aptitude',
    description: 'Sharpen your logical reasoning and problem-solving skills.',
    image: '/curriculum/Aptitude.webp',
    rating: 5,
  },
  {
    name: 'Statistics',
    description:
      'Understand data distributions, probability, and statistical methods.',
    image: '/curriculum/statistics.webp',
    rating: 5,
  },
  {
    name: 'Machine Learning',
    description:
      'Build intelligent systems that learn from data using ML algorithms.',
    image: '/curriculum/dataanalytics.webp',
    rating: 5,
  },
  {
    name: 'Deep Learning',
    description: 'Explore neural networks and deep learning frameworks for AI.',
    image: '/curriculum/dataanalytics.webp',
    rating: 5,
  },
  {
    name: 'Data Science',
    description: 'Explore data science concepts and tools to derive insights.',
    image: '/curriculum/datascience.webp',
    rating: 5,
  },
  {
    name: 'Data Analytics',
    description: 'Learn how to analyze data and make data-driven decisions.',
    image: '/curriculum/dataanalytics.webp',
    rating: 5,
  },
  {
    name: 'C Programming Language',
    description:
      'Learn the basics and advanced concepts of the C programming language.',
    image: '/curriculum/c.webp',
    rating: 5,
  },
  {
    name: 'DSA',
    description:
      'Master fundamental and advanced concepts of Data Structures and Algorithms using the C programming language.',
    image: '/curriculum/datastructures.webp',
  },
];

const Courses = () => {
  const { studentDetails, loading } = useSelector(state => state.student);
  const navigate = useNavigate();
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    if (studentDetails?.BatchNo) {
      const batchPrefix = studentDetails.BatchNo.split('-')[0];
      const subjectsForBatch = SubjectMappings[batchPrefix] || [];
      const filtered = Subjects.filter(subject =>
        subjectsForBatch.includes(subject.name)
      );
      setFilteredSubjects(filtered);
    }
  }, [studentDetails]);

  const handleSubjectClick = subject => {
    navigate(
      `/student/courses/${subject.name.toLowerCase().replace(/ /g, '-')}`,
      {
        state: { subject },
      }
    );
  };

  // Function to render star ratings using IoMdStar
  const renderStars = rating => {
    const totalStars = 5;
    const stars = [];
    for (let i = 0; i < totalStars; i++) {
      stars.push(
        <IoMdStar
          key={i}
          className={`text-[1.5rem] ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  // Check if student is in DROPOUTS batch
  const isDropout =
    studentDetails?.BatchNo === 'DROPOUTS' ||
    studentDetails?.BatchNo?.startsWith('DROPOUTS-');

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-gray-100 font-['Inter']">
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <div className="flex flex-col items-center gap-[1rem]">
          <div className="w-[3rem] h-[3rem] border-[0.25rem] border-t-[0.25rem] border-[var(--color-secondary)] border-solid rounded-full animate-[spin_1s_linear_infinite]"></div>
          <p className="text-[1.125rem] font-semibold text-[var(--color-secondary)]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isDropout) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center">
        <div className="bg-white shadow-[0_0.25rem_1.25rem_#B3BAF7] rounded-[0.5rem] p-[1.5rem] max-w-[37.5rem] text-center">
          <FaSadTear className="text-[var(--color-secondary)] text-[4.5rem] mx-auto mb-[1rem]" />
          <h2 className="text-[1.875rem] font-semibold text-[var(--color-secondary)] font-['Inter'] mb-[0.5rem]">
            Your Dropout
          </h2>
          <p className="text-gray-600 text-[1.25rem] font-['Inter']">
            You are currently in the DROPOUTS batch. Please contact support for
            further assistance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-[1rem] py-[1.5rem] sm:px-[1.5rem] sm:py-[2rem] lg:px-[2.5rem] lg:py-0 font-['Inter']">
      <div className="text-center mb-[2rem]">
        <h1 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.875rem] font-semibold text-[var(--color-secondary)]">
          Student Curriculum
        </h1>
        <p className="text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] text-gray-600 mt-[0.5rem]">
          Explore your learning modules and resources
        </p>
      </div>
      {filteredSubjects.length === 0 ? (
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center">
          <div className="bg-white shadow-[0_0.25rem_1.25rem_#B3BAF7] rounded-[0.5rem] p-[1.5rem] max-w-[37.5rem] text-center">
            <FaSadTear className="text-[var(--color-secondary)] text-[3.125rem] mx-auto mb-[1rem]" />
            <h2 className="text-[1.25rem] font-semibold text-[var(--color-secondary)] mb-[0.5rem]">
              No Subjects Available
            </h2>
            <p className="text-gray-600 text-[1rem]">
              No subjects are available for your batch. Please contact support
              for assistance.
            </p>
            <button
              onClick={() => (window.location.href = '/contact-support')}
              className="mt-[1rem] bg-[var(--color-secondary)] text-white px-[1rem] py-[0.5rem] rounded-[0.5rem] font-semibold hover:bg-[#0f1a5b]"
            >
              Contact Support
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-[1.5rem] w-full max-w-[100rem] grid-cols-[repeat(auto-fit,minmax(18.125rem,1fr))]">
          {filteredSubjects.map((subject, index) => (
            <div
              key={index}
              className="bg-white rounded-[0.8125rem] shadow-lg overflow-hidden w-full mx-auto flex flex-col"
              style={{ height: '19.6875rem' }}
              onClick={() => handleSubjectClick(subject)}
            >
              <img
                src={subject.image}
                alt={`${subject.name} Curriculum`}
                className="w-full h-[12rem] object-cover"
                onError={e => {
                  e.target.src = '/curriculum/placeholder.webp';
                }}
              />
              <div className="flex flex-col px-[1.5rem] py-[1rem] space-y-[1rem]">
                <div className="flex justify-between items-center">
                  <p className="text-[1rem] font-semibold text-gray-800 truncate">
                    {subject.name}
                  </p>
                  <div className="flex flex-shrink-0">
                    {renderStars(subject.rating)}
                  </div>
                </div>
                <button
                  className="bg-[var(--color-secondary)] text-[#FFFFFF] text-[1rem] w-full py-[0.5rem] rounded-[0.625rem] hover:bg-[#0f1a5b] transition-colors"
                  onClick={e => {
                    e.stopPropagation();
                    handleSubjectClick(subject);
                  }}
                >
                  Know More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
