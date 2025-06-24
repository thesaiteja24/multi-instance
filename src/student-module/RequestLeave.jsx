import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { FaSadTear } from 'react-icons/fa';
import {
  getLeaveRequests,
  submitLeaveRequest,
} from '../services/studentService.js';
import CustomScaleLoader from '../ui/CustomScaleLoader.jsx';

const RequestLeave = () => {
  const { studentDetails, loading: studentLoading } = useSelector(
    state => state.student
  );
  const { userInfo } = useSelector(state => state.auth);
  const [leaveData, setLeaveData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Fetch leave requests
  const fetchLeaveRequestsCallback = useCallback(async () => {
    if (!studentDetails) return;
    try {
      const response = await getLeaveRequests(
        studentDetails.studentId,
        studentDetails.location
      );
      setLeaveRequests(response || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      Swal.fire(
        'Error',
        'Failed to fetch leave requests. Please try again later.',
        'error'
      );
    } finally {
      setFetchLoading(false);
    }
  }, [studentDetails]);

  useEffect(() => {
    if (studentDetails) {
      fetchLeaveRequestsCallback();
    }
  }, [fetchLeaveRequestsCallback, studentDetails]);

  const handleChange = e => {
    const { name, value } = e.target;
    setLeaveData(prevData => ({ ...prevData, [name]: value }));
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return difference + 1;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    if (!studentDetails) {
      setLoading(false);
      return Swal.fire(
        'Error',
        'Student details not found. Please log in again.',
        'error'
      );
    }

    const totalDays = calculateDays(leaveData.startDate, leaveData.endDate);

    if (totalDays <= 0) {
      setLoading(false);
      return Swal.fire('Error', 'End date must be after start date.', 'error');
    }

    const payload = {
      studentId: studentDetails.studentId,
      batchNo: studentDetails.BatchNo,
      studentName: studentDetails.name,
      studentNumber: Number(studentDetails.phone),
      parentNumber: Number(studentDetails.parentNumber),
      reason: leaveData.reason,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      location: studentDetails.location,
      totalDays,
      status: 'pending',
    };

    try {
      await submitLeaveRequest(payload);
      Swal.fire('Success', 'Leave request submitted successfully!', 'success');
      setLeaveData({ reason: '', startDate: '', endDate: '' });
      fetchLeaveRequestsCallback();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      Swal.fire('Error', 'Failed to submit leave request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);
  const currentItems = leaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = pageNumber => {
    setCurrentPage(pageNumber);
  };

  // Check if student is in DROPOUTS batch
  const isDropout =
    studentDetails?.BatchNo === 'DROPOUTS' ||
    studentDetails?.BatchNo?.startsWith('DROPOUTS-');

  if (studentLoading) {
    return <CustomScaleLoader />;
  }

  if (isDropout) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center">
        <div className="bg-white shadow-[0_0.25rem_1.25rem_#B3BAF7] rounded-[0.5rem] p-[1.5rem] max-w-[37.5rem] text-center">
          <FaSadTear className="text-[var(--color-secondary)] text-[4.5rem] mx-auto mb-[1rem]" />
          <h2 className="text-[1.875rem] font-semibold text-[var(--color-secondary)] font-['Inter'] mb-[0.5rem]">
            Your Dropout
          </h2>
          <p className="text-gray-600 text-[1.25rem] font-['Inter']">
            You are currently in the DROPOUTS batch. Please contact support for
            further assistance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center sm:px-[1.25rem] px-[1rem] font-[Inter]">
      <div className="relative w-full max-w-full rounded-[0.375rem] lg:p-[1.25rem] p-[0.75rem] flex flex-col gap-[2.5rem]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.5rem]">
          {/* Left/Form Column */}
          <div className="lg:flex lg:flex-col lg:gap-[1.5rem]">
            {/* Heading */}
            <div className="relative w-[15.8125rem] h-[2.9375rem] bg-[var(--color-secondary)] flex items-center px-[1.25rem] rounded-[0.75rem] shadow-md">
              <div className="absolute left-0 top-0 h-full w-[1rem] bg-red-500 rounded-l-[0.75rem]"></div>
              <img
                src="/leave/leaverequesticon.svg"
                alt="Leave Request Icon"
                className="w-[1.5rem] h-[1.5rem] mr-[0.5rem]"
              />
              <span className="text-white text-[1.125rem] font-semibold">
                Leave Request
              </span>
            </div>

            {/* Form */}
            <form
              id="leaveForm"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] mt-[1.5rem]"
            >
              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-[0.5rem]">
                  Start Date
                </label>
                <div className="relative flex items-center bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-[0.375rem] w-full h-[3.125rem] px-[1rem]">
                  <input
                    type="date"
                    name="startDate"
                    value={leaveData.startDate}
                    onChange={handleChange}
                    className="w-full outline-none bg-transparent"
                    required
                  />
                  <svg
                    width="1.5rem"
                    height="1.5rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_9_3897)">
                      <path
                        d="M7.11262 0.0673828C7.32768 0.0673828 7.53393 0.152815 7.686 0.304884C7.83807 0.456954 7.9235 0.663204 7.9235 0.878263V2.39461H16.6312V0.888689C16.6312 0.67363 16.7166 0.467379 16.8687 0.31531C17.0208 0.16324 17.227 0.0778084 17.4421 0.0778084C17.6571 0.0778084 17.8634 0.16324 18.0155 0.31531C18.1675 0.467379 18.253 0.67363 18.253 0.888689V2.39461H21.3922C22.0065 2.39461 22.5956 2.63854 23.03 3.07277C23.4645 3.50701 23.7087 4.096 23.709 4.71025V20.9197C23.7087 21.534 23.4645 22.123 23.03 22.5572C22.5956 22.9915 22.0065 23.2354 21.3922 23.2354H2.85782C2.24356 23.2354 1.65445 22.9915 1.22 22.5572C0.785549 22.123 0.541323 21.534 0.541016 20.9197L0.541016 4.71025C0.541323 4.096 0.785549 3.50701 1.22 3.07277C1.65445 2.63854 2.24356 2.39461 2.85782 2.39461H6.30174V0.877105C6.30205 0.662247 6.38761 0.456294 6.53965 0.304474C6.69169 0.152655 6.89776 0.0673826 7.11262 0.0673828ZM2.16278 9.03572V20.9197C2.16278 21.011 2.18075 21.1014 2.21568 21.1857C2.25061 21.2701 2.30181 21.3467 2.36635 21.4112C2.43089 21.4758 2.50751 21.527 2.59184 21.5619C2.67616 21.5968 2.76654 21.6148 2.85782 21.6148H21.3922C21.4835 21.6148 21.5739 21.5968 21.6582 21.5619C21.7425 21.527 21.8191 21.4758 21.8837 21.4112C21.9482 21.3467 21.9994 21.2701 22.0344 21.1857C22.0693 21.1014 22.0873 21.011 22.0873 20.9197V9.05194L2.16278 9.03572ZM8.26407 17.002V18.9319H6.33302V17.002H8.26407ZM13.09 17.002V18.9319H11.1601V17.002H13.09ZM17.917 17.002V18.9319H15.986V17.002H17.917ZM8.26407 12.3951V14.325H6.33302V12.3951H8.26407ZM13.09 12.3951V14.325H11.1601V12.3951H13.09ZM17.917 12.3951V14.325H15.986V12.3951H17.917ZM6.30174 4.01521H2.85782C2.76654 4.01521 2.67616 4.03319 2.59184 4.06812C2.50751 4.10305 2.43089 4.15424 2.36635 4.21878C2.30181 4.28332 2.25061 4.35994 2.21568 4.44427C2.18075 4.5286 2.16278 4.61898 2.16278 4.71025V7.41512L22.0873 7.43133V4.71025C22.0873 4.61898 22.0693 4.5286 22.0344 4.44427C21.9994 4.35994 21.9482 4.28332 21.8837 4.21878C21.8191 4.15424 21.7425 4.10305 21.6582 4.06812C21.5739 4.03319 21.4835 4.01521 21.3922 4.01521H18.253V5.09136C18.253 5.30642 18.1675 5.51267 18.0155 5.66474C17.8634 5.81681 17.6571 5.90225 17.4421 5.90225C17.227 5.90225 17.0208 5.81681 16.8687 5.66474C16.7166 5.51267 16.6312 5.30642 16.6312 5.09136V4.01521H7.9235V5.08094C7.9235 5.296 7.83807 5.50225 7.686 5.65432C7.53393 5.80639 7.32768 5.89182 7.11262 5.89182C6.89756 5.89182 6.69131 5.80639 6.53924 5.65432C6.38717 5.50225 6.30174 5.296 6.30174 5.08094V4.01521Z"
                        fill="#00007F"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_9_3897">
                        <rect
                          width="23.168"
                          height="23.168"
                          fill="white"
                          transform="translate(0.541016 0.0673828)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-[0.5rem]">
                  End Date
                </label>
                <div className="relative flex items-center bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-[0.375rem] w-full h-[3.125rem] px-[1rem]">
                  <input
                    type="date"
                    name="endDate"
                    value={leaveData.endDate}
                    onChange={handleChange}
                    className="w-full outline-none bg-transparent"
                    required
                  />
                  <svg
                    width="1.5rem"
                    height="1.5rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_9_3897)">
                      <path
                        d="M7.11262 0.0673828C7.32768 0.0673828 7.53393 0.152815 7.686 0.304884C7.83807 0.456954 7.9235 0.663204 7.9235 0.878263V2.39461H16.6312V0.888689C16.6312 0.67363 16.7166 0.467379 16.8687 0.31531C17.0208 0.16324 17.227 0.0778084 17.4421 0.0778084C17.6571 0.0778084 17.8634 0.16324 18.0155 0.31531C18.1675 0.467379 18.253 0.67363 18.253 0.888689V2.39461H21.3922C22.0065 2.39461 22.5956 2.63854 23.03 3.07277C23.4645 3.50701 23.7087 4.096 23.709 4.71025V20.9197C23.7087 21.534 23.4645 22.123 23.03 22.5572C22.5956 22.9915 22.0065 23.2354 21.3922 23.2354H2.85782C2.24356 23.2354 1.65445 22.9915 1.22 22.5572C0.785549 22.123 0.541323 21.534 0.541016 20.9197L0.541016 4.71025C0.541323 4.096 0.785549 3.50701 1.22 3.07277C1.65445 2.63854 2.24356 2.39461 2.85782 2.39461H6.30174V0.877105C6.30205 0.662247 6.38761 0.456294 6.53965 0.304474C6.69169 0.152655 6.89776 0.0673826 7.11262 0.0673828ZM2.16278 9.03572V20.9197C2.16278 21.011 2.18075 21.1014 2.21568 21.1857C2.25061 21.2701 2.30181 21.3467 2.36635 21.4112C2.43089 21.4758 2.50751 21.527 2.59184 21.5619C2.67616 21.5968 2.76654 21.6148 2.85782 21.6148H21.3922C21.4835 21.6148 21.5739 21.5968 21.6582 21.5619C21.7425 21.527 21.8191 21.4758 21.8837 21.4112C21.9482 21.3467 21.9994 21.2701 22.0344 21.1857C22.0693 21.1014 22.0873 21.011 22.0873 20.9197V9.05194L2.16278 9.03572ZM8.26407 17.002V18.9319H6.33302V17.002H8.26407ZM13.09 17.002V18.9319H11.1601V17.002H13.09ZM17.917 17.002V18.9319H15.986V17.002H17.917ZM8.26407 12.3951V14.325H6.33302V12.3951H8.26407ZM13.09 12.3951V14.325H11.1601V12.3951H13.09ZM17.917 12.3951V14.325H15.986V12.3951H17.917ZM6.30174 4.01521H2.85782C2.76654 4.01521 2.67616 4.03319 2.59184 4.06812C2.50751 4.10305 2.43089 4.15424 2.36635 4.21878C2.30181 4.28332 2.25061 4.35994 2.21568 4.44427C2.18075 4.5286 2.16278 4.61898 2.16278 4.71025V7.41512L22.0873 7.43133V4.71025C22.0873 4.61898 22.0693 4.5286 22.0344 4.44427C21.9994 4.35994 21.9482 4.28332 21.8837 4.21878C21.8191 4.15424 21.7425 4.10305 21.6582 4.06812C21.5739 4.03319 21.4835 4.01521 21.3922 4.01521H18.253V5.09136C18.253 5.30642 18.1675 5.51267 18.0155 5.66474C17.8634 5.81681 17.6571 5.90225 17.4421 5.90225C17.227 5.90225 17.0208 5.81681 16.8687 5.66474C16.7166 5.51267 16.6312 5.30642 16.6312 5.09136V4.01521H7.9235V5.08094C7.92345 5.29606 7.83798 45.50232 7.68598 5.65439C7.53398 5.80646 7.32746 5.89189 7.11239 5.89189C6.89733 5.89189 6.69081 5.80646 6.53881 5.65439C6.38681 5.50232 6.30139 5.29606 6.30139 5.08094V4.01521Z"
                        fill="#00007F"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_9_3897">
                        <rect
                          width="23.168"
                          height="23.168"
                          fill="white"
                          transform="translate(0.541016 0.0673828)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
            </form>

            {/* Reason and Submit Button */}
            <div className="flex flex-col md:flex-row items-center gap-[1.5rem] mt-[1.5rem]">
              <textarea
                form="leaveForm"
                name="reason"
                value={leaveData.reason}
                onChange={handleChange}
                className="w-full md:w-2/3 h-[3.75rem] border border-[var(--color-secondary)] rounded-[0.375rem] p-[1rem] bg-[#EFF0F7] text-gray-600 resize-none"
                placeholder="Reason..."
                required
              />
              <button
                form="leaveForm"
                type="submit"
                className="w-full md:w-1/3 h-[3.75rem] bg-[var(--color-secondary)] text-white font-semibold rounded-[0.625rem] shadow-md hover:bg-blue-800 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>

          {/* Right/Image Column (hidden below md) */}
          <div className="hidden md:flex justify-center items-center">
            <img
              src="/leave/Frame.svg"
              alt="Leave Request Illustration"
              className="w-auto max-w-[20rem] md:max-w-[28rem] lg:max-w-[36rem]"
            />
          </div>
        </div>

        <div className="border-t border-[#303C60] pt-[2rem]">
          <h2 className="text-[1.4375rem] font-bold text-center mb-[1rem] text-[var(--color-secondary)]">
            Applied Leave Requests
          </h2>

          <div
            className="overflow-x-auto overflow-hidden rounded-[1.25rem]"
            style={{ boxShadow: '0 0.289375rem 1.448125rem 0 #B3BAF7' }}
          >
            <table className="w-full border-collapse text-center rounded-[1.25rem]">
              <thead>
                <tr className="bg-[var(--color-secondary)] text-white">
                  <th className="p-[0.75rem] first:rounded-tl-[1.25rem]">
                    Start Date
                  </th>
                  <th className="p-[0.75rem]">End Date</th>
                  <th className="p-[0.75rem]">Description</th>
                  <th className="p-[0.75rem] last:rounded-tr-[1.25rem]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {fetchLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center p-[0.75rem]">
                      <div className="flex flex-col items-center gap-[1rem]">
                        <CustomScaleLoader />
                        <p className="text-[1.125rem] font-semibold text-[var(--color-secondary)] font-['Inter']">
                          Loading Leave Requests...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-[0.75rem]">
                      <div className="rounded-[0.5rem] p-[1.5rem] max-w-[37.5rem] mx-auto text-center">
                        <FaSadTear className="text-[var(--color-secondary)] text-[3.125rem] mx-auto mb-[1rem]" />
                        <h2 className="text-[1.25rem] font-semibold text-[var(--color-secondary)] font-['Inter'] mb-[0.5rem]">
                          No Leave Requests Found
                        </h2>
                        <p className="text-gray-600 text-[1rem] font-['Inter']">
                          No leave requests are available at this time. Submit a
                          new request above.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((leave, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                    >
                      <td className="p-[0.75rem] border">
                        {formatDate(leave.StartDate)}
                      </td>
                      <td className="p-[0.75rem] border">
                        {formatDate(leave.EndDate)}
                      </td>
                      <td className="p-[0.75rem] border">{leave.Reason}</td>
                      <td className="p-[0.75rem] border">
                        <span
                          className={`px-[1rem] py-[0.5rem] rounded-[0.375rem] text-white ${
                            leave.status === 'accepted'
                              ? 'bg-[#11940A]'
                              : leave.status === 'rejected'
                                ? 'bg-[#EC5300]'
                                : 'bg-[#FFA500]'
                          }`}
                        >
                          {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!fetchLoading && totalPages > 1 && (
            <div className="w-full flex justify-end max-w-full mt-[0.25rem] px-[1rem]">
              <div className="text-black font-medium text-[1rem] font-['Inter'] tracking-[0.1875rem] leading-[4.375rem] space-x-[0.5rem]">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:text-[var(--color-secondary)]'
                  }`}
                >
                  {'< '}Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`${
                        currentPage === page
                          ? 'text-[var(--color-secondary)] font-semibold'
                          : 'hover:text-[var(--color-secondary)]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:text-[var(--color-secondary)]'
                  }`}
                >
                  Next {'>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestLeave;
