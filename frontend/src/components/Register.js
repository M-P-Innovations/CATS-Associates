import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import ErrorDialogBox from "../common/ErrorDialogBox"
import { register } from "../slices/auth";
import { clearMessage } from "../slices/message";
import ReCAPTCHA from "react-google-recaptcha";
import { citieLists } from "../common/models/city-list"
import { Avatars } from "../common/models/avatars"
import "../common/Common.css"

const Register = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [capVal, setcapVal] = useState(null) //set it to null
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openLogo, setOpenLogo] = useState(false);
  const [logoValue, setlogoValue] = useState(null);
  const sitekey = process.env.REACT_APP_SITE_KEY;

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = {
    username: "",
    email: "",
    name: "",
    city: "",
    password: "",

  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .test(
        "len",
        "The username must be between 3 and 20 characters.",
        (val) =>
          val &&
          val.toString().length >= 3 &&
          val.toString().length <= 20
      )
      .required("This field is required!"),
    name: Yup.string()
      .required("This field is required!"),
    email: Yup.string()
      .email("This is not a valid email.")
      .required("This field is required!"),
    password: Yup.string()
      .test(
        "len",
        "The password must be between 6 and 40 characters.",
        (val) =>
          val &&
          val.toString().length >= 6 &&
          val.toString().length <= 40
      )
      .required("This field is required!"),
    city: Yup.string()
      .required("This field is required!"),
  });

  const handleRegister = (formValue) => {
    const { username, name, email, city, password } = formValue;
    setLoading(true);

    dispatch(register({ username, name, email, city, password }))
      .unwrap()
      .then(() => {
        alert("User successfully register.")
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage(error);
        setShowError(true);
      });
  };

  const closeErrorDialog = () => {
    setShowError(false);
  };

  function toggleLogo() {
    setOpenLogo(!openLogo);
  }

  const cities = citieLists;
  const Logo = Avatars;

  return (
    <div className="flex-center">
      <div className={`responsive-card ${showError ? 'blur-sm' : ''}`}>
        <div className="form-container">
          <h1 className="text-title">
            Register an account
          </h1>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleRegister} >
            {({ values, errors }) => {
              const isFormValid =
                values.username && values.username && values.password && !errors.username && !errors.username && !errors.password && capVal && logoValue;
              return (
                <Form className="form-container" action="#">

                  <label htmlFor="name" className="form-label">Name</label>
                  <Field type="name" name="name" id="name" className="form-input" placeholder="Enter Name" required="" />
                  <ErrorMessage name="name" component="div" className="alert-danger" />

                  <label htmlFor="username" className="form-label">Username</label>
                  <Field type="username" name="username" id="username" className="form-input" placeholder="Enter Username" required="" />
                  <ErrorMessage name="username" component="div" className="alert-danger" />

                  <label htmlFor="email" className="form-label">Your email</label>
                  <Field type="email" name="email" id="email" className="form-input" placeholder="name@company.com" required="" />
                  <ErrorMessage name="email" component="div" className="alert-danger" />

                  <label htmlFor="city" className="form-label">Select City</label>
                  <Field as="select" type="city" name="city" id="city" className="form-input" placeholder="Enter City" required="" >
                    <option value="">-- Select a city --</option>
                    {cities.map(city => (<option key={city} value={city}>{city}</option>))}
                  </Field>
                  <ErrorMessage name="city" component="div" className="alert-danger" />

                  <label htmlFor="password" className="form-label">Password</label>
                  <Field type="password" name="password" id="password" className="form-input" placeholder="••••••••" required="" />
                  <ErrorMessage name="password" component="div" className="alert-danger" />

                  <button onClick={toggleLogo} className="btn btn-success btn-block mt-2" type="button">
                    <span>Select Avatar</span>
                  </button>

                  <div className="form-group">
                    <ReCAPTCHA className="gr-recaptcha" sitekey={sitekey} onChange={(val) => setcapVal(val)} />
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-block" disabled={!isFormValid || loading}>
                      {loading && (<span className="spinner-border spinner-border-sm"></span>)}
                      <span>Register</span>
                    </button>
                  </div>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Already have an account? <a href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</a>
                  </p>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
      {openLogo && (
        <>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-sm w-full z-10">
              <span className="text-title">Select Logo</span>
              <ul id="avatar-radios">
                {Logo.map(logo => (<><li><input type="radio" id={`cb${logo}`} name="avatar" value={logo} onChange={(e) => setlogoValue(e.target.value)} />
                  <label htmlFor={`cb${logo}`}><img src={require(`../common/assets/images/avatars/${logo}`)} alt="logo" /></label>
                </li></>
                ))}
              </ul>
              <span className="d-flex justify-content-between p-2">
                <button className="btn btn-dark" type="button" onClick={toggleLogo}>close</button>
              </span>
            </div>
          </div>
        </>
      )}
      {showError && (
        <ErrorDialogBox message={errorMessage} onClose={closeErrorDialog} />
      )}
    </div>
  );
};

export default Register;
