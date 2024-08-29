import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="card">
     <b>This is Home Page</b>
    </div>
  );
};

export default Home;
