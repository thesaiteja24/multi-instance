import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getBatches } from '../reducers/batchesSlice';
import axios from 'axios';
import WhatsappReportDisplay from './WhatsappReportDisplay';

export default function ParentWhatsappMessage() {
  const [reportResponse, setReportResponse] = useState(null);
  const [option, setOption] = useState('');
  const [location, setLocation] = useState('');
  const [batch, setBatch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [messageSuccess, setMessageSuccess] = useState(null);
  const dispatch = useDispatch();
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );

  // Define fetchBatches using useCallback to prevent redefinition on render
  const fetchBatches = useCallback(
    type => {
      dispatch(getBatches(type));
    },
    [dispatch]
  );

  // Fetch batches on mount
  useEffect(() => {
    fetchBatches('all');
  }, [fetchBatches]);

  // Polling for report status every 10 seconds using selected location
  useEffect(() => {
    if (!location) return;

    let intervalId;

    const fetchReportStatus = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/report-status?location=${encodeURIComponent(location)}`
        );
        setReportStatus(res.data);
        setStatusError(null);
        if (res.data.status === 'completed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || 'Failed to fetch report status.';
        setStatusError(errorMessage);
        console.error('Report status fetch failed:', error);
      }
    };

    fetchReportStatus();
    intervalId = setInterval(fetchReportStatus, 10000);

    return () => clearInterval(intervalId);
  }, [location]);

  const uniqueLocations = [
    ...new Set(batchesList.map(b => b?.location).filter(Boolean)),
  ];
  const filteredBatches = location
    ? batchesList
        .filter(b => b?.location === location && b?.Batch)
        .sort((a, b) => a.Batch.localeCompare(b.Batch))
    : [];

  const generateReport = async () => {
    // Validation requires batch for dateRange
    if (
      !option ||
      !location ||
      (option === 'batch' && !batch) ||
      (option === 'dateRange' && (!startDate || !endDate || !batch))
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setReportResponse(null);

    let url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/v1/data-gathering-report?location=${encodeURIComponent(location)}`;
    if (option === 'batch') url += `&batch=${encodeURIComponent(batch)}`;
    else if (option === 'dateRange') {
      url += `&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}&batch=${encodeURIComponent(
        batch
      )}`;
    }

    try {
      const res = await axios.get(url);
      if (res.data?.success === false) {
        throw new Error(res.data.message || 'Failed to generate report.');
      }
      setReportResponse(res.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message?.includes(
        'E11000 duplicate key error'
      )
        ? 'Duplicate report detected. This report already exists.'
        : error.message || 'Failed to fetch report. Please try again.';
      setError(errorMessage);
      console.error('Report fetch failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsappMessage = async () => {
    if (!reportStatus?.weekId) {
      setMessageError('No weekId available to send WhatsApp message.');
      return;
    }

    setIsSendingMessage(true);
    setMessageError(null);
    setMessageSuccess(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/send-parent-weekly`,
        { weekId: reportStatus.weekId }
      );
      setMessageSuccess(res.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send WhatsApp message.';
      setMessageError(errorMessage);
      console.error('WhatsApp message send failed:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 font-sans space-y-6 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        WhatsApp Weekly Report Generator
      </h2>

      {/* Display report status */}
      {location && reportStatus && (
        <div className="bg-green-100 border border-blue-300 text-blue-800 rounded-md p-4 text-center text-xl">
          Report Status for {location}: <strong>{reportStatus.status}</strong>{' '}
          (Success: {reportStatus.success ? 'Yes' : 'No'})
        </div>
      )}
      {statusError && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-4 text-center">
          {statusError}
        </div>
      )}

      {/* Display WhatsApp message feedback */}
      {messageSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-md p-4 text-center">
          {messageSuccess}
        </div>
      )}
      {messageError && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-4 text-center">
          {messageError}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-4 text-center">
          {error}
        </div>
      )}
      {batchesListError && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-4 text-center">
          {batchesListError}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6 border border-gray-200">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={option}
              onChange={e => {
                setOption(e.target.value);
                setBatch('');
                setStartDate('');
                setEndDate('');
                setError(null);
              }}
              disabled={batchesListLoading || isSubmitting}
              className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                batchesListLoading || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-disabled={batchesListLoading || isSubmitting}
            >
              <option value="">Select Report Type</option>
              <option value="location">All Batches in Location</option>
              <option value="batch">Specific Batch</option>
              <option value="dateRange">Custom Date Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={location}
              onChange={e => {
                setLocation(e.target.value);
                setBatch('');
                setError(null);
              }}
              disabled={batchesListLoading || isSubmitting || !option}
              className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                batchesListLoading || isSubmitting || !option
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-disabled={batchesListLoading || isSubmitting || !option}
            >
              <option value="">Select Location</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(option === 'batch' || option === 'dateRange') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch
            </label>
            <select
              value={batch}
              onChange={e => {
                setBatch(e.target.value);
                setError(null);
              }}
              disabled={batchesListLoading || isSubmitting || !location}
              className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                batchesListLoading || isSubmitting || !location
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-disabled={batchesListLoading || isSubmitting || !location}
            >
              <option value="">Select Batch</option>
              {filteredBatches.map(b => (
                <option key={b.id} value={b.Batch}>
                  {b.Batch} ({b.Course || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        )}

        {option === 'dateRange' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
                disabled={batchesListLoading || isSubmitting}
                className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  batchesListLoading || isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                aria-disabled={batchesListLoading || isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                disabled={batchesListLoading || isSubmitting}
                className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  batchesListLoading || isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                aria-disabled={batchesListLoading || isSubmitting}
              />
            </div>
          </div>
        )}

        {batchesListLoading && (
          <p className="text-sm text-gray-500 text-center">
            Loading batches...
          </p>
        )}

        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            disabled={
              batchesListLoading ||
              isSubmitting ||
              !option ||
              !location ||
              (option === 'batch' && !batch) ||
              (option === 'dateRange' && (!startDate || !endDate || !batch))
            }
            className={`w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              batchesListLoading ||
              isSubmitting ||
              !option ||
              !location ||
              (option === 'batch' && !batch) ||
              (option === 'dateRange' && (!startDate || !endDate || !batch))
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            aria-disabled={
              batchesListLoading ||
              isSubmitting ||
              !option ||
              !location ||
              (option === 'batch' && !batch) ||
              (option === 'dateRange' && (!startDate || !endDate || !batch))
            }
          >
            {isSubmitting ? 'Generating...' : 'Generate Report'}
          </button>

          {reportStatus?.status === 'completed' && reportStatus?.weekId && (
            <button
              onClick={sendWhatsappMessage}
              disabled={isSendingMessage}
              className={`w-full sm:w-auto px-6 py-2 bg-green-600 text-white font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isSendingMessage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-disabled={isSendingMessage}
            >
              {isSendingMessage ? 'Sending...' : 'Send WhatsApp Message'}
            </button>
          )}
        </div>
      </div>

      <WhatsappReportDisplay response={reportResponse} />
    </div>
  );
}
