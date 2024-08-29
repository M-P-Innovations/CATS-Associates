import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container } from 'react-bootstrap';
import markLogo from "./assets/images/logo-no-background.png"
import "./Common.css"
// import Profile from "./Profile"

const NavBar = () => {
    const [showAdminBoard, setShowAdminBoard] = useState(null);
    const { user: currentUser } = useSelector((state) => state.auth);
    // const [openProfile, setProfile] = useState(false)
    const dispatch = useDispatch();

    useEffect(() => {
        if (currentUser) {
            console.log(currentUser)
            setShowAdminBoard(currentUser.user.user_role.includes("Admin"));
        } else {
            setShowAdminBoard(false);
        }

    }, [currentUser]);

    // const toggleProfile = () => {
    //     setProfile(!openProfile);
    // }

    const logOut = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);


    return (
        <>
            <Navbar className="bg-zinc-300 fixed-top" expand="lg">
                <Container>
                    <Navbar.Brand className="w-40" href="#">
                        <img src={markLogo} alt="cover" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            {currentUser ? (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link active" aria-current="page" href="/home">Home</a>
                                    </li>
                                    {showAdminBoard && (
                                        <li className="nav-item">
                                            <a className="nav-link active" href="/admin">Admin</a>
                                        </li>)}

                                    <img onClick={logOut} className="w-10 h-10 p-1 dropdown-toggle rounded-full ring-2 ring-dark-300 dark:ring-gray-500 transition ease-in-out delay-10 hover:-translate-y-1 hover:scale-110 duration-300 ..." src={require(`./assets/images/avatars/${currentUser.user.logoValue}`)} alt="logo" id="navbarDropdown" data-dropdown-toggle="userDropdown" data-dropdown-placement="bottom-start" />

                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link active" aria-current="page" href="/login">Login</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link active" aria-current="page" href="/register">Register</a>
                                    </li>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>

    );
};

export default NavBar;
