import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMentorStudentsThunk } from '../reducers/mentorStudentsSlice.js';

// Placeholder image (replace with actual path in production)
const SubjectImage = '/Top.png';

const AssignedBatches = () => {
  const { userInfo } = useSelector(state => state.auth);
  const location = userInfo?.location;
  const mentorId = userInfo?.id;
  const dispatch = useDispatch();
  const { scheduleData, studentsList, mentorStudentsListLoading } = useSelector(
    state => state.mentorStudents
  );
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (studentsList.length === 0 && scheduleData.length === 0) {
      dispatch(getMentorStudentsThunk({ location, mentorId, selectedBatch }));
    }
  }, [dispatch, location, mentorId, studentsList.length, scheduleData.length]);

  // Handle batch selection
  const handleBatchClick = batch => {
    setSelectedBatch(batch);
    setModalOpen(true);
  };

  // Close modal function
  const closeModal = () => {
    setModalOpen(false);
    setSelectedBatch(null);
  };

  return (
    <div className="p-4 w-full">
      {/* Page Title */}
      <h2 className="font-semibold text-xl sm:text-2xl md:text-3xl lg:text-[30px] text-[var(--color-secondary)] text-center mb-6 font-[inter]">
        Assigned Batches
      </h2>

      {/* Loading State */}
      {mentorStudentsListLoading ? (
        <p className="text-center text-[#414651] text-lg font-semibold animate-pulse font-[inter]">
          🔄 Fetching Batches...
        </p>
      ) : scheduleData.length === 0 ? (
        <p className="text-center text-[#FF3B30] text-lg font-semibold font-[inter]">
          ❌ No Batches Found!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {scheduleData.map((batch, index) => (
            <div
              key={batch.id || index}
              className="w-fit max-w-[320px] min-h-[200px] pb-2 rounded-b-[11px] bg-white flex flex-col justify-between"
            >
              <div className="relative inline-block rounded overflow-hidden">
                {/* Top Label */}
                <div className="absolute top-2 left-2 text-white text-sm sm:text-lg md:text-[20px] px-4 py-1 font-[inter] font-semibold z-10">
                  {batch.subject || 'N/A'}
                </div>
                {/* Image */}
                <img
                  src={batch.image || SubjectImage}
                  alt={`${batch.subject || 'Subject'} Subject`}
                  className="w-full h-[55px] object-cover rounded-[11px]"
                />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-[50%_50%] items-center justify-center p-1">
                  <div className="flex items-center gap-1 px-4 py-1">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.7854 3.63227V2.07227C16.7854 1.66227 16.4454 1.32227 16.0354 1.32227C15.6254 1.32227 15.2854 1.66227 15.2854 2.07227V3.57227H8.78539V2.07227C8.78539 1.66227 8.44539 1.32227 8.03539 1.32227C7.62539 1.32227 7.28539 1.66227 7.28539 2.07227V3.63227C4.58539 3.88227 3.27539 5.49227 3.07539 7.88227C3.05539 8.17227 3.29539 8.41227 3.57539 8.41227H20.4954C20.7854 8.41227 21.0254 8.16227 20.9954 7.88227C20.7954 5.49227 19.4854 3.88227 16.7854 3.63227Z"
                        fill="#00007F"
                      />
                      <path
                        d="M20.0352 9.91211H4.03516C3.48516 9.91211 3.03516 10.3621 3.03516 10.9121V17.0721C3.03516 20.0721 4.53516 22.0721 8.03516 22.0721H16.0352C19.5352 22.0721 21.0352 20.0721 21.0352 17.0721V10.9121C21.0352 10.3621 20.5852 9.91211 20.0352 9.91211ZM9.24516 18.2821C9.19516 18.3221 9.14516 18.3721 9.09516 18.4021C9.03516 18.4421 8.97516 18.4721 8.91516 18.4921C8.85516 18.5221 8.79516 18.5421 8.73516 18.5521C8.66516 18.5621 8.60516 18.5721 8.53516 18.5721C8.40516 18.5721 8.27516 18.5421 8.15516 18.4921C8.02516 18.4421 7.92516 18.3721 7.82516 18.2821C7.64516 18.0921 7.53516 17.8321 7.53516 17.5721C7.53516 17.3121 7.64516 17.0521 7.82516 16.8621C7.92516 16.7721 8.02516 16.7021 8.15516 16.6521C8.33516 16.5721 8.53516 16.5521 8.73516 16.5921C8.79516 16.6021 8.85516 16.6221 8.91516 16.6521C8.97516 16.6721 9.03516 16.7021 9.09516 16.7421C9.14516 16.7821 9.19516 16.8221 9.24516 16.8621C9.42516 17.0521 9.53516 17.3121 9.53516 17.5721C9.53516 17.8321 9.42516 18.0921 9.24516 18.2821ZM9.24516 14.7821C9.05516 14.9621 8.79516 15.0721 8.53516 15.0721C8.27516 15.0721 8.01516 14.9621 7.82516 14.7821C7.64516 14.5921 7.53516 14.3321 7.53516 14.0721C7.53516 13.8121 7.64516 13.5521 7.82516 13.3621C8.10516 13.0821 8.54516 12.9921 8.91516 13.1521C9.04516 13.2021 9.15516 13.2721 9.24516 13.3621C9.42516 13.5521 9.53516 13.8121 9.53516 14.0721C9.53516 14.3321 9.42516 14.5921 9.24516 14.7821ZM12.7452 18.2821C12.5552 18.4621 12.2952 18.5721 12.0352 18.5721C11.7752 18.5721 11.5152 18.4621 11.3252 18.2821C11.1452 18.0921 11.0352 17.8321 11.0352 17.5721C11.0352 17.3121 11.1452 17.0521 11.3252 16.8621C11.6952 16.4921 12.3752 16.4921 12.7452 16.8621C12.9252 17.0521 13.0352 17.3121 13.0352 17.5721C13.0352 17.8321 12.9252 18.0921 12.7452 18.2821ZM12.7452 14.7821C12.6952 14.8221 12.6452 14.8621 12.5952 14.9021C12.5352 14.9421 12.4752 14.9721 12.4152 14.9921C12.3552 15.0221 12.2952 15.0421 12.2352 15.0521C12.1652 15.0621 12.1052 15.0721 12.0352 15.0721C11.7752 15.0721 11.5152 14.9621 11.3252 14.7821C11.1452 14.5921 11.0352 14.3321 11.0352 14.0721C11.0352 13.8121 11.1452 13.5521 11.3252 13.3621C11.4152 13.2721 11.5252 13.2021 11.6552 13.1521C12.0252 12.9921 12.4652 13.0821 12.7452 13.3621C12.9252 13.5521 13.0352 13.8121 13.0352 14.0721C13.0352 14.3321 12.9252 14.5921 12.7452 14.7821ZM16.2452 18.2821C16.0552 18.4621 15.7952 18.5721 15.5352 18.5721C15.2752 18.5721 15.0152 18.4621 14.8252 18.2821C14.6452 18.0921 14.5352 17.8321 14.5352 17.5721C14.5352 17.3121 14.6452 17.0521 14.8252 16.8621C15.1952 16.4921 15.8752 16.4921 16.2452 16.8621C16.4252 17.0521 16.5352 17.3121 16.5352 17.5721C16.5352 17.8321 16.4252 18.0921 16.2452 18.2821ZM16.2452 14.7821C16.1952 14.8221 16.1452 14.8621 16.0952 14.9021C16.0352 14.9421 15.9752 14.9721 15.9152 14.9921C15.8552 15.0221 15.7952 15.0421 15.7352 15.0521C15.6652 15.0621 15.5952 15.0721 15.5352 15.0721C15.2752 15.0721 15.0152 14.9621 14.8252 14.7821C14.6452 14.5921 14.5352 14.3321 14.5352 14.0721C14.5352 13.8121 14.6452 13.5521 14.8252 13.3621C14.9252 13.2721 15.0252 13.2021 15.1552 13.1521C15.3352 13.0721 15.5352 13.0521 15.7352 13.0921C15.7952 13.1021 15.8552 13.1221 15.9152 13.1521C15.9752 13.1721 16.0352 13.2021 16.0952 13.2421C16.1452 13.2821 16.1952 13.3221 16.2452 13.3621C16.4252 13.5521 16.5352 13.8121 16.5352 14.0721C16.5352 14.3321 16.4252 14.5921 16.2452 14.7821Z"
                        fill="#00007F"
                      />
                    </svg>
                    <span className="font-[inter] font-semibold text-[#414651] text-sm sm:text-base md:text-[18px]">
                      Batch
                    </span>
                  </div>
                  <div className="text-ellipsis truncate">
                    <span className="text-[#717680] font-[inter] font-semibold text-sm sm:text-base md:text-[19px] ">
                      : {batch.batchNo?.join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[50%_50%] items-center p-1">
                  <div className="flex items-center gap-1 px-4 py-1">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.0352 2.11719C9.41516 2.11719 7.28516 4.24719 7.28516 6.86719C7.28516 9.43719 9.29516 11.5172 11.9152 11.6072C11.9952 11.5972 12.0752 11.5972 12.1352 11.6072C12.1552 11.6072 12.1652 11.6072 12.1852 11.6072C12.1952 11.6072 12.1952 11.6072 12.2052 11.6072C14.7652 11.5172 16.7752 9.43719 16.7852 6.86719C16.7852 2.11719 14.6552 2.11719 12.0352 2.11719Z"
                        fill="#00007F"
                      />
                      <path
                        d="M17.1161 14.2778C14.3261 12.4178 9.77609 12.4178 6.96609 14.2778C5.69609 15.1178 4.99609 16.2678 4.99609 17.4978C4.99609 18.7278 5.69609 19.8678 6.95609 20.7078C8.35609 21.6478 10.1961 22.1178 12.0361 22.1178C13.8761 22.1178 15.7161 21.6478 17.1161 20.7078C18.3761 19.8578 19.0761 18.7178 19.0761 17.4778C19.0661 16.2578 18.3761 15.1078 17.1161 14.2778ZM14.3661 16.6778L11.8461 19.1978C11.7261 19.3178 11.5661 19.3778 11.4061 19.3778C11.2461 19.3778 11.0861 19.3078 10.9661 19.1978L9.70609 17.9378C9.46609 17.6978 9.46609 17.2978 9.70609 17.0578C9.94609 16.8178 10.3461 16.8178 10.5861 17.0578L11.4061 17.8778L13.4861 15.7978C13.7261 15.5578 14.1261 15.5578 14.3661 15.7978C14.6161 16.0378 14.6161 16.4378 14.3661 16.6778Z"
                        fill="#00007F"
                      />
                    </svg>
                    <span className="font-[inter] font-semibold text-[#414651] text-sm sm:text-base md:text-[18px]">
                      Mentor
                    </span>
                  </div>
                  <div>
                    <span className="text-[#717680] font-[inter] font-semibold text-sm sm:text-base md:text-[18px]">
                      : {batch.MentorName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid w-full grid-cols-1 p-4">
                <div className="flex items-center justify-center bg-[var(--color-secondary)] text-white p-2 rounded-md">
                  <button
                    onClick={() => handleBatchClick(batch)}
                    className="flex justify-center items-center gap-2 text-center text-[#FDFDFD] font-semibold text-sm sm:text-base md:text-[16px] font-[inter]"
                  >
                    <svg
                      width="23"
                      height="23"
                      viewBox="0 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className=""
                    >
                      <path
                        d="M22.125 9.23953C19.815 5.60953 16.435 3.51953 12.875 3.51953C11.095 3.51953 9.365 4.03953 7.785 5.00953C6.205 5.98953 4.785 7.41953 3.625 9.23953C2.625 10.8095 2.625 13.3595 3.625 14.9295C5.935 18.5695 9.315 20.6495 12.875 20.6495C14.655 20.6495 16.385 20.1295 17.965 19.1595C19.545 18.1795 20.965 16.7495 22.125 14.9295C23.125 13.3695 23.125 10.8095 22.125 9.23953ZM12.875 16.1295C10.635 16.1295 8.835 14.3195 8.835 12.0895C8.835 9.85953 10.635 8.04953 12.875 8.04953C15.115 8.04953 16.915 9.85953 16.915 12.0895C16.915 14.3195 15.115 16.1295 12.875 16.1295Z"
                        fill="white"
                      />
                      <path
                        d="M12.8734 9.23047C11.3034 9.23047 10.0234 10.5105 10.0234 12.0905C10.0234 13.6605 11.3034 14.9405 12.8734 14.9405C14.4434 14.9405 15.7334 13.6605 15.7334 12.0905C15.7334 10.5205 14.4434 9.23047 12.8734 9.23047Z"
                        fill="white"
                      />
                    </svg>
                    View Students
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student List Modal */}
      {modalOpen && selectedBatch && (
        <div className="fixed inset-0 p-6 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-2/5 max-h-[80%] p-6 rounded-lg relative overflow-hidden flex flex-col">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-[#FF3B30] hover:text-gray-600 text-[42px] font-bold"
            >
              ×
            </button>

            {/* Modal Header */}
            <h3 className="text-center text-[20px] font-semibold text-[var(--color-secondary)] font-[Poppins] mb-4">
              Students in {selectedBatch.batchNo?.join(', ') || 'N/A'}
            </h3>

            {/* Table */}
            <div className="overflow-y-auto border border-gray-200">
              <table className="min-w-full rounded-lg overflow-hidden">
                <thead className="bg-[var(--color-secondary)] text-white">
                  <tr>
                    <th className="py-2 px-4 text-left font-semibold text-[18px] font-[inter] text-[#FDFDFD]">
                      S No
                    </th>
                    <th className="py-2 px-4 text-left font-semibold text-[18px] font-[inter] text-[#FDFDFD]">
                      Student Name
                    </th>
                    <th className="py-2 px-4 text-center font-semibold text-[18px] font-[inter] text-[#FDFDFD]">
                      Email ID
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#333] border">
                  {studentsList.length > 0 &&
                  studentsList.filter(student =>
                    selectedBatch.batchNo?.some(
                      batch => batch === student.BatchNo
                    )
                  ).length > 0 ? (
                    studentsList
                      .filter(student =>
                        selectedBatch.batchNo?.some(
                          batch => batch === student.BatchNo
                        )
                      )
                      .map((student, index) => (
                        <tr
                          key={student.id || index}
                          className="border border-gray-200 hover:bg-gray-100"
                        >
                          <td className="py-2 px-4 text-[#181D27] text-[18px] font-[inter] font-medium">
                            {index + 1}
                          </td>
                          <td className="py-2 px-4 text-[#181D27] text-[18px] font-[inter] font-medium">
                            {student.name || 'N/A'}
                          </td>
                          <td className="py-2 px-4 text-[#181D27] text-[18px] font-[inter] font-medium">
                            {student.email || 'N/A'}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-2 px-4 text-gray-500 text-center font-medium text-[18px] font-[inter]"
                      >
                        No students available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedBatches;
