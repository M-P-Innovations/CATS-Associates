import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import { registerUser } from "../../slices/auth";
import ReCAPTCHA from "react-google-recaptcha";
import { cityLists } from "../../common/models/city-list";
import { Avatars } from "../../common/models/avatars";
import "../../common/Common.css";
import { FaUserCircle } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openLogo, setOpenLogo] = useState(false);
  const [logoValue, setLogoValue] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const siteKey = process.env.REACT_APP_RECAPTCHA_KEY;

  const initialValues = {
    username: "",
    email: "",
    name: "",
    city: "",
    password: "",
    mobile_number: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "The username must be between 3 and 20 characters.")
      .max(20, "The username must be between 3 and 20 characters.")
      .required("This field is required!"),
    name: Yup.string().required("This field is required!"),
    email: Yup.string()
      .email("This is not a valid email.")
      .required("This field is required!"),
    password: Yup.string()
      .min(6, "The password must be between 6 and 40 characters.")
      .max(40, "The password must be between 6 and 40 characters.")
      .required("This field is required!"),
    city: Yup.string().required("This field is required!"),
    mobile_number: Yup.string()
      .matches(
        /^\d{10}$/,
        "Enter a valid Indian mobile number (e.g., 9876543210)"
      )
      .required("Mobile number is required"),
  });

  const handleRegister = (values) => {
    setLoading(true);
    const { username, name, email, city, mobile_number, password } = values;

    dispatch(
      registerUser({
        username,
        name,
        email,
        city,
        mobile_number,
        password,
        logoValue,
      })
    )
      .unwrap()
      .then(() => {
        alert("User successfully registered.");
        navigate("/login");
      })
      .catch((error) => {
        setErrorMessage(error);
        setShowError(true);
      })
      .finally(() => setLoading(false));
  };

  const toggleLogo = () => setOpenLogo(!openLogo);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const AvatarSelect = () =>
    openLogo && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h4>Select Avatar</h4>
          <ul className="avatar-options">
            {Avatars.map((logo) => (
              <li
                key={logo}
                onClick={() => {
                  setLogoValue(logo);
                  toggleLogo();
                }}
              >
                <img
                  src={require(`../../common/assets/images/avatars/${logo}`)}
                  alt="Avatar"
                  className="avatar-option"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

  return (
    <div className="flex-center">
      <div
        className={`responsive-card ${showError || openLogo ? "blur-sm" : ""}`}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ values, errors }) => {
            const isFormValid =
              Object.values(values).every(Boolean) &&
              !Object.keys(errors).length &&
              captchaValue &&
              logoValue;

            return (
              <Form className="form-container">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h1 className="text-title">Register an account</h1>
                  {logoValue ? (
                    <img
                      src={require(`../../common/assets/images/avatars/${logoValue}`)}
                      alt="Avatar"
                      className="avatar-option"
                    />
                  ) : (
                    <FaUserCircle color="grey" size={70} />
                  )}
                </div>

                {["name", "username", "email", "mobile_number"].map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="form-label">
                      {field
                        .replace(/_/g, " ")
                        .replace(/^./, (match) => match.toUpperCase())}
                    </label>
                    <Field
                      type="text"
                      name={field}
                      id={field}
                      className="form-input"
                      placeholder={`Enter ${field}`}
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="alert-danger"
                    />
                  </div>
                ))}

                <div className="relative">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-10 text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="alert-danger"
                  />
                </div>

                <label htmlFor="city" className="form-label">
                  Select City
                </label>
                <Field as="select" name="city" className="form-input">
                  <option value="">-- Select a city --</option>
                  {cityLists.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="city"
                  component="div"
                  className="alert-danger"
                />

                <button
                  type="button"
                  className="btn btn-success btn-block mt-2"
                  onClick={toggleLogo}
                >
                  <span>Select Avatar</span>
                </button>

                <ReCAPTCHA
                  className="gr-recaptcha mt-2"
                  sitekey={siteKey}
                  onChange={setCaptchaValue}
                />

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={!isFormValid || loading}
                  >
                    {loading && (
                      <span className="absolute mr-5 spinner-border spinner-border-sm"></span>
                    )}
                    Register
                  </button>
                </div>

                <p className="text-sm font-light text-gray-500">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-medium text-primary-600 hover:underline"
                  >
                    Login here
                  </a>
                </p>
              </Form>
            );
          }}
        </Formik>
      </div>

      <AvatarSelect />

      {showError && (
        <ErrorDialogBox
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
};

export default Register;
