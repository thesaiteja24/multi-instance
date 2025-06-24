import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import './Login';
import Footer from '../Home/Footer';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // Toggle state for new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle state for confirm password visibility
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const navigate = useNavigate();

  const handleEmailSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const lowerCaseEmail = email.toLowerCase();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/forgotpassword`,
        { email: lowerCaseEmail }
      );
      if (response.status === 200) {
        Swal.fire(
          'Email Sent!',
          'Please check your email for the OTP.',
          'success'
        );
        setStep(2);
      } else {
        Swal.fire(
          'Error',
          'Email not found. Please enter a registered email.',
          'error'
        );
      }
    } catch (error) {
      if (error.response.status === 400) {
        Swal.fire(
          'Error',
          'Email not found. Please enter a registered email.',
          'error'
        );
      }
      console.error('Error checking email:', error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();

    setLoading(true);
    const lowerCaseEmail = email.toLowerCase();
    const OTP = otp;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/verifyotp`,
        {
          email: lowerCaseEmail,
          otp: OTP,
        }
      );

      if (response.status === 200) {
        Swal.fire(
          'Success!',
          'OTP verified successfully. You can now reset your password.',
          'success'
        );
        setStep(3);
      } else {
        Swal.fire('Error', 'Invalid OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Swal.fire(
        'Error',
        'Something went wrong. Please try again later.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const lowerCaseEmail = email.toLowerCase();

    if (!passwordRegex.test(newPassword)) {
      Swal.fire(
        'Error',
        'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.',
        'error'
      );
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match.', 'error');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/updatepassword`,
        {
          email: lowerCaseEmail,
          password: newPassword,
        }
      );
      if (response.status === 200) {
        Swal.fire(
          'Success',
          'Your password has been reset. Please log in with your new password.',
          'success'
        );
        navigate('/login');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Swal.fire(
        'Error',
        'Failed to reset password. Please try again later.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex row items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8 student-login-container bg-[url('/images/login-bg.webp')]">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">
          <div className="flex justify-center items-center w-full md:w-1/2">
            <img
              src="/images/login-cartoon.webp"
              alt="Cartoon logo"
              className="w-full max-w-lg"
            />
          </div>
          <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Enter OTP'}
              {step === 3 && 'Reset Password'}
            </h2>

            {step === 1 && (
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="block w-full p-3 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    className="block w-full p-3 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="Enter the OTP sent to your email"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      className="block w-full p-3 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    >
                      {!showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="block w-full p-3 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    >
                      {!showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
