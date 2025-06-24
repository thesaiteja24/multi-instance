// ExamLoader.jsx
import React from 'react';
import { Loader } from 'lucide-react';

const ExamLoader = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
      <div className="bg-white p-6 rounded-lg text-center max-w-sm w-[90%] shadow-lg">
        <Loader className="animate-spin w-12 h-12 text-[#00007F] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#183B56] font-['Inter']">
          Submitting Exam
        </h2>
        <p className="text-gray-600 font-['Inter'] mt-2">
          Please wait while your exam is being submitted...
        </p>
      </div>
    </div>
  );
};

export default ExamLoader;
