import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Pagination,
} from "react-bootstrap";
import Spinner from "../common/Spinner";
import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorDialogBox from "../common/ErrorDialogBox";
import logsServices from "../services/logs-services";
import { useNavigate } from 'react-router-dom';

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [allLogs, setAllLogs] = useState([]); // Store all logs fetched from API
  const [displayedLogs, setDisplayedLogs] = useState([]); // Logs to display based on pagination
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user: currentUser } = useSelector((state) => state.auth);
  var { caseId } = useParams();

  // Fetch logs only once or when filters change
  const fetchLogs = () => {
    setLoading(true);
    if (caseId === 'All') {
      caseId = null;
    }
    logsServices.fetchLogs(startDate, endDate, caseId).then(
      (response) => {
        setLoading(false);
        // Sort logs by dateTime in descending order (newest first)
        const sortedLogs = response.data.sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        );
        setAllLogs(sortedLogs); // Store sorted logs
        setPage(1); // Reset to the first page
      },
      (error) => {
        setLoading(false);
        setErrorMessage(error.message || "Failed to fetch logs.");
        setShowError(true);
      }
    );
  };

  // Update displayed logs based on page and rowsPerPage
  const updateDisplayedLogs = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setDisplayedLogs(allLogs.slice(startIndex, endIndex));
  };

  // Initial fetch or refetch logs on filter change
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update displayed logs whenever page, rowsPerPage, or allLogs change
  useEffect(() => {
    updateDisplayedLogs();
    // eslint-disable-next-line
  }, [page, rowsPerPage, allLogs]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  } else if (currentUser.user.user_role !== "Admin") {
    return (
      <div className="alert alert-danger" role="alert">
        Access Denied: Admins Only
      </div>
    );
  }

  const handleFilter = () => {
    fetchLogs();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when rows per page changes
  };

  const handleBackClick = () => {
    navigate(-1); // This navigates to the previous page in history
  };

  return (
    <Container className="main-card mb-4">
      <div className="d-flex justify-content-between mb-2">
        <h2 className="text-title">Logs Details: {caseId}</h2>
        <button type="button" className="btn btn-primary" onClick={handleBackClick}>Back</button>
      </div>
      <hr className="mb-4"/>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <Form.Control
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col>
              <Form.Control
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
            <Col>
              <Button variant="primary" onClick={handleFilter}>
                Apply Filters
              </Button>
            </Col>
          </Row>
          <Table striped bordered hover>
            <thead className="bg-gray-400 uppercase">
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Activity</th>
                <th>Case</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.dateTime}</td>
                  <td>{log.user}</td>
                  <td>{log.message}</td>
                  <td>{log.caseId}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-between align-items-center">
            <Form.Group as={Row} controlId="rowsPerPage">
              <Form.Label column sm="4">
                Rows per page:
              </Form.Label>
              <Col sm="8">
                <Form.Control
                  as="select"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                >
                  {[5, 10, 15, 20].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              />
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(allLogs.length / rowsPerPage)}
              />
            </Pagination>
          </div>
          {showError && (
            <ErrorDialogBox
              message={errorMessage}
              onClose={() => setShowError(false)}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default ActivityLogs;
