import React, { useState, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import CurriculumTable from './CurriculumTable.jsx';
import './CurriculumTable.css';
import { useDispatch, useSelector } from 'react-redux';
import { getMentorStudentsThunk } from '../reducers/mentorStudentsSlice.js';

const CurriculumManagement = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const location = userInfo?.location;
  const mentorId = userInfo?.id;
  const { scheduleData } = useSelector(state => state.mentorStudents);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    if (scheduleData.length === 0) {
      dispatch(getMentorStudentsThunk({ location, mentorId }));
    }
  }, [dispatch, location, mentorId, scheduleData.length]);

  useEffect(() => {
    if (Array.isArray(scheduleData)) {
      const uniqueSubjects = [
        ...new Set(scheduleData.map(item => item.subject)),
      ].filter(Boolean);
      setAvailableSubjects(uniqueSubjects);
    }
  }, [scheduleData]);

  useEffect(() => {
    if (selectedSubject && Array.isArray(scheduleData)) {
      const batches = scheduleData
        .filter(entry => entry.subject === selectedSubject)
        .flatMap(entry => entry.batchNo)
        .filter(Boolean);
      setFilteredBatches([...new Set(batches)]);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedSubject, scheduleData]);

  return (
    <div className="w-full max-w-full mx-auto mt-6 rounded-md min-h-[500px] md:p-2">
      <div className="px-4 py-6 font-[inter]">
        <h2 className="text-[22px] sm:text-[25px] leading-[30px] font-semibold text-[var(--color-secondary)] text-center">
          Course Curriculum
        </h2>
        <div className="mt-10 flex flex-col md:flex-row justify-between gap-6 md:gap-24">
          <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 sm:gap-5">
            <label className="text-[20px] sm:text-[25px] font-semibold text-[var(--color-secondary)]">
              Select a Subject
            </label>
            <div className="relative w-full sm:w-[257px] h-[45px] bg-white shadow-md rounded-[10px] flex items-center justify-between  ">
              <select
                className="w-full text-[var(--color-secondary)] p-4 text-[16px] font-medium  appearance-none bg-transparent focus:outline-none cursor-pointer"
                value={selectedSubject}
                onChange={e => {
                  setSelectedSubject(e.target.value);
                  setSelectedBatch('');
                }}
                aria-label="Select a subject"
              >
                <option value="" className="p-2 sm:p-3 px-3 sm:px-4">
                  Choose Subject
                </option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <IoIosArrowDown className="absolute right-4 text-black text-lg pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-2 sm:gap-5">
            <label className="text-[20px] sm:text-[25px] font-semibold text-[var(--color-secondary)]">
              Select a Batch
            </label>
            <div className="relative w-full sm:w-[257px] h-[45px] bg-white shadow-md rounded-[10px] flex items-center justify-between ">
              <select
                className="w-full text-[var(--color-secondary)] text-[16px] font-medium appearance-none bg-transparent focus:outline-none cursor-pointer p-4"
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                disabled={!selectedSubject}
                aria-label="Select a batch"
              >
                <option value="">Choose Batch</option>
                {filteredBatches.map(batch => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
              <IoIosArrowDown className="absolute right-4 text-black text-lg pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto flex items-center justify-center h-full">
        <CurriculumTable
          subject={selectedSubject}
          batch={selectedBatch}
          mentorId={mentorId}
        />
      </div>
    </div>
  );
};

export default CurriculumManagement;
