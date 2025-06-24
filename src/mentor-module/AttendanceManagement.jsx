import React, { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMentorStudentsThunk } from '../reducers/mentorStudentsSlice.js';

export default function AttendanceSystem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { scheduleData } = useSelector(state => state.mentorStudents);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate] = useState(new Date());
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, present: 0, absent: 0 });
  const mentorId = userInfo?.id;
  const location = userInfo?.location;

  useEffect(() => {
    if (scheduleData.length === 0) {
      dispatch(getMentorStudentsThunk({ location, mentorId }));
    }
  }, [dispatch, location, mentorId, scheduleData.length]);

  const subjects = [
    'Select Subject',
    ...new Set(scheduleData.map(item => item.subject)),
  ];

  useEffect(() => {
    if (selectedSubject && selectedSubject !== 'Select Subject') {
      const subjectBatches = scheduleData
        .filter(item => item.subject === selectedSubject)
        .flatMap(item => item.batchNo);
      setFilteredBatches(['Select Batch', ...subjectBatches]);
    } else {
      setFilteredBatches(['Select Batch']);
    }
    setSelectedBatch('');
  }, [selectedSubject, scheduleData]);

  const fetchStudents = useCallback(
    async (batches, subject) => {
      const payload = { batches, subject, location };
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attend`,
          payload
        );

        if (response.status === 200) {
          if (selectedBatch && selectedBatch !== 'Select Batch') {
            const initialStudents = response.data.students_data.map(
              student => ({
                ...student,
                status: 'absent',
                remarks: '',
              })
            );
            setStudents(initialStudents);
          } else {
            setStudents([]);
          }
        } else {
          console.error('Failed to fetch students:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    },
    [location, selectedBatch]
  );

  useEffect(() => {
    if (
      selectedBatch &&
      selectedSubject &&
      selectedBatch !== 'Select Batch' &&
      selectedSubject !== 'Select Subject'
    ) {
      fetchStudents(selectedBatch, selectedSubject);
    }
  }, [selectedBatch, selectedSubject, fetchStudents]);

  useEffect(() => {
    const total = students.length;
    const present = students.filter(s => s.status === 'present').length;
    setCounts({ total, present, absent: total - present });
  }, [students]);

  const toggleAttendance = studentId => {
    setStudents(
      students.map(student =>
        student.studentId === studentId
          ? {
              ...student,
              status: student.status === 'present' ? 'absent' : 'present',
            }
          : student
      )
    );
  };

  const updateRemarks = (studentId, remarks) => {
    setStudents(
      students.map(student =>
        student.studentId === studentId ? { ...student, remarks } : student
      )
    );
  };

  const saveAttendance = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateTime = `${year}-${month}-${day}`;
    const checkDate = `${year}-${month}-${day}`;

    const payload = {
      subject: selectedSubject,
      batch: selectedBatch,
      datetime: dateTime,
      location,
      students: students.map(({ studentId, name, email, status, remarks }) => ({
        studentId,
        name: name || email,
        status,
        remarks,
      })),
    };

    try {
      const checkResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendcheck`,
        {
          subject: selectedSubject,
          batch: selectedBatch,
          date: checkDate,
          location,
        }
      );

      if (
        checkResponse.status === 200 &&
        checkResponse.data.Message === 'existed'
      ) {
        Swal.fire({
          title: 'Attendance Already Submitted',
          text: `Attendance for ${selectedBatch} on ${selectedDate.toLocaleDateString()} has already been saved.`,
          icon: 'info',
        });
        return;
      } else if (
        checkResponse.status === 202 &&
        checkResponse.data.Message === 'notexisted'
      ) {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendance`,
          payload
        );

        if (response.status === 200) {
          Swal.fire({
            title: 'Attendance Successfully Saved',
            icon: 'success',
          });
          setStudents([]);
          setCounts({ total: 0, present: 0, absent: 0 });
          setSelectedSubject('');
          setSelectedBatch('');
        } else {
          console.error('Failed to save attendance:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  // const exportToExcel = () => {
  //   const data = students.map(({ studentId, name, email, status, remarks }) => ({
  //     "Student ID": studentId,
  //     "Student Name": name || email,
  //     Status: status,
  //     Remarks: remarks,
  //   }));
  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  //   XLSX.writeFile(
  //     wb,
  //     `Attendance_${selectedBatch}_${selectedDate.toISOString().split("T")[0]}.xlsx`
  //   );
  // };

  const viewAttendance = () => {
    navigate('/mentor/attendance-management/view');
  };

  return (
    <div className="mt-1">
      <h1 className="font-inter font-semibold text-[24px] sm:text-[29px] text-center text-[var(--color-secondary)] mb-4">
        Attendance Management
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-[1735px] mx-auto">
        <div className="bg-white shadow-[0_4px_20px_rgba(179,186,247,1)] rounded-[20px] p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-center">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <span className="font-inter font-semibold text-[16px] sm:text-[20px] text-[var(--color-secondary)] whitespace-nowrap">
                Select a Subject
              </span>
              <div className="relative w-full">
                <select
                  className="appearance-none bg-[#EFF0F7] rounded-[4px] w-full h-[46px] border-none px-4 pr-10 focus:outline-none text-[14px] sm:text-[16px]"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    width="13"
                    height="7"
                    viewBox="0 0 13 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.2319 0.272237L12.2315 1.27283L6.78345 6.72279C6.69615 6.81064 6.59234 6.88036 6.478 6.92793C6.36365 6.97551 6.24103 7 6.11718 7C5.99333 7 5.8707 6.97551 5.75636 6.92793C5.64201 6.88036 5.5382 6.81064 5.4509 6.72279L0 1.27283L0.999647 0.27318L6.11576 5.38835L11.2319 0.272237Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <span className="font-inter font-semibold text-[16px] sm:text-[20px] text-[var(--color-secondary)] whitespace-nowrap">
                Select a Batch
              </span>
              <div className="relative w-full">
                <select
                  className="appearance-none bg-[#EFF0F7] rounded-[4px] w-full h-[46px] border-none px-4 pr-10 focus:outline-none text-[14px] sm:text-[16px]"
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                >
                  {filteredBatches.map(batch => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    width="13"
                    height="7"
                    viewBox="0 0 13 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.2319 0.272237L12.2315 1.27283L6.78345 6.72279C6.69615 6.81064 6.59234 6.88036 6.478 6.92793C6.36365 6.97551 6.24103 7 6.11718 7C5.99333 7 5.8707 6.97551 5.75636 6.92793C5.64201 6.88036 5.5382 6.81064 5.4509 6.72279L0 1.27283L0.999647 0.27318L6.11576 5.38835L11.2319 0.272237Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
              <span className="font-inter font-semibold text-[16px] sm:text-[20px] text-[var(--color-secondary)] whitespace-nowrap">
                Select Date & Time
              </span>
              <div className="relative w-full min-w-0">
                <input
                  type="datetime-local"
                  className="appearance-none bg-[#EFF0F7] rounded-[4px] w-full h-[46px] border-none px-4 py-2 pr-4 focus:outline-none text-[14px] sm:text-[16px] overflow-hidden text-ellipsis"
                  value={selectedDate.toISOString().slice(0, 16)}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 overflow-hidden">
            <div className="flex flex-col p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="font-inter font-semibold text-[16px] sm:text-[20px] text-[var(--color-secondary)]">
                  Student Attendance
                </h2>
                <div className="flex gap-4">
                  {/* <button
                    className="flex items-center bg-[#FFFFFF] justify-center w-full sm:w-[230px] h-[46px] border-[2px] border-[#00007F] rounded-[4px] text-[var(--color-secondary)] font-semibold gap-2 text-[14px] sm:text-[16px]"
                    onClick={exportToExcel}
                    disabled={!selectedBatch}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Export to Excel</span>
                  </button> */}
                  <button
                    className="flex items-center bg-[#FFFFFF] justify-center w-full sm:w-[230px] h-[46px] border-[2px] border-[#00007F] rounded-[4px] text-[var(--color-secondary)] font-semibold gap-2 text-[14px] sm:text-[16px]"
                    onClick={viewAttendance}
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Attendance</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 w-full h-0 border-t-[1px] border-solid border-[#939393]"></div>
            </div>

            <div className="max-h-[430px] overflow-y-auto rounded-[20px] shadow-[0_4px_20px_#B3BAF7] scrollbar-thin scrollbar-thumb-[#00007F] scrollbar-track-transparent">
              <div className="grid grid-cols-12 bg-[var(--color-secondary)] text-white font-semibold text-center shadow-lg rounded-t-[20px] text-[12px] sm:text-[14px]">
                <div className="col-span-3 sm:col-span-2 py-4">Student ID</div>
                <div className="col-span-3 sm:col-span-2 py-4">Name</div>
                <div className="col-span-3 sm:col-span-2 py-4">Attendance</div>
                <div className="col-span-3 sm:col-span-6 py-4">Remarks</div>
              </div>
              <div>
                {students.map((stu, idx) => (
                  <div
                    key={stu.studentId}
                    className={`grid grid-cols-12 items-center text-center text-[12px] sm:text-[14px] ${idx % 2 === 0 ? 'bg-[#EFF0F7]' : 'bg-white'}`}
                  >
                    <div className="col-span-3 sm:col-span-2 py-4">
                      {stu.studentId}
                    </div>
                    <div className="col-span-3 sm:col-span-2 py-4 px-2">
                      {stu.name ? stu.name : stu.email}
                    </div>
                    <div className="col-span-3 sm:col-span-2 py-4 flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={stu.status === 'present'}
                          onChange={() => toggleAttendance(stu.studentId)}
                        />
                        <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[#129E00] peer-focus:ring-2 transition-colors"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform peer-checked:translate-x-4 transition-transform"></div>
                      </label>
                    </div>
                    <div className="col-span-3 sm:col-span-6 py-4 px-2">
                      <input
                        type="text"
                        placeholder="Add Remarks..."
                        className="w-full bg-[#E0E4FE] border border-[#00007F] rounded px-2 py-1 text-[12px] sm:text-[14px]"
                        value={stu.remarks}
                        onChange={e =>
                          updateRemarks(stu.studentId, e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4">
              <div className="text-[#000000] font-medium text-[12px] sm:text-[14px]"></div>
              <button
                className="bg-[var(--color-secondary)] text-white font-semibold px-6 py-3 rounded-[4px] flex items-center gap-2 text-[14px] sm:text-[16px] w-full sm:w-auto justify-center"
                onClick={saveAttendance}
                disabled={!selectedBatch}
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.2059 1.42796C16.0702 1.29225 15.9091 1.18461 15.7317 1.11118C15.5544 1.03775 15.3643 0.999969 15.1724 1H3.11101C2.83377 0.99994 2.55924 1.0545 2.30309 1.16057C2.04694 1.26664 1.8142 1.42213 1.61817 1.61817C1.42213 1.8142 1.26664 2.04694 1.16057 2.30309C1.0545 2.55924 0.99994 2.83377 1 3.11101V17.889C0.99994 18.1662 1.0545 18.4408 1.16057 18.6969C1.26664 18.9531 1.42213 19.1858 1.61817 19.3818C1.8142 19.5779 2.04694 19.7334 2.30309 19.8394C2.55924 19.9455 2.83377 20.0001 3.11101 20H17.889C18.4483 19.9983 18.9843 19.7754 19.3798 19.3798C19.7754 18.9843 19.9983 18.4483 20 17.889V5.82764C20 5.6357 19.9623 5.44563 19.8888 5.26829C19.8154 5.09094 19.7078 4.9298 19.572 4.79406L16.2059 1.42796ZM10.5 17.8077C9.92187 17.8077 9.35672 17.6363 8.87603 17.3151C8.39533 16.9939 8.02067 16.5374 7.79943 16.0032C7.57819 15.4691 7.5203 14.8814 7.63309 14.3144C7.74588 13.7473 8.02427 13.2265 8.43307 12.8177C8.84187 12.4089 9.36271 12.1305 9.92974 12.0177C10.4968 11.9049 11.0845 11.9628 11.6186 12.184C12.1527 12.4053 12.6093 12.7799 12.9304 13.2606C13.2516 13.7413 13.4231 14.3065 13.4231 14.8846C13.4236 15.2686 13.3483 15.6489 13.2016 16.0038C13.0548 16.3587 12.8395 16.6811 12.568 16.9526C12.2965 17.2241 11.974 17.4394 11.6192 17.5862C11.2643 17.7329 10.884 17.8082 10.5 17.8077ZM12.6923 7.57692H3.92308C3.72926 7.57692 3.54339 7.49993 3.40635 7.36289C3.2693 7.22584 3.19231 7.03997 3.19231 6.84615V3.92308C3.19231 3.72926 3.2693 3.54339 3.40635 3.40635C3.54339 3.2693 3.72926 3.19231 3.92308 3.19231H12.6923C12.8861 3.19231 13.072 3.2693 13.209 3.40635C13.3461 3.54339 13.4231 3.72926 13.4231 3.92308V6.84615C13.4231 7.03997 13.3461 7.22584 13.209 7.36289C13.072 7.49993 12.8861 7.57692 12.6923 7.57692Z"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Save Attendance
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-6 p-4 w-full bg-white border shadow-lg rounded-xl max-h-[520px]">
            {/* Total Students */}
            <div className="bg-white border border-[#00007F] shadow-lg rounded-xl w-full sm:w-64 md:w-72 lg:w-80 xl:w-96">
              <div className="bg-[var(--color-secondary)] rounded-t-xl px-4 py-3">
                <h3 className="text-white font-semibold text-center text-[14px] sm:text-[16px]">
                  Total Students
                </h3>
              </div>
              <div className="p-4 sm:p-7 text-center">
                <span className="text-[var(--color-secondary)] font-bold text-2xl sm:text-4xl">
                  {counts.total}
                </span>
              </div>
            </div>

            {/* Present */}
            <div className="bg-white border border-[#129E00] shadow-lg rounded-xl w-full sm:w-64 md:w-72 lg:w-80 xl:w-96">
              <div className="bg-[#129E00] rounded-t-xl px-4 py-3">
                <h3 className="text-white font-semibold text-center text-[14px] sm:text-[16px]">
                  Present
                </h3>
              </div>
              <div className="p-4 sm:p-7 text-center">
                <span className="text-[#129E00] font-bold text-2xl sm:text-4xl">
                  {counts.present}
                </span>
              </div>
            </div>

            {/* Absent */}
            <div className="bg-white border border-[#FF6000] shadow-lg rounded-xl w-full sm:w-64 md:w-72 lg:w-80 xl:w-96">
              <div className="bg-[#FF6000] rounded-t-xl px-4 py-3">
                <h3 className="text-white font-semibold text-center text-[14px] sm:text-[16px]">
                  Absent
                </h3>
              </div>
              <div className="p-4 sm:p-7 text-center">
                <span className="text-[#FF6000] font-bold text-2xl sm:text-4xl">
                  {counts.absent}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
