import React, { useState, useEffect } from "react";
import UserService from "../services/user.service";
import { useSelector } from "react-redux";
import { Navigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import Spinner from "../common/Spinner";
import ErrorDialogBox from "../common/ErrorDialogBox"
import { Roles } from "../common/models/roles"
import "../common/Common.css"

const BoardAdmin = () => {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


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
    await UserService.updateUserStatus(username, newStatus).then(() => {
      fetchUsers(); // Refresh the user list after status update
    }).catch((error) => {
      setLoading(false);
      setErrorMessage("Error while updating user status.");
      setShowError(true);
    })
      ;
  };

  const deleteUser = async (username) => {
    setLoading(true);
    await UserService.deleteUser(username)
      .then(() => {
        fetchUsers();
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage("Error while deleting user.");
        setShowError(true);
      })
  }

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
      })
  }

  const closeErrorDialog = () => {
    setShowError(false);
  };

  const roles = Roles;
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="card">
      <h4 className="text-title ml-3 mt-3">User List</h4>
      {loading ?
        <Spinner />
        :
        <div className="table-responsive relative overflow-x-auto pb-3">
          <table className="table text-sm table-striped text-left">
            <thead className="text-xs table-dark uppercase">
              <tr>
                <th scope="col" className="px-6 py-3 fixed-left">
                  User Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  EmailId
                </th>
                <th scope="col" className="px-6 py-3">
                  City
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">
                    <b>{user.username}</b>
                  </td>
                  <td className="px-6 py-4">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {user.city}
                  </td>
                  <td className="px-6 py-4">
                    <select className="transition ease-in-out delay-10 hover:-translate-y-1 hover:scale-110 duration-300 ..." value={user.user_role} onChange={(e) => { handleRoleChange(user.username, e.target.value) }}>
                      {roles.map(role => (<option key={role} value={role}>{role}</option>))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <label className="inline-flex items-left me-2 cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" checked={user.active} onChange={(e) => toggleUserStatus(user.username, user.active)} />
                      <div className="relative w-9 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700
                         peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full
                          rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px]
                           after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all
                            dark:border-gray-600 peer-checked:bg-green-500 transition ease-in-out delay-10 hover:-translate-y-1 hover:scale-110 duration-300 ... "></div>
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <button data-modal-target="popup-modal" data-modal-toggle="popup-modal" type="button" onClick={(e) => deleteUser(user.username)}>
                      <MdDelete size={25} className="fill-red-400 transition ease-in-out delay-10 hover:-translate-y-1 hover:scale-110 hover:fill-red-600 duration-300 ... " />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      {showError && (
        <ErrorDialogBox message={errorMessage} onClose={closeErrorDialog} />
      )}
    </div>
  );
};

export default BoardAdmin;
