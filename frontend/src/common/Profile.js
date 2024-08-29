import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import { logout } from "../slices/auth";
import { CiLocationOn } from "react-icons/ci";
import "./Common.css"
// import { Navigate } from "react-router-dom";


const Profile = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const logOut = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    return (
        <div class="fixed justify-center z-50 end-0 pt-12 profile1">
            <div class="text-center my-4 border-b px-4 pb-6 max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <h3 class="font-bold text-2xl text-gray-800 dark:text-white mb-1">{currentUser.user.username}</h3>
                <h5 class="text-sm text-gray-800 dark:text-white mb-1">{currentUser.user.email}</h5>
                <div class="inline-flex text-gray-700 dark:text-gray-300 items-center">
                    <CiLocationOn size={20} />
                    {currentUser.user.city}
                </div>
                <div class="flex gap-2 px-2">
                    <button onClick={logOut}
                        class="flex-1 rounded-full bg-blue-600 dark:bg-blue-800 text-white dark:text-white antialiased font-bold hover:bg-blue-800 dark:hover:bg-blue-900 px-4 py-2">
                        Logout
                    </button>
                </div>
            </div>
        </div>

        // <div class="profile">
        //     <div class="px-4 py-3 text-sm text-gray-900 dark:text-white">
        //         <h4>{currentUser.user.username}</h4>
        //         <div class="font-medium truncate">{currentUser.user.email}</div>
        //     </div>
        //     <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
        //         <li>
        //             <button class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</button>
        //         </li>
        //         <li>
        //             <button href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</button>
        //         </li>
        //     </ul>
        //     <div class="py-1">
        //         <button onClick={logOut} class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</button>
        //     </div>
        // </div>
    )
};

export default Profile;