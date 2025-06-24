import React, { useState } from 'react';

const InstructionsModal = ({ onClose, onAgree }) => {
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Handler for Agree & Proceed
  const handleAgree = async () => {
    setIsLoading(true); // Start loading

    try {
      // Check mobile screen size and warn
      if (window.innerWidth < 768) {
        const proceed = window.confirm(
          'This exam is optimized for larger screens. Do you want to proceed on mobile?'
        );
        if (!proceed) {
          setIsLoading(false); // Stop loading if user cancels
          return;
        }
      }

      // Uncomment and use this if you want to re-enable webcam access
      /*
      const hasAccess = await requestWebcamAccess();
      if (!hasAccess) {
        setIsLoading(false); // Stop loading if webcam access fails
        return;
      }
      */

      // Call the parent onAgree to proceed with the exam
      await onAgree(); // Assuming onAgree might be async; if not, remove await
    } catch (error) {
      console.error('Error in handleAgree:', error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Instructions</h2>
        <p className="mb-2 text-lg">
          Please read carefully and agree to the below:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-lg text-gray-700">
          <li>
            For the best experience, it is recommended to attempt coding
            problems on a larger screen.
          </li>
          <li>
            Ensure you load the latest version of Google Chrome (v60+) or the
            latest version of Firefox.
          </li>
          <li>
            Make sure third-party cookies are enabled in your browser settings.
          </li>
          <li>
            Maintain uninterrupted internet connectivity with a minimum download
            & upload speed of 20 Mbps.
          </li>
          <li>
            Set your system clock to IST (India Standard Time) to avoid any time
            mismatch.
          </li>
          <li>
            No tab switches are allowed during the test. Switching tabs may
            auto-submit.
          </li>
          <li>
            Any notifications or pop-ups during the test will be counted as a
            tab switch. Please ensure they are turned off.
          </li>
          <li>
            The test will automatically submit when the time limit is reached.
            Any unanswered questions will be marked incorrect.
          </li>
        </ul>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading} // Disable Close button during loading
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
          <button
            onClick={handleAgree}
            disabled={isLoading} // Disable Agree button during loading
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Agree & Proceed'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
