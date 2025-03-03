import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./common/Common.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import DashBoard from "./components/DashBoard";
import Login from "./components/user-microservice/Login";
import Register from "./components/user-microservice/Register";
import Profile from "./components/user-microservice/Profile";
import BoardAdmin from "./components/user-microservice/UserDetails";
import NavBar from "./common/NavBar";
import Footer from "./common/Footer";
import ActivityLogs from "./components/LogEvent";
import CaseRegistration from "./components/case-microservice/CaseRegistration";
import ListCases from "./components/case-microservice/CaseList";
import CaseDetails from "./components/case-microservice/CaseDetails";
import RTIForm from "./components/case-microservice/RTIForm";
import CourtForm from "./components/case-microservice/CourtForm";
import TourManagement from "./components/case-microservice/TourManagement";

const App = () => {
  return (
    <div id="app">
      <Router>
        <NavBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<DashBoard />} />
            <Route path="/home" element={<DashBoard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<BoardAdmin />} />
            <Route path="/activityLogs/:caseId" element={<ActivityLogs />} />
            <Route path="/listCases" element={<ListCases />} />
            <Route path="/case-detail/:caseId" element={<CaseDetails />} />
            <Route path="/case-registration" element={<CaseRegistration />} />
            <Route path="/rti-form/:caseId" element={<RTIForm />} />
            <Route path="/court-form/:caseId" element={<CourtForm />} />
            <Route path="/tourManagement" element={<TourManagement />} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </div>
  );
};

export default App;
