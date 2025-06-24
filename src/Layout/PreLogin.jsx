import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PreLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hideLoginButton =
    location.pathname === '/login' || location.pathname.startsWith('/admin');

  return (
    <div className="fixed w-full h-16 bg-white flex items-center justify-between  px-6 z-50 shadow-md">
      <div className=" gap-4 flex items-center justify-center">
        <img
          src="/images/codegnan-destination.webp"
          alt="Codegnan Logo"
          className="h-[50px]  cursor-pointer"
          onClick={() => navigate('/')}
        />
        <img
          src="/images/DIET-Web-Icon.webp"
          alt="Dhanekula Logo"
          className="h-[90px] py-6  cursor-pointer "
          onClick={() => navigate('/')}
        />
      </div>
      <div>
        {!hideLoginButton && (
          <button
            className="p-2 bg-[#c30f41] w-28 text-white font-serif font-medium text-lg rounded-lg shadow-lg  hover:bg-[#132ee0] hover:shadow-xl hover:scale-105 transition-all  ease-in-out px-8"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default PreLogin;
