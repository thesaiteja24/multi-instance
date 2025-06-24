import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const rowsPerPage = 5;

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector(state => state.auth);
  const location = userInfo?.location;
  const id = userInfo?.id;

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/leaves`,
        {
          params: { location },
        }
      );
      const data = response.data.leaves || [];
      setLeaveRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch leave requests. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  }, [location]);

  // Update leave request status
  const updateLeaveStatus = async (studentId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/leaves`, {
        studentId,
        status,
        managerId: id,
      });
      setLeaveRequests(prev =>
        prev.map(request =>
          request.studentId === studentId ? { ...request, status } : request
        )
      );
      setFilteredRequests(prev =>
        prev.map(request =>
          request.studentId === studentId ? { ...request, status } : request
        )
      );
      Swal.fire({
        title: status === 'accepted' ? 'Accepted!' : 'Rejected!',
        text: `Leave request has been ${status}.`,
        icon: status === 'accepted' ? 'success' : 'error',
        confirmButtonText: 'OK',
      });
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update leave status. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
    setShowPopup(false);
  };

  // Handle search
  const handleSearch = e => {
    const term = e.target.value ? e.target.value.toLowerCase() : '';
    setSearchTerm(term);
    const filtered = leaveRequests.filter(request =>
      [
        request.studentName,
        request.studentId,
        request.batchNo,
        request.location,
      ].some(field => field && field.toLowerCase().includes(term))
    );
    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  // Handle row click
  const handleRowClick = student => {
    setSelectedStudent(student);
    setShowPopup(true);
  };

  // Handle accept/reject
  const handleAccept = () => {
    updateLeaveStatus(selectedStudent.id, 'accepted');
  };

  const handleReject = () => {
    updateLeaveStatus(selectedStudent.id, 'rejected');
  };

  // Fetch data on mount
  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredRequests.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const goToPage = page => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Status badge
  const getStatusBadge = status => {
    const baseStyle = 'px-2 py-1 text-sm font-semibold rounded-full';
    switch (status) {
      case 'accepted':
        return (
          <span className={`${baseStyle} text-green-700 bg-green-100`}>
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseStyle} text-red-700 bg-red-100`}>
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${baseStyle} text-yellow-700 bg-yellow-100`}>
            Pending
          </span>
        );
    }
  };

  const StudentDetailsPopup = ({ onClose }) => {
    if (!selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
        <div className="bg-[#FDFDFD] rounded-[13px] w-full max-w-xl md:max-w-[530px] p-6 md:p-[30px] border border-[#D5D7DA] shadow-lg overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-[#252B37] text-xl md:text-[30px] font-semibold leading-[38px]">
              Student Details
            </h2>
            <button
              className="text-red-500 text-2xl font-bold"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="space-y-4 text-[16px] md:text-[20px]">
            {[
              { label: 'Student ID', value: selectedStudent.studentId },
              { label: 'Name', value: selectedStudent.studentName || 'N/A' },
              { label: 'Batch No.', value: selectedStudent.batchNo || 'N/A' },
              {
                label: 'Parent Ph. No.',
                value: selectedStudent.parentPhNumber || 'N/A',
              },
              {
                label: 'Student Ph. No.',
                value: selectedStudent.studentPhNumber || 'N/A',
              },
              { label: 'Start Date', value: selectedStudent.StartDate },
              { label: 'End Date', value: selectedStudent.EndDate },
              { label: 'Total Days', value: selectedStudent.TotalDays },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <span className="font-semibold text-[#414651] w-full md:w-1/3">
                  {label}
                </span>
                <span className="text-[#717680] w-full md:w-2/3">
                  : {value}
                </span>
              </div>
            ))}
            <div className="bg-[#E1EFFF] rounded-[13px] p-3">
              <div className="font-semibold text-[#252B37]">Reason</div>
              <div className="text-[#414651] text-[15px] md:text-[18px] leading-[22px] mt-1">
                {selectedStudent.Reason}
              </div>
            </div>
          </div>

          {selectedStudent.status === 'pending' && location !== 'all' && (
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between gap-4 mt-8">
              <button
                onClick={handleAccept}
                className="w-full sm:w-1/2 bg-[#00007F] text-white py-3 rounded-[10px] font-medium"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="w-full sm:w-1/2 bg-[#FF6000] text-white py-3 rounded-[10px] font-medium"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-2 md:p-4 lg:p-6 xl:p-8 font-[Poppins] gap-y-2 lg:gap-y-4 xl:gap-y-4 relative">
      <div className="grid grid-cols-[10%_80%]">
        <button
          className="text-left text-lg sm:text-xl font-semibold font-['Inter']"
          onClick={() => navigate('/program-manager/dashboard')}
        >
          {'<- Dashboard'}
        </button>
        <div className="font-bold text-base md:text-lg lg:text-xl xl:text-2xl flex flex-col items-center">
          <span className="font-semibold text-[#00007F]">Leave Request</span>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="font-bold text-base md:text-lg lg:text-xl xl:text-2xl flex flex-col items-center">
          <span className="font-semibold text-[#00007F]">Request</span>
        </div>
        <div className="flex flex-row items-center justify-center px-[21px] py-[8px] bg-white border border-[#C9C9C9] rounded-[4px]">
          <input
            type="text"
            placeholder="Search by Name, ID, Batch, or Location"
            value={searchTerm}
            onChange={handleSearch}
            className="text-[12px] leading-[18px] text-black font-normal outline-none w-full"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600 text-center">Loading leave requests...</p>
      ) : filteredRequests.length > 0 ? (
        <div className="overflow-x-auto shadow-[0px_4.42px_18.8px_rgba(0,73,198,0.2)] rounded-lg">
          <table className="min-w-full table-auto text-sm text-left leading-[1.6]">
            <thead className="bg-[#00007F] text-white">
              <tr>
                <th className="px-4 py-3 text-center">Student ID</th>
                <th className="px-4 py-3 text-center">Student Name</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-center">Start Date</th>
                <th className="px-4 py-3 text-center">End Date</th>
                <th className="px-4 py-3 text-center">Total Days</th>
                <th className="px-4 py-3 text-center">Status</th>
                {location === 'all' && (
                  <th className="px-4 py-3 text-center">Location</th>
                )}
                {location === 'all' ? (
                  <th className="px-4 py-3 text-center">Accepted By</th>
                ) : (
                  <th className="px-4 py-3 text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentData.map((request, index) => (
                <tr
                  key={`${request.studentId}-${index}`}
                  onClick={() => handleRowClick(request)}
                  className={`cursor-pointer ${
                    index % 2 === 0 ? 'bg-[#E4E4FF]' : 'bg-white'
                  } hover:bg-[#D1D7FF]`}
                >
                  <td className="px-4 py-2 text-center">{request.studentId}</td>
                  <td className="px-4 py-2 text-center">
                    {request.studentName || 'N/A'}
                  </td>
                  <td className="px-4 py-2">{request.Reason}</td>
                  <td className="px-4 py-2 text-center">{request.StartDate}</td>
                  <td className="px-4 py-2 text-center">{request.EndDate}</td>
                  <td className="px-4 py-2 text-center">{request.TotalDays}</td>
                  <td className="px-4 py-2 text-center">
                    {getStatusBadge(request.status)}
                  </td>
                  {location === 'all' && (
                    <td className="px-4 py-2 text-center">
                      {request.location}
                    </td>
                  )}
                  {location === 'all' ? (
                    <td className="px-4 py-2 text-center">
                      {request.AcceptedBy || 'Pending'}
                    </td>
                  ) : (
                    <td className="px-4 py-2 text-center">
                      {request.status === 'pending'
                        ? 'View Details'
                        : 'Completed'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No leave requests found.</p>
      )}

      {/* Pagination Controls */}
      {filteredRequests.length > 0 && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === i + 1 ? 'bg-[#00007F] text-white' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Show Popup */}
      {showPopup && <StudentDetailsPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default LeaveRequest;
