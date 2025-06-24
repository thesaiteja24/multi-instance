import React, { useState } from 'react';
import { FiBell, FiChevronDown, FiMenu } from 'react-icons/fi';
import { FaPowerOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PostLogin = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  userProfile,
  onLogout,
  isMobileView,
}) => {
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const userType = userInfo.userType;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 font-[Inter]">
      {/* Desktop Header */}
      <div
        className="hidden lg:flex items-center justify-between"
        style={{
          height: '5rem', // 80px
          margin: '1rem', // 16px
          borderRadius: '1.5rem', // 24px
          padding: '0 1rem', // 16px
          background: 'var(--color-header)',
          boxShadow: '0 0.25rem 0.25rem rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="flex items-center gap-[1rem]">
          <img
            src="/images/codegnan-destination.webp"
            alt="Codegnan Logo"
            className="h-[50px] cursor-pointer contain"
            onClick={() => navigate('/')}
          />
          <img
            src="/images/DIET-Web-Icon.webp"
            alt="Codegnan Logo"
            className="h-[80px] py-4 cursor-pointer contain"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="flex items-center gap-[0.75rem]">
          {userType === 'student_login_details' && (
            <FiBell
              style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }}
            />
          )}

          {userType === 'student_login_details' && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-[0.5rem] focus:outline-none"
              >
                <span
                  className="text-white font-medium hidden sm:block"
                  style={{ fontSize: '1rem' }}
                >
                  {userProfile.name}
                </span>
                <div
                  style={{
                    height: '2.5rem', // 40px
                    width: '2.5rem', // 40px
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#e5e7eb',
                    border: '0.125rem solid white', // 2px
                  }}
                >
                  <img
                    src={userProfile.avatarUrl}
                    alt="User Avatar"
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <FiChevronDown
                  style={{ color: '#fff', width: '1.25rem', height: '1.25rem' }}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 z-50"
                  style={{
                    marginTop: '0.5rem',
                    width: '12rem', // 192px
                    background: 'white',
                    boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0',
                  }}
                >
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex items-center w-full px-[1rem] py-[0.5rem] text-left text-black hover:bg-gray-100"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <FaPowerOff className="mr-[0.5rem]" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className="lg:hidden flex items-center justify-between"
        style={{
          height: '5.625rem', // 90px
          margin: '0.5rem',
          padding: '0 0.75rem',
          borderRadius: '0.75rem', // 12px
          background: 'var(--color-header)',
          boxShadow: '0 0.25rem 0.25rem rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="flex items-center gap-[0.75rem]">
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: '#E83E55',
              color: '#fff',
            }}
          >
            <FiMenu style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
          <img
            src="/images/codegnan-destination.webp"
            alt="Codegnan Logo"
            className="h-[50px] cursor-pointer contain"
            onClick={() => navigate('/')}
          />
          <img
            src="/images/DIET-Web-Icon.webp"
            alt="Codegnan Logo"
            className="h-[90px] py-4 cursor-pointer contain"
            onClick={() => navigate('/')}
          />
        </div>

        <FiBell style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }} />
      </div>
    </header>
  );
};

export default PostLogin;
