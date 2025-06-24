import React from 'react';

const Dhanekula = () => {
  return (
    <div className="w-full bg-white p-6 md:p-12 grid grid-cols-1 md:grid-cols-[30%_60%] gap-2 items-center">
      <div className="flex justify-center">
        <img
          src="/images/DIET-Web-Icon.webp"
          alt="Dhanekula Institute Logo"
          className="w-full max-w-xs object-contain"
        />
      </div>

      <div className="text-gray-800 text-justify ">
        <h2 className="text-sm md:text-2xl  mb-4 ">
          <span className="text-black ">
            {' '}
            Dhanekula Institute of Engineering and Technology{' '}
          </span>
          Established in 2009 at Ganguru, Vijayawada, Krishna District, the
          institute was founded by Sri Dhanekula Ravindranadh Tagore — a
          visionary known for his contributions to agriculture, industry, and
          social upliftment. With a learner-centered teaching approach and a
          commitment to global standards, the institute aspires to become a hub
          of technical excellence for the developing world. The institution
          integrates real-life application with education, aiming to empower
          students through innovative methodologies, practical exposure, and the
          skills needed to meet tomorrow’s employment challenges.
        </h2>
      </div>
    </div>
  );
};

export default Dhanekula;
