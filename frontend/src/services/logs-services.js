import axios from "axios";
import authHeader from "./auth-header";

let API_URL = process.env.REACT_APP_API_URL;
if (API_URL.includes("localhost")) {
  API_URL = "http://localhost:8081";
}
const requestConfig = {
  headers: {
    "x-api-key": process.env.REACT_APP_X_API_KEY,
  },
};


const fetchLogs = (startDate, endDate, caseId) => {
  const requestBody = {
    startDate: startDate,
    endDate: endDate
  }
  const params = {
    caseId: caseId
  }
  return axios.post(API_URL + "/logs", requestBody, {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const logsServices = {
  fetchLogs,
};
export default logsServices;
