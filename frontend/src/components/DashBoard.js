import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PiUsersThreeDuotone } from "react-icons/pi";
import "../common/Common.css";
import moment from "moment"; // To handle date calculations
import Spinner from "../common/Spinner";
import ErrorDialogBox from "../common/ErrorDialogBox";
import caseService from "../services/case-service";
import { FaRegistered } from "react-icons/fa";
import FOSPage from "./case-microservice/FOSPage";
import { FaFileDownload } from "react-icons/fa";
import {
  FaEnvelopeOpenText,
  FaClipboardList,
  FaArrowCircleLeft,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";

const DashBoard = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectDashboardData, setDashboardData] = useState("");
  const [selectedCard, setSelectedCard] = useState(null); // Track the selected card
  const today = moment();

  const handleCardClick = (value) => {
    setSelectedCard(value); // Update the selected card
    fetchDashboardTable(value); // Your existing function call
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardDetails();
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const fetchDashboardDetails = () => {
    setLoading(true);
    caseService
      .getDashboardData(currentUser.user.username, currentUser.user.user_role)
      .then(
        (response) => {
          setDashboardData(response.data);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          setErrorMessage(error.message || "Failed to Dashboard Data.");
          setShowError(true);
        }
      );
  };

  const cardData = [
    {
      title: "All Cases",
      value: "all_cases",
      count: selectDashboardData.all_cases,
      color: "blue",
      icon: FaClipboardList,
    },
    {
      title: "Under Investigation",
      value: "under_investigation",
      count: selectDashboardData.under_investigation,
      color: "orange",
      icon: FaEnvelopeOpenText,
    },
    {
      title: "Case Submitted",
      value: "case_submitted",
      count: selectDashboardData.case_submitted,
      color: "green",
      icon: FaClipboardList,
    },
    {
      title: "Withdrawn",
      value: "withdrawn",
      count: selectDashboardData.withdrawn,
      color: "teal",
      icon: FaArrowCircleLeft,
    },
    {
      title: "Further Investigation",
      value: "further_investigation",
      count: selectDashboardData.further_investigation,
      color: "amber",
      icon: FaSearch,
    },
    {
      title: "Closed",
      value: "closed",
      count: selectDashboardData.closed,
      color: "red",
      icon: FaCheckCircle,
    },
  ];

  const fetchDashboardTable = (value) => {
    setSelectedBox(value);
    setLoading(true);

    caseService.getCasesByType("ir_status", value).then(
      (response) => {
        setCases(response.data);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorMessage(error.message || "Failed to fetch cases.");
        setShowError(true);
      }
    );
  };

  const downloadExcel = () => {
    setLoading(true);
    caseService.downloadExcel("ir_status", selectedBox).then(
      (response) => {
        // Create a Blob from the response data
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `cases_${selectedBox}.csv`); // Filename for the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorMessage(error.message || "Failed to download Excel.");
        setShowError(true);
      }
    );
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="main-card mb-4">
      <h2 className="text-title">Dashboard</h2>
      <hr className="mb-4" />
      {loading ? (
        <Spinner />
      ) : currentUser.user.user_role === "FOS" ? (
        <FOSPage selectDashboardData={selectDashboardData} />
      ) : (
        <>
          <div className="row row-cols-auto justify-center gap-8 mb-3">
            {currentUser.user.user_role === "Admin" && (
              <button
                className="catalog-item"
                onClick={() => navigate("/users")}
              >
                <h5 className="card-title">Users</h5>
                <PiUsersThreeDuotone color="grey" size={90} />
                <h2 className="count-display">{selectDashboardData.users}</h2>
              </button>
            )}
            <button
              className="catalog-item"
              onClick={() => navigate("/case-registration")}
            >
              <h5 className="card-title">Register Cases</h5>
              <FaRegistered color="grey" size={90} />
            </button>
          </div>
          <div className="container justify-center grid">
            {/* Cards */}
            <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-3 lg:grid-cols-3">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className={`catalog-card flex items-center rounded-lg shadow-xs transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
                    selectedCard === card.value
                      ? `bg-${card.color}-100 dark:bg-${card.color}-300`
                      : `bg-white dark:bg-gray-800 hover:bg-${card.color}-300 hover:text-${card.color}-100`
                  }`}
                  onClick={() => handleCardClick(card.value)}
                >
                  <div
                    className={`p-2 sm:p-3 mr-2 sm:mr-4 text-${card.color}-500 bg-${card.color}-100 rounded-full dark:text-${card.color}-100 dark:bg-${card.color}-500`}
                  >
                    <card.icon className="p-1 w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="catalog-width text-center">
                    <p className="catalog-title sm:font-size-15px lg:text-xl">
                      {card.title}
                    </p>
                    <p
                      className={`mt-2 catalog-count text-${card.color}-500 text-lg sm:text-md`}
                    >
                      {card.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBox !== null && (
            <div className="case-board">
              <div className="d-flex justify-content-between mb-2">
                <h2 className="text-title">Case Board</h2>
                <button>
                <FaFileDownload
                  color="green"
                  size={30}
                  onClick={() => downloadExcel()}
                /></button>
              </div>
              <hr className="mb-2" />
              <div className="relative overflow-x-auto shadow-md">
                {/* Table layout for larger screens */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-300">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          No
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Claim No
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Case Title
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Insurer
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Policy No
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Case Type
                        </th>
                        <th scope="col" className="px-4 py-3">
                          IR Status
                        </th>
                        <th scope="col" className="px-4 py-3">
                          TAT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((caseItem, index) => {
                        const registrationDate = moment(caseItem.doa);
                        const tat = today.diff(registrationDate, "days"); // Calculate TAT in days
                        // Set TAT thresholds based on case_type
                        var tatThreshold = 30; // Default TAT threshold
                        if (["PA", "MISCELLANEOUS"].includes(caseItem.case_type)) {
                          tatThreshold = 15; // TAT threshold for PA, miscellaneous
                        }
                        const isWarning = tat > tatThreshold && caseItem.ir_status !== "Submitted"; // Highlight row if TAT exceeds threshold
                        return (
                        <tr
                          key={caseItem.caseId}
                          className={isWarning ? "table-warning" : "odd:bg-white even:bg-gray-50 "}
                        >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">
                            <Link
                              to={`/case-detail/${caseItem.caseId}`}
                              className="text-sky-600 hover:underline"
                            >
                              {caseItem.claim_no}
                            </Link>
                          </td>
                          <td className="px-4 py-2">{caseItem.case_title}</td>
                          <td className="px-4 py-2">{caseItem.insurer}</td>
                          <td className="px-4 py-2">{caseItem.policy_no}</td>
                          <td className="px-4 py-2">{caseItem.case_type}</td>
                          <td className="px-4 py-2">{caseItem.ir_status.split("_").map((word) =>word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</td>
                          <td className="px-4 py-2">{tat} days</td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Card layout for smaller screens */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {cases.map((caseItem) => {
                    const registrationDate = moment(caseItem.registration_date);
                    const tat = today.diff(registrationDate, "days"); // Calculate TAT in days
                    // Set TAT thresholds based on case_type
                    var tatThreshold = 30; // Default TAT threshold
                    if (["PA", "MISCELLANEOUS"].includes(caseItem.case_type)) {
                      tatThreshold = 15; // TAT threshold for PA, miscellaneous
                    }
                    const isWarning =
                      tat > tatThreshold && caseItem.ir_status !== "Submitted"; // Highlight row if TAT exceeds threshold
                    return (
                      <div
                        key={caseItem.caseId}
                        className={isWarning ? "table-warning p-4 border border-gray-300 rounded-md shadow-md" : "p-4 border border-gray-300 rounded-md bg-white shadow-md"}
                      >
                        <p>
                          <strong>Claim No:</strong>{" "}
                          <Link
                            to={`/case-detail/${caseItem.caseId}`}
                            className="text-sky-600 hover:underline"
                          >
                            {caseItem.claim_no}
                          </Link>
                        </p>
                        <p>
                          <strong>Case Title:</strong> {caseItem.case_title}
                        </p>
                        <p>
                          <strong>Insurer:</strong> {caseItem.insurer}
                        </p>
                        <p>
                          <strong>Policy No:</strong> {caseItem.policy_no}
                        </p>
                        <p>
                          <strong>Case Type:</strong> {caseItem.case_type}
                        </p>
                        <p>
                          <strong>IR Status:</strong> {caseItem.ir_status.split("_").map((word) =>word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                        </p>
                        <p>
                          <strong>TAT:</strong> {tat} days
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {showError && (
        <ErrorDialogBox
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </Container>
  );
};

export default DashBoard;
