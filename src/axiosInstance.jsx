import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('jwt_token'); // Retrieve token from cookies

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response, // Return successful response as is
  error => {
    const navigate = useNavigate();

    if (error.response?.status === 401 || error.response?.status === 403) {
      Cookies.remove('jwt_token'); // Remove expired token
      // window.location.href = "/login"; // Redirect to login page
      navigate('/login');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
