import React from "react";
import "./Common.css";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="footer px-4 md:px-16 lg:px-28 py-6">
      <div className="grid gird-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-lg font-bold mb-4 text-white">About US</h2>
          <p className="text-gray-300">
            We are a team dedicated to providing best products and services to
            our cunstomers.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-4 text-white">Quick Links</h2>
          <ui>
            <li>
              <a href="/home" className="hover:underline text-gray-300">
                Home
              </a>
            </li>
            <li>
              <a href="/#" className="hover:underline text-gray-300">
                Services
              </a>
            </li>
            <li>
              <a href="/#" className="hover:underline text-gray-300">
                Contact
              </a>
            </li>
            <li>
              <a href="/#" className="hover:underline text-gray-300">
                About
              </a>
            </li>
          </ui>
        </div>
        <div>
        <h2 className="text-lg font-bold mb-4 text-white">Follow Us</h2>
          <ui className="flex space-x-4">
            <li>{" "}<FaFacebook className="text-blue-500"/> {" "}
              <a href="/#" className="hover:underline text-gray-300">
                Facebook
              </a>
            </li>
            <li>
                <FaTwitter className="text-sky-500"/>
              <a href="/#" className="hover:underline text-gray-300">
                Twitter
              </a>
            </li>
            <li>
                <FaInstagram className="text-orange-500"/>
              <a href="/#"  className="hover:underline text-gray-300">
                Instagram
              </a>
            </li>
          </ui>
        </div>
      </div>
      <div className="border-t border-gray-600 p-4 text-gray-300 text-center mt-6">
        <p>@ 2024 Mark Associate. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
