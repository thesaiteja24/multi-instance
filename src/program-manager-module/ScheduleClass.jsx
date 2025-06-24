import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaChevronDown,
  FaSadTear,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../reducers/batchesSlice';
import { fetchScheduleData } from '../reducers/scheduleSlice';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import { COLLEGE_CODE, COLLEGE_SUBJECTS } from '../constants/AppConstants';

const ScheduleClass = () => {
  const dispatch = useDispatch();
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );
  const { schedule, mentors, status, error } = useSelector(
    state => state.schedule
  );

  const { userInfo } = useSelector(state => state.auth);
  const location = userInfo?.location;

  const [mentorName, setMentorName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [loadingAddSchedule, setLoadingAddSchedule] = useState(false);
  const [loadingSaveChanges, setLoadingSaveChanges] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  const classesPerPage = 5;

  const techStacks = [location];

  const techStackSubjects = { [COLLEGE_CODE]: COLLEGE_SUBJECTS };

  const mockSubjects = { [COLLEGE_CODE]: COLLEGE_SUBJECTS };

  // Updated mockBatches to map subjects to KITS
  // Dynamically generate mockBatches from COLLEGE_SUBJECTS
  const mockBatches = COLLEGE_SUBJECTS.reduce((acc, subject) => {
    acc[subject] = [COLLEGE_CODE];
    return acc;
  }, {});

  const handleTechStackChange = value => {
    setSelectedTechStack(value);
    setAvailableSubjects(techStackSubjects[value] || []);
    setSelectedSubject('');
    setSelectedBatches([]);
  };

  const formatTimeTo24Hour = time => {
    if (!time) return '';
    const [timePart, modifier] = time.split(' ');
    if (!timePart || !modifier) return time;
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const formatTo12Hour = time => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute < 10 ? '0' + minute : minute} ${ampm}`;
  };

  const formatDateToString = date => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const parseDateString = dateString => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const resetForm = () => {
    setMentorName('');
    setRoomNo('');
    setSelectedTechStack('');
    setSelectedSubject('');
    setAvailableSubjects([]);
    setStartTime(null);
    setEndTime(null);
    setStartDate(null);
    setEndDate(null);
    setSelectedBatches([]);
  };

  const validateForm = () => {
    if (
      !startDate ||
      !endDate ||
      !selectedTechStack ||
      !selectedSubject ||
      !startTime ||
      !endTime ||
      !roomNo ||
      !mentorName ||
      !selectedBatches.length
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill all fields before submitting!',
      });
      return false;
    }
    if (endDate < startDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Dates',
        text: 'End Date must be on or after Start Date!',
      });
      return false;
    }
    const startTimeStr = startTime ? startTime.format('HH:mm') : '';
    const endTimeStr = endTime ? endTime.format('HH:mm') : '';
    if (
      startDate.getTime() === endDate.getTime() &&
      endTimeStr <= startTimeStr
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Times',
        text: 'End Time must be after Start Time on the same day!',
      });
      return false;
    }
    return true;
  };

  const handleEditRow = useCallback(row => {
    setEditingRowId(row.id);
    setMentorName(row.MentorName || '');
    setRoomNo(row.RoomNo || '');
    setStartDate(parseDateString(row.StartDate));
    setEndDate(parseDateString(row.EndDate));
    const detectedTechStack = Object.keys(mockSubjects).find(key =>
      mockSubjects[key].includes(row.subject)
    );
    setSelectedTechStack(detectedTechStack || '');
    setAvailableSubjects(mockSubjects[detectedTechStack] || []);
    setSelectedSubject(row.subject || '');
    setSelectedBatches(
      Array.isArray(row.batchNo)
        ? row.batchNo.map(batch => ({ value: batch, label: batch }))
        : []
    );
    setStartTime(
      row.StartTime ? moment(formatTimeTo24Hour(row.StartTime), 'HH:mm') : null
    );
    setEndTime(
      row.EndTime ? moment(formatTimeTo24Hour(row.EndTime), 'HH:mm') : null
    );
  }, []);

  const handleSaveEdit = async () => {
    if (!validateForm()) return;

    const updatedRow = {
      id: editingRowId,
      mentorName,
      roomNo,
      techStack: selectedTechStack,
      subject: selectedSubject,
      startDate: formatDateToString(startDate),
      endDate: formatDateToString(endDate),
      startTime: startTime ? formatTo12Hour(startTime.format('HH:mm')) : '',
      endTime: endTime ? formatTo12Hour(endTime.format('HH:mm')) : '',
      batches: selectedBatches.map(batch => batch.value),
      location,
    };

    setLoadingSaveChanges(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
        updatedRow
      );
      Swal.fire(
        'Success',
        response.data.message || 'Schedule updated successfully!',
        'success'
      );
      setEditingRowId(null);
      resetForm();
      await dispatch(fetchScheduleData(location)).unwrap();
    } catch (error) {
      console.error('Error updating schedule:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.response?.data?.error ||
          'Failed to update schedule. Please try again.',
      });
    } finally {
      setLoadingSaveChanges(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    resetForm();
  };

  const handleDeleteRow = async (id, batchNo, mentorName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `
        <p>You are about to delete the schedule for:</p>
        <p><strong>Batch No:</strong> ${
          Array.isArray(batchNo) ? batchNo.join(', ') : batchNo || 'N/A'
        }</p>
        <p><strong>Mentor Name:</strong> ${mentorName || 'N/A'}</p>
        <p>This action cannot be undone!</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
          {
            params: { id },
          }
        );
        Swal.fire('Deleted!', 'Schedule has been deleted.', 'success');
        await dispatch(fetchScheduleData(location));
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            error.response?.data?.error ||
            'Failed to delete schedule. Try again.',
        });
      }
    }
  };

  const handleAddBatch = async () => {
    if (!validateForm()) return;

    const selectedMentor = mentors.find(mentor => mentor.name === mentorName);
    if (!selectedMentor?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Mentor Not Found',
        text: 'Please select a valid mentor.',
      });
      return;
    }

    const newBatch = {
      mentorId: selectedMentor.id,
      mentorName,
      startDate: formatDateToString(startDate),
      endDate: formatDateToString(endDate),
      startTime: startTime ? formatTo12Hour(startTime.format('HH:mm')) : '',
      endTime: endTime ? formatTo12Hour(endTime.format('HH:mm')) : '',
      roomNo,
      techStack: selectedTechStack,
      subject: selectedSubject,
      location,
      batches: selectedBatches.map(batch => batch.value),
    };

    setLoadingAddSchedule(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
        newBatch
      );
      toast.success(response.data.message);
      toast.success(
        response.data.mentor_curriculum?.message || 'Curriculum updated.'
      );
      resetForm();
      await dispatch(fetchScheduleData(location));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.response?.data.error ||
          'Failed to add batch. Please try again.',
      });
    } finally {
      setLoadingAddSchedule(false);
    }
  };

  const fetchData = useCallback(async () => {
    const promises = [];
    if (!schedule.length && location) {
      promises.push(dispatch(fetchScheduleData(location)).unwrap());
    }
    if (!batchesList.length && location) {
      promises.push(dispatch(getBatches(location)).unwrap());
    }
    try {
      await Promise.all(promises);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error || 'Failed to fetch data. Please try again.',
      });
    }
  }, [dispatch, location, schedule.length, batchesList.length]);

  const filteredBatches = useMemo(
    () =>
      selectedSubject
        ? batchesList.filter(batch =>
            mockBatches[selectedSubject]?.includes(batch.Course)
          )
        : selectedTechStack
          ? batchesList.filter(batch => batch.Course === selectedTechStack)
          : [],
    [selectedSubject, selectedTechStack, batchesList]
  );

  const filteredData = useMemo(() => {
    return schedule.filter(row => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower
        ? Object.values({
            batchNo: Array.isArray(row.batchNo)
              ? row.batchNo.join(', ')
              : row.batchNo || '',
            MentorName: row.MentorName || '',
            Subject: row.subject || '',
            RoomNo: row.RoomNo || '',
            StartTime: row.StartTime || '',
            EndTime: row.EndTime || '',
            StartDate: row.StartDate || '',
            EndDate: row.EndDate || '',
          }).some(value => value.toString().toLowerCase().includes(searchLower))
        : true;
      const matchesRoom = roomFilter
        ? (row.RoomNo || '').toString().trim() === roomFilter.trim()
        : true;
      return matchesSearch && matchesRoom;
    });
  }, [schedule, searchTerm, roomFilter]);

  const totalPages = Math.ceil(filteredData.length / classesPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * classesPerPage;
    return filteredData.slice(startIndex, startIndex + classesPerPage);
  }, [filteredData, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roomFilter]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageChange = pageNumber => {
    setPage(pageNumber);
  };

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        items.push(1);
        if (startPage > 2) items.push('...');
      }
      for (let i = startPage; i <= endPage; i++) items.push(i);
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) items.push('...');
        items.push(totalPages);
      }
    }
    return items;
  };

  const customSelectStyles = {
    control: provided => ({
      ...provided,
      height: '50px',
      borderColor: '#07169A',
      borderRadius: '4px',
      backgroundColor: '#fff',
      color: '#666',
      fontSize: '14px',
      paddingLeft: '8px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#07169A' },
    }),
    placeholder: provided => ({ ...provided, color: '#666' }),
    multiValue: provided => ({ ...provided, backgroundColor: '#EFF0F7' }),
    multiValueLabel: provided => ({ ...provided, color: '#07169A' }),
    multiValueRemove: provided => ({
      ...provided,
      color: '#E94C61',
      ':hover': { backgroundColor: '#E94C61', color: '#fff' },
    }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
  };

  const pickerInputStyles = `
    .react-datepicker-wrapper { width: 100%; }
    .react-datepicker__input-container input {
      background-color: #fff;
      height: 40px;
      padding-left: 2.5rem;
      padding-right: 1rem;
      border: 1px solid #07169A;
      border-radius: 6px;
      font-size: 14px;
      color: #666;
      width: 100%;
      outline: none;
    }
    .rc-time-picker { width: 100%; }
    .rc-time-picker-input {
      background-color: #fff;
      height: 40px;
      padding-left: 2.5rem;
      padding-right: 1rem;
      border: 1px solid #07169A;
      border-radius: 6px;
      font-size: 14px;
      color: #666;
      width: 100%;
      outline: none;
    }
    .rc-time-picker-panel { z-index: 9999; }
    @media (min-width: 640px) {
      .react-datepicker__input-container input, .rc-time-picker-input { height: 45px; }
    }
    @media (min-width: 1280px) {
      .react-datepicker__input-container input, .rc-time-picker-input { height: 50px; }
    }
  `;

  return (
    <div className="h-full flex font-inter w-full min-h-screen mb-2 mt-2">
      <style>{pickerInputStyles}</style>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {batchesListError || error ? (
          <div className="text-center text-red-500 font-semibold mt-4">
            {batchesListError || error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 bg-white rounded-3xl p-6 xl:grid-cols-2 w-full">
              <div className="flex flex-col items-center px-4 py-6 md:px-10 xl:px-0 max-w-2xl mx-auto w-full">
                <h2 className="text-xl md:text-2xl lg:text-3xl text-[var(--color-third)] font-semibold mb-6 text-center">
                  Class Scheduling
                </h2>

                <h3 className="w-full text-lg md:text-xl lg:text-2xl font-semibold text-[var(--color-third)] mb-4">
                  Batch Details
                </h3>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      Tech Stack <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTechStack}
                        onChange={e => handleTechStackChange(e.target.value)}
                        className="appearance-none bg-white w-full h-10 sm:h-11 xl:h-12 px-4 border border-[var(--color-third)] rounded text-sm text-gray-600"
                        disabled={batchesListLoading || status === 'loading'}
                      >
                        <option value="">Select Tech Stack</option>
                        {techStacks.map(tech => (
                          <option key={tech} value={tech}>
                            {tech}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="appearance-none bg-white w-full h-10 sm:h-11 xl:h-12 px-4 border border-[var(--color-third)] rounded text-sm text-gray-600"
                        disabled={batchesListLoading || status === 'loading'}
                      >
                        <option value="">Select Subject</option>
                        {availableSubjects.map(subject => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>
                </div>

                <h3 className="w-full mt-6 sm:mt-8 text-lg md:text-xl lg:text-2xl font-semibold text-[var(--color-third)] mb-4">
                  Schedule Details
                </h3>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      Select Batches <span className="text-red-500">*</span>
                    </label>
                    <Select
                      isMulti
                      options={filteredBatches.map(batch => ({
                        value: batch.Batch,
                        label: batch.Batch,
                      }))}
                      value={selectedBatches}
                      onChange={options => setSelectedBatches(options || [])}
                      isLoading={batchesListLoading || status === 'loading'}
                      placeholder="Select Batches"
                      styles={customSelectStyles}
                      isDisabled={batchesListLoading || status === 'loading'}
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      Mentor Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={mentorName}
                        onChange={e => setMentorName(e.target.value)}
                        className="appearance-none bg-white w-full h-10 sm:h-11 xl:h-12 px-4 border border-[var(--color-third)] rounded text-sm text-gray-600"
                        disabled={status === 'loading'}
                      >
                        <option value="">Select Mentor Name</option>
                        {mentors
                          .filter(mentor =>
                            mentor.Designation?.includes(selectedSubject)
                          )
                          .map(mentor => (
                            <option key={mentor.id} value={mentor.name}>
                              {mentor.name}
                            </option>
                          ))}
                      </select>
                      <FaChevronDown className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full mt-4 sm:mt-6">
                  <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={e => setRoomNo(e.target.value)}
                    placeholder="Java-Room-1"
                    className="bg-white w-full h-10 sm:h-11 xl:h-12 px-4 border border-[var(--color-third)] rounded text-sm text-gray-600"
                  />
                </div>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full mt-4 sm:mt-6">
                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select Start Date"
                        className="bg-white w-full text-sm text-gray-600"
                      />
                      <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={endDate}
                        onChange={date => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select End Date"
                        className="bg-white w-full text-sm text-gray-600"
                      />
                      <FaCalendarAlt className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full mt-4 sm:mt-6">
                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <TimePicker
                        showSecond={false}
                        value={startTime}
                        onChange={value => {
                          setStartTime(value);
                          if (value) {
                            setEndTime(value.clone().add(90, 'minutes'));
                          } else {
                            setEndTime(null);
                          }
                        }}
                        format="h:mm A"
                        use12Hours
                        inputReadOnly
                        placeholder="Select Start Time"
                      />
                      <FaClock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full lg:w-80">
                    <label className="flex gap-1 text-base text-[var(--color-third)] font-medium">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <TimePicker
                        showSecond={false}
                        value={endTime}
                        onChange={value => setEndTime(value)}
                        format="h:mm A"
                        use12Hours
                        inputReadOnly
                        placeholder="Select End Time"
                      />
                      <FaClock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full mt-6 sm:mt-8">
                  {editingRowId ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={loadingSaveChanges || status === 'loading'}
                        className={`w-full h-10 sm:h-11 xl:h-12 text-sm sm:text-base font-medium text-white rounded-xl ${
                          loadingSaveChanges || status === 'loading'
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {loadingSaveChanges ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="w-full h-10 sm:h-11 xl:h-12 text-sm sm:text-base font-medium text-white bg-gray-500 rounded-xl hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddBatch}
                      disabled={loadingAddSchedule || status === 'loading'}
                      className={`w-full h-10 sm:h-11 xl:h-12 text-sm sm:text-base font-medium text-white rounded-xl ${
                        loadingAddSchedule || status === 'loading'
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-[var(--color-secondary)] hover:bg-[#0f1a5b]'
                      }`}
                    >
                      {loadingAddSchedule ? 'Loading...' : 'Submit'}
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden xl:flex justify-center items-center">
                <img
                  src="/frames.png"
                  alt="Scheduling Illustration"
                  className="max-w-full mx-auto"
                />
              </div>
            </div>

            <div className="w-full bg-white rounded-3xl mt-4 sm:mt-6">
              <div className="p-6">
                <div className="w-[97%] mx-auto flex flex-col lg:flex-row lg:items-center rounded-3xl shadow-md">
                  <div className="w-full lg:flex-grow h-10 sm:h-12 bg-white rounded-l-3xl px-4 flex items-center">
                    <input
                      type="text"
                      placeholder="Search in all columns..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full outline-none text-gray-600 text-sm sm:text-base lg:text-lg font-inter placeholder:text-black"
                    />
                  </div>

                  <div className="w-full lg:w-96 h-10 sm:h-12 bg-[#FFDCC9] px-4 flex items-center justify-between">
                    <select
                      value={roomFilter}
                      onChange={e => setRoomFilter(e.target.value)}
                      className="w-full bg-[#FFDCC9] text-black font-semibold text-sm sm:text-base lg:text-lg font-inter appearance-none"
                    >
                      <option value="">Filter by Room No...</option>
                      {[...new Set(schedule.map(row => row.RoomNo))]
                        .filter(Boolean)
                        .sort()
                        .map(room => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                    </select>
                    <FaChevronDown className="text-black text-sm" />
                  </div>

                  <button
                    onClick={() => setPage(1)}
                    className="w-full lg:w-12 h-10 sm:h-12 bg-[var(--color-secondary)] rounded-r-3xl flex items-center justify-center hover:bg-[#0f1a5b] text-white"
                  >
                    <FaSearch className="text-sm sm:text-base" />
                    <span className="text-xs lg:hidden ml-1">Search</span>
                  </button>
                </div>

                <div className="w-[97%] mx-auto mt-4 sm:mt-5 overflow-x-auto">
                  <div className="shadow-md w-full min-w-[800px]">
                    <table className="w-full border border-gray-200 rounded-t-3xl overflow-hidden">
                      <thead>
                        <tr className="bg-[var(--color-secondary)] text-white text-center">
                          {[
                            'Batch IDs',
                            'Mentor Name',
                            'Start Time',
                            'End Time',
                            'Start Date',
                            'End Date',
                            'Room No',
                            'Subject',
                            'Action',
                          ].map(title => (
                            <th
                              key={title}
                              className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-sm sm:text-base lg:text-lg font-inter"
                            >
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-sm sm:text-base lg:text-lg text-black text-center">
                        {status === 'loading' ? (
                          <tr>
                            <td colSpan="9" className="py-4 text-gray-600">
                              Loading...
                            </td>
                          </tr>
                        ) : paginatedData.length > 0 ? (
                          paginatedData.map((row, index) => (
                            <tr
                              key={row.id}
                              className={`${
                                index % 2 === 0 ? 'bg-white' : 'bg-[#EFF0F7]'
                              } border-t`}
                            >
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {Array.isArray(row.batchNo)
                                  ? row.batchNo.join(', ')
                                  : row.batchNo || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.MentorName || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.StartTime || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.EndTime || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.StartDate || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.EndDate || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.RoomNo || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                {row.subject || '-'}
                              </td>
                              <td className="px-2 sm:px-4 py-2 flex gap-2 justify-center">
                                <button
                                  onClick={() => handleEditRow(row)}
                                  className="bg-[#2333CB] flex items-center gap-1 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 21 21"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                  >
                                    <path
                                      d="M9.78418 1.8125H8.11751C3.95085 1.8125 2.28418 3.47917 2.28418 7.64583V12.6458C2.28418 16.8125 3.95085 18.4792 8.11751 18.4792H13.1175C17.2842 18.4792 18.9508 16.8125 18.9508 12.6458V10.9792"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M13.9838 2.66287L7.41709 9.22954C7.16709 9.47954 6.91709 9.97121 6.86709 10.3295L6.50875 12.8379C6.37542 13.7462 7.01709 14.3795 7.92542 14.2545L10.4338 13.8962C10.7838 13.8462 11.2754 13.5962 11.5338 13.3462L18.1004 6.77954C19.2338 5.64621 19.7671 4.32954 18.1004 2.66287C16.4338 0.996207 15.1171 1.52954 13.9838 2.66287Z"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeMiterlimit="10"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M13.042 3.60547C13.6003 5.59714 15.1587 7.15547 17.1587 7.72214"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeMiterlimit="10"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteRow(
                                      row.id,
                                      row.batchNo,
                                      row.MentorName
                                    )
                                  }
                                  className="bg-[#E94C61] flex items-center gap-1 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 21 21"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                  >
                                    <path
                                      d="M18.1172 5.12956C15.3422 4.85456 12.5505 4.71289 9.76719 4.71289C8.11719 4.71289 6.46719 4.79622 4.81719 4.96289L3.11719 5.12956"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M7.7002 4.2875L7.88353 3.19583C8.01686 2.40417 8.11686 1.8125 9.5252 1.8125H11.7085C13.1169 1.8125 13.2252 2.4375 13.3502 3.20417L13.5335 4.2875"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M16.3258 7.76367L15.7842 16.1553C15.6925 17.4637 15.6175 18.4803 13.2925 18.4803H7.94251C5.61751 18.4803 5.54251 17.4637 5.45085 16.1553L4.90918 7.76367"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M9.22559 13.8965H12.0006"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M8.53418 10.5625H12.7008"
                                      stroke="#FDFDFD"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="py-4 text-gray-600">
                              <FaSadTear className="mx-auto text-2xl mb-2" />
                              No schedules available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="w-full px-4 mt-4 sm:mt-6 flex justify-end">
                <div className="flex items-center gap-2 sm:gap-3 font-inter font-medium text-sm sm:text-base lg:text-lg text-black">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`px-2 sm:px-3 py-1 rounded ${
                      page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Prev
                  </button>
                  {getPaginationItems().map((item, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof item === 'number' && handlePageChange(item)
                      }
                      disabled={typeof item !== 'number'}
                      className={`px-2 sm:px-3 py-1 rounded ${
                        typeof item === 'number' && page === item
                          ? 'bg-[var(--color-third)] text-white'
                          : typeof item === 'number'
                            ? 'hover:bg-gray-100'
                            : 'cursor-default'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`px-2 sm:px-3 py-1 rounded ${
                      page === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            <div className="w-full mt-5">
              <h4 className="text-white">hhh</h4>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleClass;
