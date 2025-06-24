import React from 'react';

const Attempted = ({ attemptedMCQ, attemptedCode }) => {
  const totalQuestions = attemptedMCQ + attemptedCode;

  return (
    <div className="bg-white border-[#19216f] rounded-2xl shadow-md w-full max-w-2xl lg:h-[300px] mx-auto mb-4 font-[Poppins]">
      {/* Header */}
      <h2 className="bg-[var(--color-primary)] text-white text-center font-semibold text-lg sm:text-xl py-3 rounded-t-2xl">
        Attempted
      </h2>
      <div className="px-4 sm:px-6 pb-8 mt-4">
        {/* MCQ Attempted */}
        <div className="flex justify-between items-center border-b py-3 px-2">
          <span className="text-black text-sm sm:text-base font-medium">
            MCQ’s Attempted
          </span>
          <span className="text-black font-bold text-base sm:text-lg">
            {attemptedMCQ}
          </span>
        </div>

        {/* Coding Attempted */}
        <div className="flex justify-between items-center border-b py-3 px-2">
          <span className="text-black text-sm sm:text-base font-medium">
            Coding Questions Attempted
          </span>
          <span className="text-black font-bold text-base sm:text-lg">
            {attemptedCode}
          </span>
        </div>

        {/* Total Attempted Box */}
        <div className="mt-10 bg-[#F1F3FF] rounded-lg  flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 py-4 px-4">
          <div className="text-lg sm:text-xl font-medium text-black">
            Total Attempted
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-black">
            {totalQuestions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attempted;
