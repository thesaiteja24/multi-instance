import axios from 'axios';
import { LOGOUT_URL } from '../constants/APIURLConstants';

const loginUser = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);

    // Destructure necessary data from the response
    const { status, data } = response;
    const { message, user } = data;

    return {
      status,
      message,
      userInfo: {
        id: data.id,
        profileStatus: user.Profile,
        userType: user.userType,
        email: user.email,
        location: user.location || 'all',
      },
    };
  } catch (error) {
    // Handle error appropriately
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data?.message || 'Failed to login';
    throw new Error(JSON.stringify({ status, message }));
  }
};

const logoutUser = async () => {
  try {
    const response = await axios.post(LOGOUT_URL);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to logout');
  }
};

export { loginUser, logoutUser };
