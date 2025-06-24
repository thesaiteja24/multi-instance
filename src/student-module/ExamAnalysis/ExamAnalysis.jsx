import { useEffect, useState } from 'react';
import QuestionBreakDown from './QuestionBreakDown';
import DoughnutChart from './DoughnutChart';
import Attempted from './Attempted';
import SubjectBreakdown from './SubjectBreakdown';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Confetti from 'react-confetti';
import { Loader } from 'lucide-react';

export const ExamAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const exam = location.state?.exam || null; // from DailyReports
  const submissionResult = location.state?.analysis || null; // from a fresh submission
  const isReports = location.state?.isReports || false;

  const analysisData = exam || submissionResult;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no valid data, redirect immediately
    if (!analysisData || !analysisData.analysis) {
      toast.info(
        'No exam analysis data available. Redirecting to dashboard...'
      );
      navigate('/student/reports/daily');
      return;
    }

    // valid data → stop loading
    setIsLoading(false);
  }, [analysisData, navigate]);

  // While loading, show a full-screen spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="animate-spin w-16 h-16 text-gray-500" />
        <span className="ml-4 text-lg font-medium text-gray-600">
          Loading analysis...
        </span>
      </div>
    );
  }

  // Now data is guaranteed to exist
  const analysis = analysisData.analysis;
  const examName = exam ? exam.examName : 'Exam Submission';

  const incorrectAnswers =
    analysis.incorrectCount ??
    analysis.totalQuestions -
      analysis.correctCount -
      analysis.notAttemptedCount;

  const percentageScore = Math.round(
    (analysis.correctCount / analysis.totalQuestions) * 100
  );

  const subjectBreakdown = analysis.subjectBreakdown || {};

  return (
    <div className="min-h-screen px-4 py-5 font-[Inter]">
      {/* Confetti for high scorers */}
      {percentageScore >= 80 && !isReports && (
        <Confetti numberOfPieces={3500} recycle={false} />
      )}

      {/* Back button */}
      <div className="mt-6 flex gap-4">
        <button
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded hover:bg-[#0f153f] flex items-center gap-2"
          onClick={() => {
            const dest = isReports
              ? examName.toLowerCase().includes('daily')
                ? '/student/reports/daily'
                : '/student/reports/weekly'
              : '/student/exam-dashboard';
            navigate(dest);
          }}
        >
          <FaArrowLeft size={20} />
          Back to {isReports ? 'Reports' : 'Dashboard'}
        </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-secondary)] text-center mt-5 mb-3">
        {examName} Analysis
      </h1>
      <hr />

      <div className="p-2 md:p-4 space-y-6">
        <div className="grid md:grid-cols-10 gap-x-6">
          <div className="md:col-span-7">
            <DoughnutChart
              totalQuestions={analysis.totalQuestions}
              correctAnswers={analysis.correctCount}
              incorrectAnswers={incorrectAnswers}
              totalScore={analysis.totalScore}
            />
          </div>
          <div className="md:col-span-3">
            <Attempted
              attemptedMCQ={analysis.attemptedMCQCount}
              attemptedCode={analysis.attemptedCodeCount}
            />
          </div>
        </div>

        {Object.keys(subjectBreakdown).length > 0 && (
          <SubjectBreakdown subjectBreakdown={subjectBreakdown} />
        )}

        {/* Attempted Questions */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
            Attempted Questions
          </h2>
          <QuestionBreakDown details={analysis.details} />
        </div>

        {/* Not Attempted Questions */}
        {analysis.notAttemptedDetails?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
              Not Attempted Questions
            </h2>
            <QuestionBreakDown details={analysis.notAttemptedDetails} />
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="flex justify-center">
          <button
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded hover:bg-[#0f153f] flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={20} />
            Back to {isReports ? 'Reports' : 'Dashboard'}
          </button>
        </div>

        {/* Any submission message */}
        {submissionResult?.message && (
          <p className="text-center text-lg font-medium mt-4">
            {submissionResult.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExamAnalysis;
