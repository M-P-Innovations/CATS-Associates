import React from "react";
import { logout } from "../slices/auth";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@material-tailwind/react";
import "./ProfileCard.css";


function ProfileCard() {
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();


    const generateRandomColorNumber = () => {
        return `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;
    }

    const generatePlaceholderName = (name) => {
        return name[0]?.toUpperCase() ?? "";
    }

    const logOut = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    return (
        <div>
            <Card shadow={false} className="mx-auto bg-stone-700 dark:bg-gray-500 rounded-lg overflow-hidden shadow-lg Card ">
                <div className="flex flex-col items-center pb-10 mt-3">
                    <div
                        className="w-20 h-20 mb-2 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: generateRandomColorNumber() }}
                    >
                        <span className="text-3xl font-bold text-white">
                            {generatePlaceholderName(currentUser.user.username)}
                        </span>
                    </div>
                    <h5 className="mb-1 text-xl font-medium text-white dark:text-white">
                        {currentUser.user.username}
                    </h5>
                    <span className="text-sm text-white dark:text-gray-400">
                        {currentUser.user.user_role}
                    </span>
                    <a href="/login" onClick={logOut} className="relative inline-flex items-center justify-center px-4 py- overflow-hidden font-mono font-medium tracking-tighter text-white bg-slate-500 rounded-lg group mt-2">
                        <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-red-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
                        <span className="relative">Log Out</span>
                    </a>
                </div>
            </Card>
        </div>
    );

}

export default ProfileCard;
