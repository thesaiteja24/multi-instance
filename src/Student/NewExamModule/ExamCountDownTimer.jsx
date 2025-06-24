import React, { useState, useEffect, useRef } from 'react';

const ExamCountdownTimer = ({
  startDate,
  startTime,
  totalExamTime,
  currentTime,
  onCountdownEnd,
}) => {
  const calculateTimeLeft = () => {
    if (
      !currentTime ||
      !(currentTime instanceof Date) ||
      isNaN(currentTime.getTime())
    ) {
      return 0;
    }
    const examStart = new Date(`${startDate}T${startTime}`);
    if (isNaN(examStart.getTime())) {
      return 0;
    }
    const diff = examStart - currentTime;
    return diff > 0 ? diff : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const hasEnded = useRef(false); // Prevent multiple onCountdownEnd calls

  useEffect(() => {
    const remaining = calculateTimeLeft();
    setTimeLeft(remaining);

    if (remaining <= 0 && !hasEnded.current && onCountdownEnd) {
      hasEnded.current = true;
      onCountdownEnd();
    } else if (remaining > 0) {
      hasEnded.current = false; // Reset if countdown restarts
    }
  }, [currentTime, startDate, startTime, onCountdownEnd]);

  // Format the milliseconds into hours, minutes, and seconds
  let hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  // Cap hours at 24 (display 24+ hours as 24:00:00)
  if (hours > 24) {
    hours = 24;
  }

  // Helper to ensure two-digit formatting
  const pad = num => num.toString().padStart(2, '0');

  return (
    <div className="bg-[#19216F] text-white font-semibold text-xl rounded-lg px-5 py-2.5 text-center">
      {timeLeft <= 0
        ? 'Exam Started'
        : `${hours}:${pad(minutes)}:${pad(seconds)}`}
    </div>
  );
};

export default ExamCountdownTimer;
