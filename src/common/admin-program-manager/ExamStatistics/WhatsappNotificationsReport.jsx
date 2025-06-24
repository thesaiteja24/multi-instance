import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import batchReportService from '../../../services/batchReportService';

const WhatsappNotificationsReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchId, setBatchId] = useState(null);

  // Function to extract query parameters
  const getQueryParams = query => {
    return new URLSearchParams(query);
  };

  useEffect(() => {
    const queryParams = getQueryParams(location.search);
    const date = queryParams.get('date');
    const batchId = queryParams.get('batchId');
    const batchLocation = queryParams.get('batchLocation');
    setBatchId(batchId);

    if (!date || !batchId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await batchReportService(date, batchId, batchLocation);
        setStudents(data.students);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  const isValidDate = dateString => {
    if (!dateString) return false; // Check for null, undefined, or empty string
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full p-6 sm:p-4 md:p-6 lg:p-8 font-[Inter]">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          <p className="text-red-500 mb-4">{'Something went wrong'}</p>
          <Link
            to="/admin/exam-statistics"
            className="text-blue-500 hover:underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Exam Statistics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 sm:p-4 md:p-6 lg:p-8 font-[Inter]">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <Link to={-1} className="mb-4 text-blue-500 hover:underline block">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Exam Statistics
        </Link>

        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-[Inter] font-semibold text-2xl sm:text-3xl">
            Batch Report for {batchId}
          </span>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto"></div>
        </div>
        <div className="border-t border-gray-300 mt-4 mb-6"></div>
        {/* Table for Larger Screens */}
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
            <thead className="sticky top-0 bg-[#19216F] text-white ">
              <tr>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  WhatsApp No.
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Sent
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base">
                  Delivered
                </th>
              </tr>
            </thead>
            <tbody>
              {students?.map((item, index) => (
                <tr key={index} className="border even:bg-gray-50 odd:bg-white">
                  <td className="py-3 px-4 text-sm sm:text-base">
                    {item.name}
                  </td>
                  <td className="py-3 px-4 text-sm sm:text-base">
                    {item.studentPhNumber}
                  </td>
                  <td className="py-3 px-4 text-sm sm:text-base">
                    {isValidDate(item.last_sent) ? (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-green-500"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="text-red-500"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm sm:text-base">
                    {isValidDate(item.last_delivered) ? (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-green-500"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="text-red-500"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsappNotificationsReport;
