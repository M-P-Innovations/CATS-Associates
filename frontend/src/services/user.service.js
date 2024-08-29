import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_API_URL;
const requestConfig = {
  headers: {
    'x-api-key': process.env.REACT_APP_X_API_KEY
  }
}

const getPublicContent = () => {
  return axios.get(API_URL + "all");
};

const getUserBoard = () => {
  return axios.get(API_URL + "user", { headers: authHeader() });
};

const getModeratorBoard = () => {
  return axios.get(API_URL + "mod", { headers: authHeader() });
};

const getAdminBoard = () => {
  return axios.get(API_URL + "admin", { headers: authHeader() });
};

const getUsers = () => {
return axios.get(API_URL + "/users", requestConfig, {headers: authHeader()});
};

const updateUserStatus = (username, newStatus) => {
  const requestBody = {
    username: username,
    active: newStatus
  }
  return axios.put(API_URL + "/users", requestBody, requestConfig, {headers: authHeader()});
}

const deleteUser = (username) => {
  return axios.delete(API_URL + "/users"+ username, requestConfig, {headers: authHeader()});
}

const updateRole = (username, user_role) => {
  const requestBody = {
    username: username,
    user_role: user_role
  }
  return axios.put(API_URL + "/users", requestBody, requestConfig, {headers: authHeader()});
}

const userService = {
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
  getUsers,
  updateUserStatus,
  deleteUser,
  updateRole
};

export default userService