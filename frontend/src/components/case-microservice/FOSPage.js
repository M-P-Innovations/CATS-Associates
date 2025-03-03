import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import Spinner from "../../common/Spinner";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import caseService from "../../services/case-service";
import "../../common/Common.css";
import moment from "moment"; // To handle date calculations
import { FaClipboardList } from "react-icons/fa";

export default function FOSPage({ selectDashboardData }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // Track the selected card
  const today = moment();

  const handleCardClick = (value) => {
    setSelectedCard(value); // Update the selected card
    fetchDashboardTable(value); // Your existing function call
  };

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

  const cardData = [
    {
      title: "Assigned Cases",
      value: "all_cases",
      count: selectDashboardData.all_cases,
      color: "blue",
      icon: FaClipboardList,
    }
  ];

  return (
    <Container className="mt-4 mb-4 justify-items-center">
      <div className="container justify-center grid">
        {/* Cards */}
        <div className="grid">
          {cardData.map((card, index) => (
            <div
              key={index}
              className={`flex items-center p-3 sm:p-4 rounded-lg shadow-xs transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
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
      {selectedBox && (
        <div className="case-board">
          {loading ? (
            <Spinner />
          ) : (
            <div className="relative overflow-x-auto shadow-md">
              <div className="d-flex justify-content-between mb-2">
                <h2 className="text-title">Case Board</h2>
              </div>
              <hr className="mb-2" />
              <div className="relative overflow-x-auto shadow-md">
                {/* Table layout for larger screens */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-300">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Case Id
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Claim No
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
                      {cases.map((caseItem) => {
                        const registrationDate = moment(caseItem.registration_date);
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
                          <td className="px-4 py-2">
                            <Link
                              to={`/case-detail/${caseItem.caseId}`}
                              className="text-sky-600 hover:underline"
                            >
                              {caseItem.caseId}
                            </Link>
                          </td>
                          <td className="px-4 py-2">{caseItem.claim_no}</td>
                          <td className="px-4 py-2">{caseItem.case_type}</td>
                          <td className="px-4 py-2">{caseItem.ir_status}</td>
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
                          <strong>Case Id:</strong>{" "}
                          <Link
                            to={`/case-detail/${caseItem.caseId}`}
                            className="text-sky-600 hover:underline"
                          >
                            {caseItem.caseId}
                          </Link>
                        </p>
                        <p>
                          <strong>Claim No:</strong> {caseItem.claim_no}
                        </p>
                        <p>
                          <strong>Cast Type:</strong> {caseItem.case_type}
                        </p>
                        <p>
                          <strong>IR Status:</strong> {caseItem.ir_status}
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
        </div>
      )}
      {showError && (
        <ErrorDialogBox
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </Container>
  );
}
