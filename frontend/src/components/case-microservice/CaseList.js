import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import caseService from "../../services/case-service";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Spinner from "../../common/Spinner";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import Pagination from "react-bootstrap/Pagination";
import "../../common/Common.css";
import moment from "moment"; // To handle date calculations
import { filters } from "../../common/models/Filters";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IR_status } from "../../common/models/IR-status";

const CaseList = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [field, setField] = useState(""); // Selected field
  const [filterValue, setFilterValue] = useState(""); // Input value for filter

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10; // Number of cases to display per page

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCases = () => {
    setLoading(true);
    caseService.getCasesByType(field, filterValue).then(
      (response) => {
        // Sort cases so that "submitted" is displayed last
        const sortedCases = response.data.sort((a, b) => {
          if (a.ir_status === "Submitted" && b.ir_status !== "Submitted") {
            return 1; // Push "submitted" to the bottom
          } else if (
            a.ir_status !== "Submitted" &&
            b.ir_status === "Submitted"
          ) {
            return -1; // Keep other statuses above "submitted"
          } else {
            return 0; // Keep the order for other statuses the same
          }
        });
        setCases(sortedCases);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorMessage(error.message || "Failed to fetch cases.");
        setShowError(true);
      }
    );
  };

  // const removeFilter = () => {
  //   setLoading(true);
  //   setFilterValue("");
  //   setField("");
  //   fetchCases();
  // }

  // Pagination logic
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase);
  const today = moment(); // Current date using moment.js for date manipulation
  const ir_status = IR_status;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Define filter options for the dropdown
  const filterFields = filters;

  // Handle field change
  const handleFieldChange = (e) => {
    setField(e.target.value);
  };
  // Handle value input change
  const handleValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  const handleBackClick = () => {
    navigate(-1); // This navigates to the previous page in history
  };

  const updateCaseStatus = (caseId, newStatus) => {
    setLoading(true);
    caseService
      .updateCaseSection(caseId, { ir_status: newStatus })
      .then(() => {
        setCases((prevCases) =>
          prevCases.map((c) =>
            c.caseId === caseId ? { ...c, ir_status: newStatus } : c
          )
        );
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage(error.message || "Failed to update status.");
        setShowError(true);
      });
  };

  if (!currentUser) {
    return <Navigate to="/login" />;
  } else if (currentUser.user.user_role !== "Admin") {
    return (
      <div className="alert alert-danger" role="alert">
        Access Denied: Admins Only
      </div>
    );
  }

  return (
    <Container className="main-card mb-4">
      <div className="d-flex justify-content-between mb-2">
        <h2 className="text-title">Cases List</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleBackClick}
        >
          Back
        </button>
      </div>
      {/* Filter Section */}
      <Row className="mb-3">
        {/* Dropdown field */}
        <Col xs={12} md={4} className="mb-2 mb-md-0">
          <select
            id="field-select"
            value={field}
            onChange={handleFieldChange}
            className="form-control"
          >
            <option value="">--Select Field--</option>
            {filterFields.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Col>

        {/* Input for entering the value */}
        <Col xs={12} md={4} className="mb-2 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Enter value"
            value={filterValue}
            onChange={handleValueChange}
          />
        </Col>

        {/* Apply Filter button */}
        <Col xs={12} md={4}>
          <Button
            variant="secondary"
            size="md"
            onClick={fetchCases}
            className="w-100"
          >
            Apply Filter
          </Button>
        </Col>
      </Row>
      {loading ? (
        <Spinner />
      ) : (
        <div className="relative overflow-x-auto shadow-md">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-400">
              {/* <div className="container table-responsive w-100">
            <table className="table table-striped">
              <thead className="bg-gray-400 uppercase"> */}
              <tr>
                <th scope="col" className="px-4 py-3">
                  No
                </th>
                <th scope="col" className="px-4 py-3">
                  Claim On
                </th>
                <th scope="col" className="px-4 py-3">
                  Case Title
                </th>
                <th scope="col" className="px-4 py-3">
                  FOS
                </th>
                <th scope="col" className="px-4 py-3">
                  Case Type
                </th>
                <th scope="col" className="px-4 py-3">
                  Policy No
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
              {currentCases.map((caseItem, index) => {
                const registrationDate = moment(caseItem.doa);
                const tat = today.diff(registrationDate, "days"); // Calculate TAT in days

                // Set TAT thresholds based on case_type
                let tatThreshold = 30; // Default TAT threshold
                if (["PA", "MISCELLANEOUS"].includes(caseItem.case_type)) {
                  tatThreshold = 15; // TAT threshold for PA, miscellaneous
                }

                const isWarning =
                  tat > tatThreshold && caseItem.ir_status !== "Submitted"; // Highlight row if TAT exceeds threshold

                return (
                  <tr
                    key={caseItem.caseId}
                    className={`border-b border-gray-300 ${
                      isWarning ? "bg-red-100" : "even:bg-gray-100"
                    }`}
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
                    <td className="px-4 py-2">
                      {caseItem.fosAssignments
                        ?.map((assignment) => assignment.fos)
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-4 py-2">{caseItem.case_type}</td>
                    <td className="px-4 py-2">{caseItem.policy_no}</td>
                    <td className="px-4 py-2">
                      <select
                        value={caseItem.ir_status}
                        onChange={(e) =>
                          updateCaseStatus(caseItem.caseId, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        {ir_status.map((status, index) => (
                          <option key={index} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">{tat} days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="d-none d-md-inline" // Hide Prev button on small screens
            />

            {Array.from(
              { length: Math.ceil(cases.length / casesPerPage) },
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => paginate(index + 1)}
                  className="d-none d-sm-inline" // Show page numbers only on small and up
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}

            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(cases.length / casesPerPage)}
              className="d-none d-md-inline" // Hide Next button on small screens
            />

            {/* For smaller screens, add simple "Previous" and "Next" buttons */}
            <div className="d-md-none text-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  currentPage === Math.ceil(cases.length / casesPerPage)
                }
                className="ms-2"
              >
                Next
              </Button>
            </div>
          </Pagination>
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
};

export default CaseList;
