import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const requestConfig = {
  headers: {
    'x-api-key': process.env.REACT_APP_X_API_KEY
  }
}

const register = (username, name, email, city, password, logoValue) => {
  const requestBody = {
    username: username,
    name: name,
    email: email,
    city: city,
    password: password,
    logoValue: logoValue
  }
  return axios.post(API_URL + "/register", requestBody, requestConfig);
};

const login = async (username, password) => {
  const requestBody = {
    username: username,
    password: password
  }
  const response = await axios
    .post(API_URL + "/login", requestBody, requestConfig);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const sendotp = async (username) => {
  const requestBody = {
    username: username
  }
  const response = await axios
    .post(API_URL + "/otp/send-otp", requestBody, requestConfig);
  return response.data;
}

const verifyOtp = async (username, otp) => {
  const requestBody = {
    username: username,
    otp: otp
  }
  const response = await axios
    .post(API_URL + "/otp/verify-otp", requestBody, requestConfig);
  return response.data;
}

const resetPassword = async (username, password) => {
  const requestBody = {
    username: username,
    password: password
  }
  const response = await axios
    .post(API_URL + "/login/reset-password", requestBody, requestConfig);
  return response.data;
}

const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  login,
  logout,
  sendotp,
  verifyOtp,
  resetPassword
};

export default authService;
