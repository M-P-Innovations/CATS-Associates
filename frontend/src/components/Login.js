import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login, sendotp, verifyOtp, resetPassword } from "../slices/auth";
import { clearMessage } from "../slices/message";
import ErrorDialogBox from "../common/ErrorDialogBox"
import { Navigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import "../common/Common.css"

const Login = () => {
  let navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [forgetPassword, setForgetPassword] = useState(false);
  const [getOTP, setgetOtp] = useState(true)
  const [verifyOTP, setverifyOtp] = useState(false)
  const [otpVal, setOtpVal] = useState('');
  const [openPasswordForm, setopenPassword] = useState(false);
  const [newPasswordVal, setNewPassword] = useState(null);
  const [confirmPasswordVal, setConfirmPassword] = useState(null);
  const [username, setUsername] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  if (currentUser) {
    return <Navigate to="/home" />;
  }

  const initialValues = {
    username: "",
    password: "",
  };

  const toggleForm = () => {
    setForgetPassword(!forgetPassword);
  }

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("This field is required!"),
    password: Yup.string().required("This field is required!"),
  });

  const handleLogin = (formValue) => {
    const { username, password } = formValue;
    setLoading(true);

    dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        setLoading(false);
        navigate("/home");
        // window.location.reload();
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage(error);
        setShowError(true);
      });
  };

  const handleGetOtp = () => {
    setLoading(true);
    if (username != null) {
      dispatch(sendotp({ username }))
        .unwrap()
        .then(() => {
          setLoading(false);
          setgetOtp(false);
          setverifyOtp(true);
          alert("OTP has been send to email...")
        })
        .catch((error) => {
          setLoading(false);
          setErrorMessage(error);
          setShowError(true);
        })
    }
    else {
      setLoading(false);
      setErrorMessage("Provide vaild eamil.");
      setShowError(true);
    }
  };

  const handleOtpVerification = (event) => {
    setLoading(true);
    event.preventDefault();
    if (otpVal) {
      dispatch(verifyOtp({ username, otp: otpVal }))
        .unwrap()
        .then(() => {
          setverifyOtp(false);
          setLoading(false);
          setopenPassword(true);
        })
        .catch((error) => {
          // setverifyOtp(false);
          setLoading(false);
          setErrorMessage(error);
          setShowError(true);
          // setgetOtp(true);
        })
    }
  }

  const handlePasswordReset = () => {
    setLoading(true);
    if (newPasswordVal === confirmPasswordVal) {
      dispatch(resetPassword({ username, password: newPasswordVal }))
        .unwrap()
        .then(() => {
          setLoading(false);
          // Password reset successful, navigate to login
          setForgetPassword(false);
        })
        .catch((error) => {
          setErrorMessage(error);
          setShowError(true);
          setLoading(false);
          // Handle error, e.g., show a message
        });
    } else {
      setLoading(false);
      setErrorMessage("Password Missmatch");
      setShowError(true);
      // Handle password mismatch, e.g., show a message
    }
  };

  const closeErrorDialog = () => {
    setShowError(false);
  };

  // if (isLoggedIn) {
  //   return <Navigate to="/profile" />;
  // }

  return (
    <div className="login-flex-center">
      <div className={`responsive-card ${showError ? 'blur-sm' : ''}`}>
        {!forgetPassword ? (
          <div className="form-container">
            <h1 className="text-title">
              Sign in to your account
            </h1>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ values, errors }) => {
                const isFormValid =
                  values.username && values.password && !errors.username && !errors.password;
                return (
                  <Form className="form-container" action="#">
                    <div>
                      <label htmlFor="username" className="form-label">Username</label>
                      <Field type="text" name="username" id="username" className="form-input" placeholder="Your Username" />
                      <ErrorMessage name="username" component="div" className="alert-danger" />
                    </div>
                    <div>
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field type="password" name="password" id="password" placeholder="••••••••" className="form-input" />
                      <ErrorMessage name="password" component="div" className="alert-danger" />
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary btn-block" disabled={!isFormValid || loading}>
                        {loading && (
                          <span className="spinner-border spinner-border-sm"></span>
                        )}
                        <span>Login</span>
                      </button>
                      <div className="link-div">
                        <button onClick={toggleForm} className="link">Forgot password?</button>
                      </div>
                    </div>
                  </Form>
                )
              }}
            </Formik>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet? <a href="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Register</a>
            </p>
          </div>
        ) : (
          <div className="responsive-card form-container">
            <h2 className="text-title">
              Change Password
            </h2>
            <form className="form-container" action="#" onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="username" className="form-label">Your Username</label>
                <input type="text" name="username" id="username" className="form-input" placeholder="username" required=""
                  onChange={
                    (e) => {
                      setUsername(e.target.value);
                      setverifyOtp(false);
                      setgetOtp(true);
                    }} />
              </div>


              <div className="btn-secondary-div">
                {getOTP && (
                  <button type="submit" onClick={handleGetOtp} disabled={loading} className="btn-secondary">
                    {loading && (
                      <span className="spinner-border"></span>
                    )}
                    <span>Get OTP</span></button>
                )}
              </div>
              {verifyOTP && (
                <div>
                  <input type="text" name="otp" id="otp" className="form-input" placeholder="Enter OTP" onChange={(e) => setOtpVal(e.target.value)} />
                  <p className="text-sm text-red-500 dark:text-gray-400">*Enter valid OTP.</p>
                  <button type="button" onClick={handleOtpVerification} disabled={loading}
                    className="btn-primary">
                    {loading && (
                      <span className="spinner-border"></span>
                    )}
                    <span>Verify OTP</span>
                  </button>
                </div>
              )}
              {openPasswordForm && (
                <>
                  <div>
                    <label htmlFor="password" className="form-label">New Password</label>
                    <input type="password" name="password" id="password" placeholder="••••••••" className="form-input" required="" onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                    <input type="password" name="confirm-password" id="confirm-password" placeholder="••••••••" className="form-input" required="" onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary mt-3">
                    {loading && (
                      <span className="spinner-border"></span>
                    )}
                    <span>Reset Password</span>
                  </button>
                </>
              )}
              <div className="link-div">
                <button onClick={toggleForm} type="button" className="link"><b>Return to login</b></button>
              </div>
            </form>
          </div>
        )}
      </div>
      {showError && (
        <ErrorDialogBox message={errorMessage} onClose={closeErrorDialog} />
      )}
    </div>
  );
};

export default Login;
