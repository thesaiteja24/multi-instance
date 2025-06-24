import React, { useState, useEffect } from 'react';

import Swal from 'sweetalert2';
import axios from 'axios';
import Select from 'react-select';
import { COLLEGE_CODE, COLLEGE_SUBJECTS } from '../constants/AppConstants';

const MentorsManagement = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    PhNumber: '',
    location: '',
    Designation: [],
    userType: 'mentor',
  });
  const [countryCodes, setCountryCodes] = useState([]);
  const [mentorCountryCode, setMentorCountryCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[9876]\d{9}$/;
  const locations = [COLLEGE_CODE];
  const designations = COLLEGE_SUBJECTS;

  // Fetch country codes
  useEffect(() => {
    // Static list of country codes
    const countryList = [
      { value: '+91', label: '+91' }, // India
      { value: '+1', label: '+1' }, // USA/Canada
      { value: '+44', label: '+44' }, // UK
      { value: '+61', label: '+61' }, // Australia
      { value: '+81', label: '+81' }, // Japan
      { value: '+49', label: '+49' }, // Germany
      { value: '+33', label: '+33' }, // France
      { value: '+86', label: '+86' }, // China
    ].sort((a, b) => a.label.localeCompare(b.label));

    setCountryCodes(countryList);
    setMentorCountryCode(
      countryList.find(c => c.value === '+91') || countryList[0]
    );
  }, []);

  // Fetch mentor data
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentor`
      );
      setData(response.data.mentors);
      setCurrentPage(1);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed to load data' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Add/Edit Modal
  const handleOpenModal = (mentor = null) => {
    if (mentor) {
      const match = mentor.PhNumber?.match(/^(\+\d+)(\d{10})$/) || [
        '',
        '+91',
        '',
      ];
      const countryCode = match[1] || '+91';
      const extractedPhoneNumber = match[2] || '';
      setFormData({
        id: mentor.id,
        name: mentor.name || '',
        email: mentor.email || '',
        PhNumber: extractedPhoneNumber,
        location: mentor.location || locations[0],
        Designation: Array.isArray(mentor.Designation)
          ? mentor.Designation
          : [],
        userType: 'mentor',
      });
      setMentorCountryCode(
        countryCodes.find(c => c.value === countryCode) || {
          value: '+91',
          label: '+91',
        }
      );
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        PhNumber: '',
        location: locations[0],
        Designation: [],
        userType: 'mentor',
      });
      setMentorCountryCode(
        countryCodes.find(c => c.value === '+91') || {
          value: '+91',
          label: '+91',
        }
      );
    }
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
    setFormData({
      id: '',
      name: '',
      email: '',
      PhNumber: '',
      location: '',
      Designation: [],
      userType: 'mentor',
    });
    setMentorCountryCode(
      countryCodes.find(c => c.value === '+91') || {
        value: '+91',
        label: '+91',
      }
    );
  };

  // Handle Designation Change
  const handleDesignationChange = selectedOptions => {
    setFormData({
      ...formData,
      Designation: selectedOptions
        ? selectedOptions.map(option => option.value)
        : [],
    });
  };

  // Validate and Save
  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.PhNumber ||
      !formData.location ||
      formData.Designation.length === 0
    ) {
      Swal.fire({ icon: 'error', title: 'Please fill all required fields.' });
      return;
    }

    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Only codegnan.com email addresses are allowed.',
      });
      return;
    }

    if (
      !phoneRegex.test(formData.PhNumber) ||
      /^(\d)\1{9}$/.test(formData.PhNumber)
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be a valid 10-digit number starting with 6, 7, 8, or 9, and not all identical digits.',
      });
      return;
    }

    const isDuplicatePhone = data.some(
      mentor =>
        mentor.PhNumber === mentorCountryCode?.value + formData.PhNumber &&
        mentor.id !== formData.id
    );
    if (isDuplicatePhone) {
      Swal.fire({ icon: 'error', title: 'This phone number already exists.' });
      return;
    }

    setIsSaving(true);
    const formattedData = {
      ...formData,
      PhNumber: mentorCountryCode?.value + formData.PhNumber,
    };

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentor`;
      let response;
      if (formData.id) {
        response = await axios.put(apiUrl, formattedData);
      } else {
        response = await axios.post(apiUrl, formattedData);
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: formData.id
            ? 'Mentor updated successfully!'
            : 'Mentor added successfully!',
        });
        await fetchData();
        handleCloseModal();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Something went wrong!';
      const status = error.response?.status;
      Swal.fire({
        icon: 'error',
        title:
          status === 400
            ? 'Bad Request'
            : status === 404
              ? 'Already Exists'
              : 'Operation Failed',
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async id => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/mentor`,
            { params: { id } }
          );
          Swal.fire({ icon: 'success', title: 'Mentor deleted successfully!' });
          await fetchData();
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Failed to delete mentor.' });
        }
      }
    });
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(data)
    ? data.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = pageNumber => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`mx-1 px-3 py-1 rounded text-[14px] font-medium ${
            currentPage === i
              ? 'bg-[#00007F] text-white'
              : 'bg-[#EFF0F7] text-[#535862] hover:bg-[#D3D5E5]'
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="w-full px-4 py-6 font-[inter] relative">
      {/* Header */}
      <div className="relative flex justify-center items-center mb-6">
        <h2 className="font-poppins font-semibold text-[25px] leading-[38px] text-[#00007F] text-center">
          Mentor Management
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="absolute right-0 top-0 font-semibold text-[14px] leading-[24px] text-white bg-[#00007F] rounded px-4 py-1.5"
        >
          + Add Mentor
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto shadow-[0_4px_20px_#B3BAF7] rounded-[12px] border border-[#E9EAEB]">
        <table className="min-w-[1200px] w-full table-auto">
          <thead className="bg-[#00007F] text-white text-left text-[18px] font-semibold leading-[28px]">
            <tr>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[100px]">
                S.No
              </th>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[200px]">
                Name
              </th>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[250px]">
                Email
              </th>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[200px]">
                Phone
              </th>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[150px]">
                Location
              </th>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[250px]">
                Designation
              </th>
              <th className="px-6 py-3 border-b border-[#E9EAEB] w-[105px] text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-[#535862] text-[16px] font-medium leading-[28px]">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? 'bg-[#EFF0F7]' : 'bg-white'}
                >
                  <td className="px-6 py-3">{indexOfFirstItem + index + 1}</td>
                  <td className="px-6 py-3">{item.name}</td>
                  <td className="px-6 py-3">{item.email}</td>
                  <td className="px-6 py-3">{item.PhNumber}</td>
                  <td className="px-6 py-3">{item.location}</td>
                  <td className="px-6 py-3">
                    {Array.isArray(item.Designation)
                      ? item.Designation.join(', ')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center items-center gap-3 bg-[#ED3001] py-2 px-3 rounded">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-white"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.2884 2.49023H3.30316C2.77385 2.49023 2.26621 2.7005 1.89193 3.07479C1.51764 3.44907 1.30737 3.95671 1.30737 4.48602V18.4565C1.30737 18.9859 1.51764 19.4935 1.89193 19.8678C2.26621 20.2421 2.77385 20.4523 3.30316 20.4523H17.2737C17.803 20.4523 18.3106 20.2421 18.6849 19.8678C19.0592 19.4935 19.2695 18.9859 19.2695 18.4565V11.4713"
                            stroke="white"
                            strokeWidth="2.521"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16.6501 2.11611C17.0471 1.71912 17.5855 1.49609 18.147 1.49609C18.7084 1.49609 19.2468 1.71912 19.6438 2.11611C20.0408 2.51309 20.2638 3.05152 20.2638 3.61295C20.2638 4.17437 20.0408 4.7128 19.6438 5.10979L10.6498 14.1048C10.4128 14.3416 10.1201 14.5149 9.79857 14.6087L6.93162 15.447C6.84575 15.472 6.75473 15.4735 6.66809 15.4513C6.58144 15.4291 6.50235 15.384 6.43911 15.3208C6.37586 15.2576 6.33078 15.1785 6.30858 15.0918C6.28638 15.0052 6.28788 14.9142 6.31293 14.8283L7.15116 11.9613C7.24549 11.6401 7.41913 11.3477 7.65609 11.1111L16.6501 2.11611Z"
                            stroke="white"
                            strokeWidth="2.521"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-white"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 22 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.26823 24.9495C3.58762 24.9495 3.00548 24.709 2.52181 24.2281C2.03814 23.7472 1.79579 23.1706 1.79477 22.4983V3.68805H1.02947C0.812127 3.68805 0.630495 3.61515 0.484578 3.46936C0.33866 3.32357 0.265191 3.14285 0.264171 2.9272C0.26315 2.71154 0.336619 2.53133 0.484578 2.38655C0.632536 2.24177 0.814167 2.16938 1.02947 2.16938H6.38658C6.38658 1.85552 6.50393 1.58216 6.73862 1.34929C6.97332 1.11643 7.24883 1 7.56515 1H14.3916C14.708 1 14.9835 1.11643 15.2182 1.34929C15.4529 1.58216 15.5702 1.85552 15.5702 2.16938H20.9273C21.1447 2.16938 21.3263 2.24227 21.4722 2.38807C21.6181 2.53386 21.6916 2.71458 21.6926 2.93023C21.6936 3.14588 21.6202 3.3261 21.4722 3.47088C21.3243 3.61566 21.1426 3.68805 20.9273 3.68805H20.162V22.4968C20.162 23.1711 19.9197 23.7482 19.435 24.2281C18.9503 24.708 18.3687 24.9485 17.6901 24.9495H4.26823ZM18.6314 3.68805H3.32538V22.4968C3.32538 22.7692 3.41364 22.9929 3.59017 23.1681C3.7667 23.3432 3.99272 23.4308 4.26823 23.4308H17.6901C17.9646 23.4308 18.1901 23.3432 18.3666 23.1681C18.5431 22.9929 18.6314 22.7692 18.6314 22.4968V3.68805ZM8.38861 20.3934C8.60596 20.3934 8.7881 20.3206 8.93504 20.1748C9.08198 20.029 9.15494 19.8488 9.15392 19.6341V7.48473C9.15392 7.26908 9.08045 7.08886 8.93351 6.94408C8.78657 6.7993 8.60443 6.72641 8.38708 6.7254C8.16974 6.72438 7.98811 6.79728 7.84219 6.94408C7.69627 7.09089 7.62331 7.27111 7.62331 7.48473V19.6341C7.62331 19.8498 7.69678 20.03 7.84372 20.1748C7.99066 20.3206 8.17229 20.3934 8.38861 20.3934ZM13.5697 20.3934C13.7871 20.3934 13.9687 20.3206 14.1146 20.1748C14.2605 20.029 14.3335 19.8488 14.3335 19.6341V7.48473C14.3335 7.26908 14.26 7.08886 14.1131 6.94408C13.9661 6.79829 13.7845 6.7254 13.5682 6.7254C13.3508 6.7254 13.1687 6.79829 13.0218 6.94408C12.8748 7.08988 12.8019 7.27009 12.8029 7.48473V19.6341C12.8029 19.8498 12.8763 20.03 13.0233 20.1748C13.1702 20.3195 13.3524 20.3924 13.5697 20.3934Z"
                            fill="white"
                          />
                          <path
                            d="M3.32538 3.68805H18.6314V22.4968C18.6314 22.7692 18.5431 22.9929 18.3666 23.1681C18.1901 23.3432 17.9646 23.4308 17.6901 23.4308H4.26823C3.99272 23.4308 3.7667 23.3432 3.59017 23.1681C3.41364 22.9929 3.32538 22.7692 3.32538 22.4968V3.68805ZM3.32538 3.68805V23.4308M4.26823 24.9495C3.58762 24.9495 3.00548 24.709 2.52181 24.2281C2.03814 23.7472 1.79579 23.1706 1.79477 22.4983V3.68805H1.02947C0.812127 3.68805 0.630495 3.61515 0.484578 3.46936C0.33866 3.32357 0.265191 3.14285 0.264171 2.9272C0.26315 2.71154 0.336619 2.53133 0.484578 2.38655C0.632536 2.24177 0.814168 2.16938 1.02947 2.16938H6.38658C6.38658 1.85552 6.50393 1.58216 6.73862 1.34929C6.97332 1.11643 7.24883 1 7.56515 1H14.3916C14.708 1 14.9835 1.11643 15.2182 1.34929C15.4529 1.58216 15.5702 1.85552 15.5702 2.16938H20.9273C21.1447 2.16938 21.3263 2.24227 21.4722 2.38807C21.6181 2.53386 21.6916 2.71458 21.6926 2.93023C21.6936 3.14588 21.6202 3.3261 21.4722 3.47088C21.3243 3.61566 21.1426 3.68805 20.9273 3.68805H20.162V22.4968C20.162 23.1711 19.9197 23.7482 19.435 24.2281C18.9503 24.708 18.3687 24.9485 17.6901 24.9495H4.26823ZM8.38861 20.3934C8.60596 20.3934 8.7881 20.3206 8.93504 20.1748C9.08198 20.029 9.15494 19.8488 9.15392 19.6341V7.48473C9.15392 7.26908 9.08045 7.08886 8.93351 6.94408C8.78657 6.7993 8.60443 6.72641 8.38708 6.7254C8.16974 6.72438 7.98811 6.79728 7.84219 6.94408C7.69627 7.09089 7.62331 7.27111 7.62331 7.48473V19.6341C7.62331 19.8498 7.69678 20.03 7.84372 20.1748C7.99066 20.3206 8.17229 20.3934 8.38861 20.3934ZM13.5697 20.3934C13.7871 20.3934 13.9687 20.3206 14.1146 20.1748C14.2605 20.029 14.3335 19.8488 14.3335 19.6341V7.48473C14.3335 7.26908 14.26 7.08886 14.1131 6.94408C13.9661 6.79829 13.7845 6.7254 13.5682 6.7254C13.3508 6.7254 13.1687 6.79829 13.0218 6.94408C12.8748 7.08988 12.8019 7.27009 12.8029 7.48473V19.6341C12.8029 19.8498 12.8763 20.03 13.0233 20.1748C13.1702 20.3195 13.3524 20.3924 13.5697 20.3934Z"
                            stroke="white"
                            strokeWidth="0.378149"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-[#535862]">
                  No mentors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-[14px] text-[#535862]">
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, data.length)} of {data.length} mentors
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded text-[14px] font-medium ${
                currentPage === 1
                  ? 'bg-[#E9EAEB] text-[#535862] cursor-not-allowed'
                  : 'bg-[#00007F] text-white hover:bg-[#00005F]'
              }`}
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded text-[14px] font-medium ${
                currentPage === totalPages
                  ? 'bg-[#E9EAEB] text-[#535862] cursor-not-allowed'
                  : 'bg-[#00007F] text-white hover:bg-[#00005F]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-[13px] w-[500px] p-[30px] flex flex-col gap-5 relative">
            <h3 className="text-[#00007F] text-center text-[24px] font-semibold leading-[36px]">
              {formData.id ? 'Edit Mentor' : 'Add Mentor'}
            </h3>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-[20px]">
                Name <span className="text-[#EC5F70]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter mentor's name"
                className="border border-[#00007F] rounded px-4 py-3 text-[#666666] text-[16px]"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-[20px]">
                Email <span className="text-[#EC5F70]">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="border border-[#00007F] rounded px-4 py-3 text-[#666666] text-[16px]"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-[20px]">
                Phone <span className="text-[#EC5F70]">*</span>
              </label>
              <div className="flex items-center border border-[#00007F] rounded">
                <Select
                  options={countryCodes}
                  value={mentorCountryCode}
                  onChange={setMentorCountryCode}
                  placeholder="Code"
                  className="w-[120px] border-r border-[#00007F]"
                  styles={{
                    control: base => ({
                      ...base,
                      border: 'none',
                      boxShadow: 'none',
                      background: 'transparent',
                    }),
                  }}
                />
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="flex-1 px-4 py-3 text-[#666666] text-[16px] border-none focus:outline-none"
                  value={formData.PhNumber}
                  onChange={e =>
                    setFormData({ ...formData, PhNumber: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Designation */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-[20px]">
                Designation <span className="text-[#EC5F70]">*</span>
              </label>
              <Select
                isMulti
                options={designations.map(subject => ({
                  value: subject,
                  label: subject,
                }))}
                value={
                  Array.isArray(formData.Designation)
                    ? formData.Designation.map(subject => ({
                        value: subject,
                        label: subject,
                      }))
                    : []
                }
                onChange={handleDesignationChange}
                className="w-full"
                styles={{
                  control: base => ({
                    ...base,
                    border: '1px solid #00007F',
                    borderRadius: '4px',
                    padding: '6px',
                  }),
                }}
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-[#00007F] font-medium text-[20px]">
                Location <span className="text-[#EC5F70]">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full h-[60px] px-[20px] pr-[40px] text-[#666666] text-[16px] font-[400] leading-[24px] border border-[#00007F] rounded-[4px] appearance-none bg-white"
                  value={formData.location}
                  onChange={e =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                >
                  {locations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-[16px] top-1/2 transform -translate-y-1/2 pointer-events-none"
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.11125 9.25984L0 2.14859L1.7775 0.371094L8 6.5936L14.2225 0.371094L16 2.14859L8.88875 9.25984C8.65301 9.49551 8.33333 9.6279 8 9.6279C7.66667 9.6279 7.34699 9.49551 7.11125 9.25984Z"
                    fill="#999999"
                  />
                </svg>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-4 mt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-[212.5px] h-[47px] rounded-[10px] flex justify-center items-center text-[18px] font-medium leading-[27px] text-white ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00007F]'
                }`}
              >
                {isSaving ? 'Saving...' : formData.id ? 'Update' : 'Save'}
              </button>
              <button
                onClick={handleCloseModal}
                className="w-[212.5px] h-[47px] bg-white border-[1.5px] border-[#00007F] rounded-[10px] flex justify-center items-center text-[#00007F] text-[18px] font-medium leading-[27px]"
              >
                Cancel
              </button>
            </div>

            {/* Close Icon */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-[30px] h-[30px] flex justify-center items-center"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 1.5L16.5 16.5M1.5 16.5L16.5 1.5"
                  stroke="#E41F3A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsManagement;
