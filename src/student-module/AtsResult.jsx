import React from 'react';
// import { useLocation } from "react-router-dom";

const AtsResult = analysis => {
  // const location = useLocation();
  const analysisData = analysis.analysis;
  const score = analysisData.ats_score || 'Score Not Available';
  const feedbackSections = analysisData.feedback_sections || {
    'Skills Feedback': 'Null',
    'Sections Feedback': 'Null',
    'Formatting Feedback': 'Null',
  };
  const extractedSkills =
    analysisData.extracted_skills || 'Skills Not Available';
  const missingSkills =
    analysisData.suggesting_skills || 'Skills Not Available';
  const wordCount = analysisData.word_count || 'Count Not Available';

  const getScoreStatus = () => {
    if (score === null || score === undefined)
      return { text: 'No Score Available', color: 'text-gray-500' };
    if (score >= 75)
      return { text: 'Excellent Match', color: 'text-green-600' };
    if (score >= 50) return { text: 'Good Match', color: 'text-yellow-500' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  };

  const status = getScoreStatus();

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-blue-700 to-blue-500 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Resume Analysis Results
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-4 mt-2">
        {/* Score Section */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-700">
            {score ?? 'N/A'}
          </div>
          <div
            className={`text-lg sm:text-xl mt-2 font-semibold ${status.color}`}
          >
            {status.text}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feedback Section */}
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Detailed Feedback
            </h2>
            {feedbackSections ? (
              Object.entries(feedbackSections).map(([section, feedback]) => (
                <div key={section} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-blue-700 font-semibold">{section}</h3>
                  <p className="text-sm sm:text-base">{feedback}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No feedback available.</p>
            )}
          </div>

          {/* Skills Analysis */}
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Skills Analysis
            </h2>

            {/* Extracted Skills */}
            <div>
              <h3 className="text-blue-700 font-semibold text-xl">
                Extracted Skills
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {extractedSkills?.length ? (
                  extractedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No extracted skills found.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h3 className="text-green-700 font-semibold text-xl">
                Suggesting Skills
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {missingSkills?.length ? (
                  missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#66CCFF] text-black px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No missing skills identified.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Words Section */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold mb-2">
            Total Words in Resume
          </h2>
          <p className="text-2xl sm:text-3xl text-gray-700">{wordCount}</p>
        </div>
      </main>
    </div>
  );
};

export default AtsResult;
