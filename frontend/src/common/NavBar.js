import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import markLogo from "./assets/images/CATS.jpeg";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import "./Common.css";
import SidebarData from "./SidebarData"; // SidebarData as separate component
import { Navbar } from "react-bootstrap";

const NavBar = () => {
  const [sidebar, setSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Toggle sidebar
  const showSidebar = () => setSidebar(!sidebar);

  // Close sidebar on logout
  useEffect(() => {
    if (!currentUser) {
      setSidebar(false);
    }
  }, [currentUser]);

  // Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebar(false);
      }
    };

    const handleClickInside = (event) => {
      if (sidebarRef.current && sidebarRef.current.contains(event.target) && event.target.tagName === 'A') {
        setSidebar(false); // Close sidebar on link click
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("click", handleClickInside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickInside);
    };
  }, [sidebarRef]);

  return (
    <>
      <Navbar className="bg-zinc-300 fixed-top px-0" expand="lg">
        {currentUser && (
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars color="balck" onClick={showSidebar} />
          </Link>
        )}
        <Navbar.Brand className="w-40" href="#">
          <img className="ml-2 mb-2 CATS-logo" style={{ width: '45px', height: '45px' }} src={markLogo} alt="cover" />
        </Navbar.Brand>
        
        {currentUser && (
          <nav
            ref={sidebarRef}
            className={sidebar ? "nav-menu active" : "nav-menu"}
          >
            <div className="close-sidebar-icon">
              <Link to="#" className="close-sidebar" onClick={showSidebar}>
                <AiIcons.AiOutlineClose />
              </Link>
            </div>
            <ul className="nav-menu-items">
              {/* Render SidebarData as HTML elements */}
              <SidebarData />
            </ul>
          </nav>
        )}
      </Navbar>
    </>
  );
};

export default NavBar;
