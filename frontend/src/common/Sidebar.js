import React from "react";
import { Link } from "react-router-dom";
import { logout } from "../slices/auth";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, List, ListItem, ListItemPrefix, Accordion, AccordionHeader, AccordionBody, Card } from "@material-tailwind/react";
import { PresentationChartBarIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import "./Sidebar.css";
import { useEffect } from "react";

function Sidebar() {
    const [open, setOpen] = React.useState(0);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [showModeratorBoard, setShowModeratorBoard] = useState(false);
    const [showAdminBoard, setShowAdminBoard] = useState(false);
    const dispatch = useDispatch();
    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    useEffect(() => {
        if (currentUser) {
            setShowModeratorBoard(currentUser.user.user_role.includes("User"));
            setShowAdminBoard(currentUser.user.user_role.includes("Admin"));
        } else {
            setShowModeratorBoard(false);
            setShowAdminBoard(false);
        }
    }, [currentUser]);

    const logOut = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    return (
        <div>
            <Card shadow={false} className="h-[calc(100vh-2rem)] bg-stone-300 overflow-hidden shadow-lg w-full Card1">
                <List className="side-List">
                    <Accordion open={open === 1}
                        icon={<ChevronDownIcon strokeWidth={2.5}
                            className={`mx-auto mt-1 h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`} />}>
                        <ListItem className="p-0 side-List-item" selected={open === 1}>
                            <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
                                <ListItemPrefix>
                                    <PresentationChartBarIcon className="h-5 w-5" />
                                </ListItemPrefix>
                                <Typography color="blue-gray" className="mr-auto font-normal ">
                                    Dashboard
                                </Typography>
                            </AccordionHeader>
                        </ListItem>
                        <AccordionBody className="py-1">
                            <List className="p-0 side-List-item">
                                {showAdminBoard && (
                                    <ListItem>
                                        <ListItemPrefix>
                                            <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                        </ListItemPrefix>
                                        <Link to={"/admin"} className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                                            <span className="relative">Admin Board</span>
                                        </Link>
                                    </ListItem>
                                )}
                                {showModeratorBoard && (
                                    <ListItem>
                                        <ListItemPrefix>
                                            <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                        </ListItemPrefix>
                                        <Link to={"/admin"} className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                                            <span className="relative">Mod Board</span>
                                        </Link>
                                    </ListItem>
                                )}
                                <ListItem>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    <Link to={""} className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                                        <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                                        <span className="relative">Reporting</span>
                                    </Link>
                                </ListItem>
                                <ListItem>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    <Link to={""} className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                                        <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                                        <span className="relative">Tasks</span>
                                    </Link>
                                </ListItem>
                            </List>
                        </AccordionBody>
                    </Accordion>
                    <hr className="my-2 border-blue-gray-50" />
                    <ListItem>
                        <ListItemPrefix>
                            <UserCircleIcon className="h-10 w-5" />
                        </ListItemPrefix>
                        <Link to={"/profile"} className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                            <span className="relative">Profile</span>
                        </Link>
                    </ListItem>
                    <ListItem>
                        <ListItemPrefix>
                            <Cog6ToothIcon className="h-10 w-5" />
                        </ListItemPrefix>
                        <a href="/home" className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                            <span className="relative">Settings</span>
                        </a>
                    </ListItem>
                    <ListItem>
                        <ListItemPrefix>
                            <PowerIcon className="h-10 w-5" />
                        </ListItemPrefix>
                        <a href="/login" onClick={logOut} className="relative inline-flex items-center justify-center px-4 py-1 overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group">
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-red-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                            <span className="relative">Log Out</span>
                        </a>
                    </ListItem>
                </List>
            </Card>
        </div>

        // <div>
        //     <Drawer style={{ position: 'absolute' }} >
        //         <Card color="transparent" shadow={false} className="h-[calc(100vh-2rem)] w-full p-0">
        //             <p>This is SideBar...</p>
        //         </Card>
        //     </Drawer>
        // </div>
    );
}

export default Sidebar;