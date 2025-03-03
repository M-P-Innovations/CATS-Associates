import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_API_URL;
const requestConfig = {
  headers: {
    "x-api-key": process.env.REACT_APP_X_API_KEY,
  },
};
var username = null;
var role = null;
const user = JSON.parse(sessionStorage.getItem("user"));
const accessToken = JSON.parse(sessionStorage.getItem("token"));
if (user) {
  username = user.user.username;
  role = user.user.user_role;
}

// Redux slice or API function
const registerCase = async (data, files, fosAssignments) => {
  try {
  const requestBody = data;

  const params = { username: username };
  const caseId = await axios
    .post(API_URL + "/case-register", requestBody, {
      params: params,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...requestConfig,
    })
    .then((response) => {
      return response.data; // Return the caseId
    })
    .catch((error) => {
      // Handle API errors and log details for debugging
      throw new Error(
        error.response.data.message || "Failed to register case."
      );
    });

     // Update fosAssignments
    if (caseId && fosAssignments) {
      await updateCaseSection(caseId, { fosAssignments });
    }
    if (files && caseId) {
      await uploadCaseFiles(caseId, "Registration_docs", files);
    }
    return caseId;
  }
  catch (error) {
    console.error("Error registering case:", error);
    throw error;
  }
};

const getCasesByType = (field, filterValue) => {
  const params = {
    username: username,
    role: role,
    fieldName: filterValue === "all_cases" ? "" : field,
    fieldValue: filterValue === "all_cases" ? "" : filterValue,
  };
  return axios.get(API_URL + "/case", {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const getDashboardData = (username, role) => {
  const params = { username: username, role: role };
  return axios.get(API_URL + "/dashboard", {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const getCaseById = (caseId, activeTab) => {
  const requestBody = {
    caseId: caseId,
    activeTab: activeTab,
  };
  const params = {
    username: username,
  };
  return axios.post(API_URL + "/case", requestBody, {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const getRTIForm = (caseId) => {
  const requestBody = {
    caseId: caseId,
  };

  const params = {
    username: username,
    form: "rti_form",
  };

  return axios.post(API_URL + "/case/form", requestBody, {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const getCourtForm = (caseId) => {
  const requestBody = {
    caseId: caseId,
  };

  const params = {
    username: username,
    form: "court_form",
  };

  return axios.post(API_URL + "/case/form", requestBody, {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const uploadCaseFiles = async (caseId, section, files) => {
  const filenames = files.map((file) => file.name);

  const params = {
    username: username,
    caseId: caseId,
    section: section,
  };

  const requestBody = {
    filenames: filenames,
  };

  try {
    const response = await axios.post(`${API_URL}/case/upload`, requestBody, {
      params: params,
      headers: {
        "x-access-token": accessToken,
      },...requestConfig,
    });

    const presignedUrls = response.data;

    // Step 2: Upload each file to its corresponding pre-signed URL
    for (const file of files) {
      const presignedUrl = presignedUrls.data[file.name];
      if (!presignedUrl) {
        throw new Error(`Missing pre-signed URL for file: ${file.name}`);
      }

      const response = await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": "multipart/form-data", // Fallback to generic type
        },
      });

      if (response.status === 200) {
        createZip(caseId);
      }
    }

    return { message: "Files uploaded successfully" };
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

const uploadCasepdf = async (caseId, section, pdf) => {
  const blob = pdf.output("blob");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filenames = [`${caseId}_images_${timestamp}.pdf`];
  const formData = new FormData();
  formData.append("files", blob, filenames);

  const params = {
    username: username,
    caseId: caseId,
    section: section,
  };

  const requestBody = {
    filenames: filenames,
  };

  try {
    const response = await axios.post(`${API_URL}/case/upload`, requestBody, {
      params: params,
      headers: {
        "x-access-token": accessToken,
      },...requestConfig,
    });

    const presignedUrls = response.data;
    // Step 2: Upload each file to its corresponding pre-signed URL
    const presignedUrl = presignedUrls.data[filenames];
    if (!presignedUrl) {
      throw new Error(`Missing pre-signed URL for file: ${filenames}`);
    }

    const response1 = await axios.put(presignedUrl, blob, {
      headers: {
        "Content-Type": "multipart/form-data", // Fallback to generic type
      },
    });

    if (response1.status === 200) {
      createZip(caseId);
    }

    return { message: "Files uploaded successfully" };
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

const updateCaseSection = (caseId, sectionData) => {
  const requestBody = {
    sectionData: sectionData,
  };
  const params = {
    username: username,
    role: role,
    caseId: caseId
  };
  return axios.put(API_URL + "/case", requestBody, {
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const downloadExcel = (field, filterValue) => {
  const params = {
    username: username,
    role: role,
    fieldName: field,
    fieldValue: filterValue,
  };
  return axios.get(API_URL + "/case/download", {
    responseType: "arraybuffer",
    params: params,
    headers: authHeader(),
    ...requestConfig,
  });
};

const getDownloadUrl = async (caseId) => {
  try {
    const params = {
      username: username,
      role: role,
      download_all: true,
      caseId: caseId,
    };

    // Call the backend to get the pre-signed URL
    const response = await axios.get(`${API_URL}/case/download`, {
      params: params,
      headers: authHeader(),
      ...requestConfig,
    });

    if (response.data === "No files to download.") {
      throw new Error("No files to download.");
    }
    return response;
  } catch (error) {
    if (error.status === 404) {
      alert("No files to download.");
    }
    else {
      alert("Error fetching download URL:", error.message);
    }
    console.error("Error fetching download URL:", error.message);
  }
};

const createZip = async (caseId) => {
  try {
    const params = {
      username: username,
      role: role,
      caseId: caseId,
      createZipfile: true
    };

    // Call the backend to get the pre-signed URL
    const response = await axios.get(`${API_URL}/case/upload`, {
      params: params,
      headers: authHeader(),
      ...requestConfig,
    });

    return response;
  } catch (error) {
    console.error("Error fetching download URL:", error.message);
  }
};

const caseService = {
  registerCase,
  getCasesByType,
  getCaseById,
  getRTIForm,
  getCourtForm,
  uploadCaseFiles,
  uploadCasepdf,
  getDashboardData,
  updateCaseSection,
  downloadExcel,
  getDownloadUrl,
};
export default caseService;
