import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login, sendotp, verifyOtp, resetPassword } from "../../slices/auth";
import { clearMessage } from "../../slices/message";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import "../../common/Common.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState("login"); // login | forgotPassword | verifyOTP | resetPassword
  const [username, setUsername] = useState("");
  const [otpVal, setOtpVal] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  if (currentUser) {
    return <Navigate to="/home" />;
  }

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const closeErrorDialog = () => setShowError(false);

  const handleError = (error) => {
    setLoading(false);
    setErrorMessage(error);
    setShowError(true);
  };

  const initialValues = { username: "", password: "" };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("This field is required!"),
    password: Yup.string().required("This field is required!"),
  });

  const handleLogin = (values) => {
    setLoading(true);
    dispatch(login(values))
      .unwrap()
      .then(() => {
        setLoading(false);
        navigate("/home");
      })
      .catch(handleError);
  };

  const handleGetOtp = (e) => {
    e.preventDefault();
    if (!username) return handleError("Please provide a valid email.");

    setLoading(true);
    dispatch(sendotp({ username }))
      .unwrap()
      .then(() => {
        setLoading(false);
        setFormState("verifyOTP");
        alert("OTP has been sent to your email.");
      })
      .catch(handleError);
  };

  const handleOtpVerification = (e) => {
    e.preventDefault();
    if (!otpVal) return handleError("Please enter a valid OTP.");

    setLoading(true);
    dispatch(verifyOtp({ username, otp: otpVal }))
      .unwrap()
      .then(() => {
        setLoading(false);
        setFormState("resetPassword");
      })
      .catch(handleError);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = passwords;

    if (newPassword !== confirmPassword) return handleError("Passwords do not match.");

    setLoading(true);
    dispatch(resetPassword({ username, password: newPassword }))
      .unwrap()
      .then(() => {
        setLoading(false);
        alert("Password reset successful. Please log in.");
        setFormState("login");
      })
      .catch(handleError);
  };

  return (
    <div className="login-flex-center">
      <div className={`responsive-card ${showError ? "blur-sm" : ""}`}>
        {formState === "login" && (
          <div className="form-container">
            <h1 className="text-title">Sign in to your account</h1>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleLogin}>
              {({ values, errors }) => {
                const isFormValid = values.username && values.password && !errors.username && !errors.password;
                return (
                  <Form className="form-container">
                    <div>
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <Field type="text" name="username" className="form-input" placeholder="Your Username" />
                      <ErrorMessage name="username" component="div" className="alert-danger" />
                    </div>
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
                        {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                      </button>
                      <ErrorMessage name="password" component="div" className="alert-danger" />
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary btn-block" disabled={!isFormValid || loading}>
                        {loading && <span className="absolute mr-5 spinner-border spinner-border-sm"></span>}
                        Login
                      </button>
                      <div className="link-div">
                        <button type="button" onClick={() => setFormState("forgotPassword")} className="link">
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  </Form>
                );
              }}
            </Formik>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet?{" "}
              <a href="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                Register
              </a>
            </p>

          </div>
        )}

        {formState === "forgotPassword" && (
          <div className="form-container">
            <h2 className="text-title">Forgot Password</h2>
            <form onSubmit={handleGetOtp}>
              <div>
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary mt-2" disabled={loading}>
                {loading && <span className="spinner-border mr-1"></span>}
                Get OTP
              </button>
              <div className="link-div">
                <button type="button" onClick={() => setFormState("login")} className="link">
                  Return to Login
                </button>
              </div>
            </form>
          </div>
        )}

        {formState === "verifyOTP" && (
          <div className="form-container">
            <h2 className="text-title mb-3">Verify OTP</h2>
            <form onSubmit={handleOtpVerification}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter OTP"
                value={otpVal}
                onChange={(e) => setOtpVal(e.target.value)}
              />
              <button type="submit" className="btn-secondary mt-2" disabled={loading}>
                {loading && <span className="spinner-border"></span>}
                Verify OTP
              </button>
            </form>
          </div>
        )}

        {formState === "resetPassword" && (
          <div className="form-container">
            <h2 className="text-title">Reset Password</h2>
            <form onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary mt-3" disabled={loading}>
                {loading && <span className="spinner-border"></span>}
                Reset Password
              </button>
            </form>
          </div>
        )}
      </div>
      {showError && <ErrorDialogBox message={errorMessage} onClose={closeErrorDialog} />}
    </div>
  );
};

export default Login;
