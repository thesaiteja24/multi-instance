import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../reducers/batchesSlice.js';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatePicker } from 'antd';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { COLLEGE_CODE } from '../constants/AppConstants.js';

const techStacks = {
  [COLLEGE_CODE]: [COLLEGE_CODE],
};

// Validation schema
const schema = yup.object().shape({
  BatchId: yup
    .string()
    .required('Batch ID is required')
    .trim()
    .uppercase()
    .test('unique-batch-id', 'Batch ID already exists', function (value) {
      const batchesList = this.options.context?.batchesList || [];
      return !batchesList.some(batch => batch.Batch?.toUpperCase() === value);
    }),
  TechStack: yup.string().required('Tech Stack is required'),
  StartDate: yup
    .date()
    .required('Start Date is required')
    .typeError('Invalid Start Date'),
  EndDate: yup
    .date()
    .required('End Date is required')
    .typeError('Invalid End Date')
    .min(yup.ref('StartDate'), 'End Date must be after Start Date'),
  Status: yup.string().required('Status is required'),
});

const ScheduleBatch = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const loc = userInfo?.location;
  const navigate = useNavigate();
  const { batchesList, batchesListLoading, batchesListError } = useSelector(
    state => state.batches
  );

  const [duration, setDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(COLLEGE_CODE);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    context: { batchesList },
    mode: 'onChange',
    defaultValues: {
      BatchId: '',
      TechStack: '',
      StartDate: null,
      EndDate: null,
      Status: '',
    },
  });

  const startDate = watch('StartDate');
  const endDate = watch('EndDate');

  // Validate location from sessionStorage
  useEffect(() => {
    if (loc) {
      try {
        if ([COLLEGE_CODE].includes(loc)) {
          setLocation(loc);
        } else {
          console.error('Invalid location:', loc);
          Swal.fire({
            title: 'Error!',
            text: 'Invalid location. Please log in again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      } catch (err) {
        console.error('Error processing location:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to process location. Please log in again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } else {
      console.error('No location found in sessionStorage');
      Swal.fire({
        title: 'Error!',
        text: 'No location found. Please log in again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }, [loc]);

  // Fetch batches based on location (once per location change)
  useEffect(() => {
    if (location) {
      dispatch(getBatches(location));
    }
  }, [location, dispatch]);

  // Calculate duration
  useEffect(() => {
    if (startDate && endDate) {
      const holidays = [
        '2025-01-14',
        '2025-01-26',
        '2025-02-26',
        '2025-03-30',
        '2025-03-31',
        '2025-04-06',
        '2025-08-15',
        '2025-08-27',
        '2025-10-02',
        '2025-10-20',
        '2025-12-25',
      ];

      const start = new Date(startDate);
      const end = new Date(endDate);
      let currentDate = new Date(start);
      let workingDays = 0;

      while (currentDate <= end) {
        const isSunday = currentDate.getDay() === 0;
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        const isHoliday = holidays.includes(formattedDate);

        if (!isSunday && !isHoliday) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const newDuration = `${workingDays} Days`;
      if (duration !== newDuration) {
        setDuration(newDuration);
      }
    } else if (duration !== null) {
      setDuration(null);
    }
  }, [startDate, endDate, duration]);

  const onSubmit = async data => {
    setIsLoading(true);
    const payload = {
      BatchId: data.BatchId.toUpperCase(),
      TechStack: data.TechStack,
      StartDate: data.StartDate
        ? format(new Date(data.StartDate), 'yyyy-MM-dd')
        : '',
      EndDate: data.EndDate ? format(new Date(data.EndDate), 'yyyy-MM-dd') : '',
      Duration: duration,
      Status: data.Status,
      location,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/batches`,
        payload
      );
      Swal.fire({
        title: 'Success!',
        text: response.data.message || 'Batch Created Successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      dispatch(getBatches(location));

      // Reset form
      setValue('BatchId', '');
      setValue('TechStack', '');
      setValue('StartDate', null);
      setValue('EndDate', null);
      setValue('Status', '');
      setDuration(null);
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text:
          err.response?.data?.error ||
          'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBatches = e => {
    e.preventDefault();
    navigate('/program-manager/view-batch');
  };

  return (
    <div className="mt-10 items-center justify-center p-4 font-[Inter]">
      <h2 className="text-[var(--color-secondary)] text-2xl font-semibold text-center mb-6">
        Create New Batch
      </h2>
      {batchesListError && (
        <p className="text-center text-red-500 font-semibold mb-4">
          {batchesListError}
        </p>
      )}
      <div className="flex flex-col lg:flex-row items-center justify-around w-full">
        <div className="bg-white rounded-2xl shadow-[0_3.94px_19.72px_#B3BAF7] p-6 w-full max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-black text-lg font-medium mb-2">
                  Tech Stack
                </label>
                <select
                  {...register('TechStack')}
                  className="bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-lg p-3 text-[#888888] text-base focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  disabled={batchesListLoading}
                >
                  <option value="" disabled>
                    Select a Tech Stack
                  </option>
                  {techStacks[location]?.map(stack => (
                    <option key={stack} value={stack}>
                      {stack}
                    </option>
                  ))}
                </select>
                {errors.TechStack && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.TechStack.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-black text-lg font-medium mb-2">
                  Batch ID
                </label>
                <input
                  type="text"
                  {...register('BatchId', {
                    onChange: e =>
                      setValue('BatchId', e.target.value.toUpperCase()),
                  })}
                  placeholder="Enter Batch ID"
                  className="bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-lg p-3 text-[#888888] text-base focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  disabled={batchesListLoading}
                />
                {errors.BatchId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.BatchId.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-black text-lg font-medium mb-2">
                  Start Date
                </label>
                <DatePicker
                  format="YYYY-MM-DD"
                  onChange={date => {
                    setValue('StartDate', date ? date.toDate() : null, {
                      shouldValidate: true,
                    });
                  }}
                  className="bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-lg p-3 text-[#888888] text-base focus:outline-none focus:ring-2 focus:ring-[#00007F] w-full"
                  disabled={batchesListLoading}
                  value={startDate ? dayjs(startDate) : null}
                />
                {errors.StartDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.StartDate.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-black text-lg font-medium mb-2">
                  End Date
                </label>
                <DatePicker
                  format="YYYY-MM-DD"
                  onChange={date => {
                    setValue('EndDate', date ? date.toDate() : null, {
                      shouldValidate: true,
                    });
                  }}
                  disabledDate={current =>
                    current && startDate && current < dayjs(startDate)
                  }
                  className="bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-lg p-3 text-[#888888] text-base focus:outline-none focus:ring-2 focus:ring-[#00007F] w-full"
                  disabled={batchesListLoading}
                  value={endDate ? dayjs(endDate) : null}
                />
                {errors.EndDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.EndDate.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-black text-lg font-medium mb-2">
                  Course Duration
                </label>
                <div className="bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-lg p-3 text-[#888888] text-base">
                  {duration ? duration : 'Select Start and End Date'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-black text-lg font-medium mb-2">
                  Status
                </label>
                <select
                  {...register('Status')}
                  className="bg-[#EFF0F7] border border-[var(--color-secondary)] rounded-lg p-3 text-[#888888] text-base focus:outline-none focus:ring-2 focus:ring-[#00007F]"
                  disabled={batchesListLoading}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
                {errors.Status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.Status.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-around">
              <button
                type="submit"
                disabled={isLoading || batchesListLoading}
                className={`bg-[var(--color-secondary)] text-white w-full rounded-lg py-3 px-6 text-lg font-medium transition ${
                  isLoading || batchesListLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[var(--color-secondary)]/90'
                }`}
              >
                {isLoading ? 'Submitting...' : 'Create Batch'}
              </button>
              <button
                onClick={handleViewBatches}
                className="border border-[var(--color-secondary)] w-full text-[var(--color-secondary)] rounded-lg py-3 px-6 text-lg font-medium hover:bg-[var(--color-secondary)]/10 transition"
                disabled={batchesListLoading}
              >
                View Batch
              </button>
            </div>
          </form>
        </div>
        <div className="hidden lg:block w-5/12 flex-wrap">
          <img src="/kits/Frame.png" alt="bg" className="w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ScheduleBatch;
