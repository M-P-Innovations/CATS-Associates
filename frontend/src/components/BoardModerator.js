import React, { useState, useEffect } from "react";

import UserService from "../services/user.service";
import EventBus from "../common/EventBus";
import { useSelector } from "react-redux";
import { Navigate } from 'react-router-dom';

const BoardModerator = () => {
  const [content, setContent] = useState("");
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    UserService.getModeratorBoard().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const _content =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setContent(_content);

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }, []);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{content}</h3>
      </header>
    </div>
  );
};

export default BoardModerator;
