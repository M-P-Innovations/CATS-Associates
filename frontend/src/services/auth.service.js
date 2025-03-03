import axios from "axios";
import { Navigate } from "react-router-dom";

let API_URL = process.env.REACT_APP_API_URL;
if (API_URL.includes("localhost")) {
  API_URL = "http://localhost:8081";
}
const requestConfig = {
  headers: {
    'x-api-key': process.env.REACT_APP_X_API_KEY
  }
}

const register = (username, name, email, city, mobile_number, password, logoValue) => {
  const requestBody = {
    username: username,
    name: name,
    email: email,
    city: city,
    mobile_number: mobile_number,
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
    sessionStorage.setItem("user", JSON.stringify(response.data));
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
    otp: otp
  }
  const params ={
    username: username,
  }
  const response = await axios
    .post(API_URL + "/otp/verify-otp", requestBody,{ params: params, ...requestConfig});
  return response.data;
}

const resetPassword = async (username, password) => {
  const requestBody = {
    username: username,
    reset_pass: password
  }
  const response = await axios
    .put(API_URL + "/users", requestBody, requestConfig);
  return response.data;
}

const logout = () => {
  sessionStorage.clear();
  <Navigate to="/login" />;
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
