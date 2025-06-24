import React, { useState } from 'react';

const SubjectBreakdown = ({ subjectBreakdown }) => {
  // State for selected subject and dropdown visibility
  const [selectedSubject, setSelectedSubject] = useState(
    Object.keys(subjectBreakdown)[0] || 'No Subject'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get list of subjects from subjectBreakdown
  const subjects = Object.keys(subjectBreakdown);

  // Handle subject selection
  const handleSubjectSelect = subject => {
    setSelectedSubject(subject);
    setIsDropdownOpen(false);
  };

  // Get data for the selected subject
  const selectedData = subjectBreakdown[selectedSubject] || {
    attempted: 0,
    mcq: { score: 0, total: 0 },
    coding: { score: 0, total: 0 },
    score: 0,
    totalQuestions: 0,
  };

  // Determine if coding sections should be shown
  const showCodingSections =
    selectedData.coding.total > 0 || selectedData.coding.score > 0;

  // Set grid columns and dividers based on whether coding sections are shown
  const gridColsClass = showCodingSections ? 'grid-cols-6' : 'grid-cols-4';
  const dividerCount = showCodingSections ? 5 : 3;

  return (
    <div className="w-full flex justify-center py-10 font-[Inter]">
      <div className="w-full max-w-full bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-[20px] p-6 md:p-10 space-y-6">
        {/* Heading */}
        <h2 className="text-[25px] leading-[30px] font-semibold text-[var(--color-secondary)]">
          Subject-wise Breakdown
        </h2>

        {/* Divider */}
        <div className="w-full h-px border-t border-[#D1D1D1]"></div>

        {/* Select Subject */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="text-[var(--color-secondary)] font-medium text-[18.8px] leading-[66px]">
            Select Subject
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-[215px] h-[43px] px-4 bg-white shadow-[0px_3.76px_3.76px_rgba(0,0,0,0.25)] rounded-[10px] text-left"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="text-[15px] text-black">{selectedSubject}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  isDropdownOpen ? 'rotate-90' : '-rotate-90'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <ul
                className="absolute z-10 mt-2 w-[215px] bg-white shadow-[0px_3.76px_3.76px_rgba(0,0,0,0.25)] rounded-[10px] max-h-[200px] overflow-y-auto"
                role="listbox"
              >
                {subjects.map(subject => (
                  <li
                    key={subject}
                    onClick={() => handleSubjectSelect(subject)}
                    className="px-4 py-2 text-[15px] text-black hover:bg-[#EFF3FF] cursor-pointer"
                    role="option"
                    aria-selected={selectedSubject === subject}
                  >
                    {subject}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Score Breakdown Box - Single Row */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] bg-[#EFF3FF] border border-[#00007F] rounded-[20px] p-4 relative">
            <div className={`grid ${gridColsClass} text-center`}>
              {/* Column 1: Attempted */}
              <div className="px-4 flex flex-col  justify-between   items-center">
                <p className="text-[15px] font-medium text-black">Attempted</p>
                <p className="text-[32px] font-bold text-black">
                  {selectedData.attempted}
                </p>
              </div>
              {/* Column 2: MCQ Score */}
              <div className="px-4 flex flex-col justify-between   items-center">
                <p className="text-[15px] font-medium text-black">MCQ Score</p>
                <p className="text-[32px] font-bold text-black">
                  {selectedData.mcq.score}
                </p>
              </div>

              {showCodingSections && (
                <>
                  {/* Column 5: Coding Score */}
                  <div className="px-4 flex flex-col justify-between  items-center">
                    <p className="text-[15px] font-medium text-black">
                      Coding Score
                    </p>
                    <p className="text-[32px] font-bold text-black">
                      {selectedData.coding.score}
                    </p>
                  </div>
                </>
              )}

              {/* Column 3: Total Score */}

              {/* Column 4: Total MCQs */}
              <div className="px-4 flex flex-col justify-between  items-center">
                <p className="text-[15px] font-medium text-black">Total MCQs</p>
                <p className="text-[32px] font-bold text-black">
                  {selectedData.mcq.total}
                </p>
              </div>
              {/* Conditional Coding Columns */}
              {showCodingSections && (
                <>
                  {/* Column 5: Coding Score */}

                  {/* Column 6: Total Coding Questions */}
                  <div className="px-4 flex flex-col  justify-between  items-center">
                    <p className="text-[15px] font-medium text-black">
                      Total Coding Questions
                    </p>
                    <p className="text-[32px] font-bold text-black">
                      {selectedData.coding.total}
                    </p>
                  </div>
                </>
              )}

              <div className="px-4 flex flex-col justify-between   items-center">
                <p className="text-[15px] font-medium text-black">
                  Total Score
                </p>
                <p className="text-[32px] font-bold text-black">
                  {selectedData.score}
                </p>
              </div>

              {/* Custom Divider Lines */}
              {Array.from({ length: dividerCount }).map((_, index) => (
                <div
                  key={`divider-${index}`}
                  className="absolute top-0 bottom-0 w-[1px] bg-[var(--color-secondary)]"
                  style={{
                    left: `${((index + 1) / (dividerCount + 1)) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectBreakdown;
