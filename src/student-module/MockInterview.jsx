import { useState } from 'react';

function MockInterview() {
  const [showInterview, setShowInterview] = useState(false);

  return (
    <div className="flex items-center justify-center px-[2rem] py-[1rem] font-[inter]">
      {/* Bigger White Box (Rectangle 249) */}
      <div className="m-[0.25rem] relative w-full rounded-[0.5rem] flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-[2.25rem] font-bold">
          <span className="text-[var(--color-secondary)]">Advanced</span>
          <span className="text-red-600"> AI MockInterview </span>
          <span className="text-[var(--color-secondary)]">Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mt-[0.25rem] text-[1.125rem]">
          Sharpen your skills with real-time AI-driven interviews and get
          job-ready!
        </p>

        {/* Conditionally Show Image or Interview */}
        {!showInterview ? (
          <>
            {/* Image */}
            <div
              className="rounded-[0.5rem] w-full p-[1.25rem]"
              // style={{ boxShadow: '0 0.25rem 1.25rem 0 #B3BAF7' }}
            >
              <div className="flex justify-center pl-[2.5rem]">
                <img
                  src="/aimock.png"
                  alt="AI Mock Interview"
                  className="w-full max-w-[42rem] mt-[2rem]"
                />
              </div>

              {/* Call to Action Button */}
              <button
                className="mt-[2rem] mb-[2rem] bg-[var(--color-secondary)] text-white text-[1.125rem] font-medium px-[2rem] py-[0.5rem] rounded-[0.375rem] shadow-md hover:bg-blue-700 transition"
                onClick={() => setShowInterview(true)}
              >
                Start Your Mock Interview
              </button>
            </div>
          </>
        ) : (
          <div className="w-full mt-[2rem] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.2)] border border-gray-200 rounded-[0.5rem] overflow-hidden">
            <div className="bg-[var(--color-secondary)] text-white text-[1.125rem] font-semibold p-[0.75rem] flex justify-between items-center">
              <span>Mock Interview in Progress</span>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-[1rem] py-[0.5rem] rounded-[0.375rem]"
                onClick={() => setShowInterview(false)}
              >
                Close
              </button>
            </div>
            <iframe
              src="https://interview.framewise.ai/?comp_id=codegnan.com"
              title="Mock Interview"
              className="w-full h-[100vh] border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterview;
