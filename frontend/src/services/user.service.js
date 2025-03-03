import axios from "axios";
import authHeader from "./auth-header";

let API_URL = process.env.REACT_APP_API_URL;
console.log(API_URL);
if (API_URL.includes("localhost")) {
  API_URL = "http://localhost:8081";
}
const requestConfig = {
  headers: {
    'x-api-key': process.env.REACT_APP_X_API_KEY
  }
}

var username = null;
const user = JSON.parse(sessionStorage.getItem("user"));
if (user) {
  username = user.user.username;
}

const getUsers = () => {
return axios.get(API_URL + "/users", requestConfig, {headers: authHeader()});
};

const getUser = () => {
  const requestBody = {
    username: username,
  }
  return axios.post(API_URL + "/users", requestBody, requestConfig, {headers: authHeader()});
};

const updateUserStatus = (username, newStatus) => {
  const requestBody = {
    username: username,
    active: newStatus
  }
  return axios.put(API_URL + "/users", requestBody, requestConfig, {headers: authHeader()});
}

const updateRole = (username, user_role) => {
  const requestBody = {
    username: username,
    user_role: user_role
  }
  return axios.put(API_URL + "/users", requestBody, requestConfig, {headers: authHeader()});
}
const updateprofile = (formData) => {
  const requestBody = {
    username: username,
    profile: formData
  }
  return axios.put(API_URL + "/users", requestBody, requestConfig, {headers: authHeader()});
}

const userService = {
  getUsers,
  getUser,
  updateUserStatus,
  updateRole,
  updateprofile
};

export default userService