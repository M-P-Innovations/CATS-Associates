import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
    return (
        <footer className="bg-zinc-300 mt-4 fixed-bottom">
            <div className="w-full mx-auto max-w-screen-xl md:flex md:items-center md:justify-between">
                <ul className="flex items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                    <li>
                        <button className="hover:underline me-4 md:me-6">About</button>
                    </li>
                    <li>
                        <button className="hover:underline">Contact</button>
                    </li>
                </ul>
            </div>
        </footer>

        // <footer classNameName="card-footer bg-gray-300">
        //     <div classNameName="container-fluid">
        //         <b>CATS</b>
        //     </div>
        // </footer>
    );
};

export default Footer;
