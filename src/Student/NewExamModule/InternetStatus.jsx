import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const InternetStatus = () => {
  const [isOnline, setIsOnline] = useState(null);
  const [statusText, setStatusText] = useState('Checking...');
  const [health, setHealth] = useState('Checking...');
  const stableCount = useRef(0);
  const failureCount = useRef(0);

  const testInternet = async () => {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => source.cancel(), 2000); // 2s timeout

    try {
      // Use a CORS-friendly endpoint
      await axios.get('https://jsonplaceholder.typicode.com/todos/1', {
        cancelToken: source.token,
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      clearTimeout(timeout);
      setIsOnline(true);
      setStatusText('Online ✅');

      failureCount.current = 0;
      stableCount.current += 1;

      if (stableCount.current >= 10) setHealth('Excellent');
      else if (stableCount.current >= 5) setHealth('Good');
      else setHealth('Fair');
    } catch (error) {
      clearTimeout(timeout);
      setIsOnline(false);
      setStatusText('No Internet ❌');

      failureCount.current += 1;
      stableCount.current = 0;

      if (failureCount.current >= 5) setHealth('Offline');
      else if (failureCount.current >= 2) setHealth('Poor');
      else setHealth('Fair');
    }
  };

  useEffect(() => {
    testInternet();
    const interval = setInterval(testInternet, 3000);
    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    switch (health) {
      case 'Excellent':
        return 'bg-green-500';
      case 'Good':
        return 'bg-yellow-400';
      case 'Fair':
        return 'bg-orange-400';
      case 'Poor':
        return 'bg-red-600';
      case 'Offline':
        return 'bg-gray-700';
      default:
        return 'bg-yellow-300'; // Checking...
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 bg-white border rounded-md shadow-sm"
      title="Live Internet Monitoring"
    >
      {/* Blinking Indicator */}
      <div className={`w-3.5 h-3.5 rounded-full animate-pulse ${getColor()}`} />
      {/* Status Text */}
      <div className="flex flex-col text-xs sm:text-sm font-[Inter]">
        <span className={`font-semibold capitalize`}>
          Internet:{' '}
          <span
            className={`${
              health === 'Excellent'
                ? 'text-green-600'
                : health === 'Good'
                  ? 'text-yellow-600'
                  : health === 'Fair'
                    ? 'text-orange-500'
                    : health === 'Poor'
                      ? 'text-red-600'
                      : health === 'Offline'
                        ? 'text-gray-700'
                        : ''
            }`}
          >
            {health}
          </span>
        </span>
      </div>
    </div>
  );
};

export default InternetStatus;
