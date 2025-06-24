import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  totalScore,
}) => {
  const data = {
    labels: ['Total Questions', 'Correct Answers', 'Incorrect Answers'],
    datasets: [
      {
        data: [totalQuestions, correctAnswers, incorrectAnswers],
        backgroundColor: ['#19216f', '#13A725', '#ED1334'],
        hoverBackgroundColor: ['#19216f', '#13A725', '#ED1334'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row justify-around items-center bg-white rounded-2xl shadow-lg w-full max-w-5xl mx-auto p-4 sm:p-6 mb-4">
      {/* Chart */}
      <div className="relative w-full max-w-[16rem] sm:max-w-[20rem]  h-56 sm:h-64 mb-6 lg:mb-0 lg:mr-6">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-black font-semibold text-lg sm:text-xl">
            Total Score
          </p>
          <p className="text-black font-bold text-2xl sm:text-3xl">
            {totalScore}
          </p>
        </div>
      </div>

      {/* Legend & Scores */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="flex items-center gap-3 pb-2 border-b border-[#DBCCCC]">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-[var(--color-primary)] flex-shrink-0"></div>
          <div className="flex w-full justify-between items-center">
            <p className="text-black text-base  xl:text-[19px] font-semibold">
              Total Questions
            </p>
            <span className="font-bold text-2xl sm:text-3xl">
              {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-2 border-b border-[#DBCCCC]">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-[#13A725] flex-shrink-0"></div>
          <div className="flex w-full justify-between items-center">
            <p className="text-black text-base sm:text-[19px] font-semibold">
              Correct Answers
            </p>
            <span className="font-bold text-2xl sm:text-3xl">
              {correctAnswers}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-2 border-b border-[#DBCCCC]">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-[#ED1334] flex-shrink-0"></div>
          <div className="flex w-full justify-between items-center">
            <p className="text-black text-base sm:text-[19px] font-semibold">
              Incorrect Answers
            </p>
            <span className="font-bold text-2xl sm:text-3xl">
              {incorrectAnswers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;
