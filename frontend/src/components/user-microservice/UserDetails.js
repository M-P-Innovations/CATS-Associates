import React, { useState, useEffect } from "react";
import UserService from "../../services/user.service";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Spinner from "../../common/Spinner";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import { Roles } from "../../common/models/roles";
import Pagination from "react-bootstrap/Pagination";
import "../../common/Common.css";
import { Button, Container } from "react-bootstrap";
import { PiToggleLeftFill, PiToggleRightFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const BoardAdmin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Number of users to display per page

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    UserService.getUsers().then(
      (response) => {
        setUsers(response.data);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorMessage(error);
        setShowError(true);
      }
    );
  };

  const toggleUserStatus = async (username, active) => {
    setLoading(true);
    const newStatus = !active;
    await UserService.updateUserStatus(username, newStatus)
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage("Error while updating user status.");
        setShowError(true);
      });
  };

  const handleRoleChange = async (username, user_role) => {
    setLoading(true);
    await UserService.updateRole(username, user_role)
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage("Error while updating user role.");
        setShowError(true);
      });
  };

  const roles = Roles;
  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleBackClick = () => {
    navigate(-1); // This navigates to the previous page in history
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
        <h2 className="text-title">Users List</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleBackClick}
        >
          Back
        </button>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="container table-responsive w-100">
          <table className="table table-striped">
            <thead className="bg-gray-400 uppercase">
              <tr>
                <th scope="col">User Name</th>
                <th scope="col">Name</th>
                <th scope="col">EmailId</th>
                <th scope="col">Mobile No</th>
                <th scope="col">City</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers
                .filter((user) => user.username.toLowerCase() !== "admin") // Exclude admin
                .map((user) => (
                  <tr key={user.username}>
                    <td>
                      <b>{user.username}</b>
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile_number}</td>
                    <td>{user.city}</td>
                    <td>
                      <select
                        className="form-select"
                        value={user.user_role}
                        onChange={(e) =>
                          handleRoleChange(user.username, e.target.value)
                        }
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="inline-flex items-center cursor-pointer">
                        {user.active ? (
                          <PiToggleRightFill
                            size={30}
                            className="text-green-500"
                            onClick={() =>
                              toggleUserStatus(user.username, user.active)
                            }
                          />
                        ) : (
                          <PiToggleLeftFill
                            size={30}
                            className="text-gray-500"
                            onClick={() =>
                              toggleUserStatus(user.username, user.active)
                            }
                          />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from(
              { length: Math.ceil(users.length / usersPerPage) },
              (_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => paginate(index + 1)}
                  className="d-none d-sm-inline"
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(users.length / usersPerPage)}
              className="d-none d-md-inline"
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
                  currentPage === Math.ceil(users.length / usersPerPage)
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

export default BoardAdmin;
