import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./common/Common.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import BoardUser from "./components/BoardUser";
import BoardAdmin from "./components/BoardAdmin";
import NavBar from "./common/NavBar"
import Footer from "./common/Footer"

const App = () => {

  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user" element={<BoardUser />} />
        <Route path="/admin" element={<BoardAdmin />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
