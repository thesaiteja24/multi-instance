import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { loginUserThunk } from '../reducers/authSlice.js';
import { toast } from 'react-toastify';
import Footer from '../Home/Footer.jsx';
import { LOGIN_URL } from '../constants/APIURLConstants.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      const isEmail = trimmedUsername.includes('@');
      const payload = isEmail
        ? { email: trimmedUsername.toLowerCase(), password: trimmedPassword }
        : { studentId: trimmedUsername, password: trimmedPassword };

      const resultAction = await dispatch(
        loginUserThunk({ url: LOGIN_URL, payload })
      ).unwrap();
      const { status, message } = resultAction;
      if (status === 200) {
        toast.success(message || 'Logged In Successfully');
      } else {
        toast.error(message || 'Login failed. Please try again.');
      }
    } catch (error) {
      // Parse error if it's stringified
      let errorObj = error;
      if (typeof error === 'string') {
        try {
          errorObj = JSON.parse(error);
        } catch (e) {
          errorObj = { message: error };
        }
      }

      const status = errorObj.status || 500;
      const message =
        errorObj.message || 'An unexpected error occurred. Please try later.';

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error(
          'Network Error: Please check your internet connection and try again.'
        );
      } else if (status === 404) {
        toast.error(message || 'User not found. Please check your details.');
      } else if (status === 400) {
        toast.error(message || 'Invalid credentials. Please try again.');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex row items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8 student-login-container mt-16 bg-[url('/images/login-bg.webp')]">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">
          {/* Cartoon Image */}
          <div className="flex justify-center items-center w-full md:w-1/2">
            <img
              src="/images/login-cartoon.webp"
              alt="Cartoon logo"
              className="w-full max-w-lg"
            />
          </div>

          {/* Login Form */}
          <div className="w-full md:w-1/3">
            <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
                Login
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email or Student ID */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="block w-full p-1 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="Enter Your Email"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="block w-full p-1 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="Enter Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-[#0737EE] font-semibold hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className={`w-full py-2 px-4 mt-0 text-2xl font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[#0737EE] hover:bg-blue-700'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
