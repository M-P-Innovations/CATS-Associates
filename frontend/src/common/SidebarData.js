import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as AiIcons from "react-icons/ai";
import { logout } from "../slices/auth";
import { CgProfile } from "react-icons/cg";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { TbUsers } from "react-icons/tb";
import { IoBriefcaseSharp } from "react-icons/io5";
import "./Common.css";
import { FaRegistered, FaHistory } from "react-icons/fa";
import { MdCardTravel } from "react-icons/md";


export default function Sidebar() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const logOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <div className="sidebar">
      {currentUser && (
        <>
          {/* Profile Section */}
          <div className="profile-section container">
            <img
              src={require(`./assets/images/avatars/${currentUser.user.logoValue}`)}
              alt="Profile"
              className="profile-image p1"
            />
            <h4 className="font-bold text-lg">{currentUser.user.username}</h4>
          </div>

          {/* Dashboard Section */}
          <div className="menu-section">
            {/* <Link to="/home" className="menu-title">
              <AiIcons.AiOutlineDashboard /> Dashboards
            </Link> */}
            {/* <Link to="/saved-search" className="saved-search-link">
              Create Saved Search
            </Link> */}

            {/* Main Menu Items */}
            <ul className="menu-items">
              <li>
                <Link to="/home">
                  <AiIcons.AiOutlineDashboard /> Dashboards
                </Link>
              </li>
              {currentUser.user.user_role === "Admin" && (
                <>
                  <li>
                    <Link to="/users">
                      <TbUsers /> User Details
                    </Link>
                  </li>
                  <li>
                    <Link to="/activityLogs/All">
                      <FaHistory /> Log Details
                    </Link>
                  </li>
                </>

              )}

              {currentUser.user.user_role !== "FOS" && (
                <>
                  <li>
                    <Link to="/case-registration">
                      <FaRegistered /> Register Case
                    </Link>
                  </li>
                  <li>
                    <Link to="/listCases">
                      <IoBriefcaseSharp /> Cases List
                    </Link>
                  </li>
                  <li>
                    <Link to="/tourManagement">
                      <MdCardTravel /> Tour Management
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/profile">
                  <CgProfile /> Profile
                </Link>
              </li>
              <li>
                <Link onClick={logOut}>
                  <RiLogoutCircleRFill /> LogOut
                </Link>
              </li>
            </ul>

            {/* Show More / Less */}
            {/* <button className="toggle-button" onClick={toggleShowMore}>
              {showMore ? "Show less..." : "Show more..."}
            </button> */}

            {/* Expanded Menu Items */}
            {/* {showMore && (
              <ul className="expanded-menu-items">
              </ul>
            )} */}
          </div>
        </>
      )}
    </div>
  );
}
