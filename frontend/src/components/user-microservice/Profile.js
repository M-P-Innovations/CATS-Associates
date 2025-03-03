import React, { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../common/Common.css";
import { Avatars } from "../../common/models/avatars";
import { cityLists } from "../../common/models/city-list";
import userService from "../../services/user.service";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import { MdEdit } from "react-icons/md";
import { Container } from "react-bootstrap";

const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(currentUser?.user || {});
  const [originalData, setOriginalData] = useState(currentUser?.user || {}); // Store original data for comparison
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(currentUser?.user?.logoValue || "");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [user, setUser] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const cities = cityLists;
  const Logo = Avatars;

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await userService.getUser();
      setUser(response.data);
      setFormData(response.data);
      setOriginalData(response.data); // Store the original data
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "An error occurred while fetching user data.");
      setShowError(true);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Validation for mobile number (only numbers, max 10 digits)
    if (name === "mobile_number") {
      if (!/^\d*$/.test(value)) return; // Allow only numbers
      if (value.length > 10) return; // Limit to 10 digits
    }
  
    setFormData({ ...formData, [name]: value });
  };  

  const handleSelectPhoto = (image) => {
    setSelectedImage(image);
    setFormData((prev) => ({ ...prev, logoValue: image }));
    setShowModal(false);
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await userService.updateprofile(formData);
      alert("Profile successfully updated.");
      setOriginalData(formData); // Update original data after successful save
      setIsEditing(false);
    } catch (error) {
      setErrorMessage("Error while updating profile.");
      setShowError(true);
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setFormData(originalData); // Reset form to original values
    setSelectedImage(originalData?.logoValue || "");
    setIsEditing(false);
  };

  // Check if formData is different from originalData
  const isSaveDisabled = useMemo(() => {
    return JSON.stringify(formData) === JSON.stringify(originalData);
  }, [formData, originalData]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="main-card profile-container">
      <h3 className="profile-title">Profile</h3>

      <div className="profile-card mb-4">
        <div className="profile-avatar">
          <img
            src={require(`../../common/assets/images/avatars/${selectedImage}`)}
            alt="User avatar"
            className="avatar-image"
          />
          {isEditing && (
            <button className="btn-edit-avatar" onClick={() => setShowModal(true)}>
              Change Photo
            </button>
          )}
        </div>

        <button className="btn-edit-top-right" onClick={() => setIsEditing(true)}>
          <MdEdit />
        </button>

        <div className="profile-info">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" value={user.username} name="username" className="input-field" disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input-field"
              disabled={!isEditing}
            >
              <option value="" disabled>Select City</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              className="input-field"
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="action-buttons">
          {isEditing && (
            <>
              <button
                className={`btn-save ${isSaveDisabled ? "disabled-btn" : ""}`}
                onClick={updateProfile}
                disabled={isSaveDisabled || loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button className="btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: Math.min(100 + 70 * Logo.length, 400) }}>
            <h4>Select Avatar</h4>
            <ul className="avatar-options">
              {Logo.map((logo) => (
                <li key={logo} onClick={() => handleSelectPhoto(logo)}>
                  <img src={require(`../../common/assets/images/avatars/${logo}`)} alt="Avatar" className="avatar-option" />
                </li>
              ))}
            </ul>
            <button className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
        </div>
      )}
      {showError && (
        <ErrorDialogBox message={errorMessage} onClose={() => setShowError(false)} />
      )}
    </Container>
  );
};

export default Profile;
