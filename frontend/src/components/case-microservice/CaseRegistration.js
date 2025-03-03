import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import UserService from "../../services/user.service";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Tasks } from "../../common/models/tasks";
import { IR_status } from "../../common/models/IR-status";
import { FaTrashAlt } from "react-icons/fa";
import { CiSquarePlus } from "react-icons/ci";
import { IVTypes } from "../../common/models/IV-Types";
import { LossTypes } from "../../common/models/TypeOfLoss";
import Select from "react-select";
import { case_types } from "../../common/models/Case-Types";
import { useNavigate } from "react-router-dom";
import caseService from "../../services/case-service";
import { fosActions } from "../../common/models/fosActions";
import { registration_data } from "../../common/models/registration-data";

const FileInput = ({ files, onFileChange, onFileNameChange, onRemoveFile, onPreviewFile }) => (
  <>
    <label className="text-xl text-sky-800 font-normal">Files</label>
    <div className="flex items-center my-2">
      <input
        type="file"
        multiple
        onChange={onFileChange}
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer px-3 py-2 border rounded-md text-gray-600 bg-gray-100 transition duration-300 hover:bg-gray-200 text-center"
      >
        Choose Files
      </label>
    </div>
    {files.length > 0 && (
      <div className="bg-orange-100 mb-4 p-2 rounded-md shadow">
        <ul>
          {files.map((file, index) => (
            <li key={index} className="file-list">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={file.name.split(".").slice(0, -1).join(".")}
                  onChange={(e) => onFileNameChange(index, e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="ml-1 text-sm text-gray-500">
                  .{file.name.split(".").pop()}
                </span>
              </div>
              <div className="file-action flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPreviewFile(file)}
                  className="text-blue-500 hover:text-blue-700 transition duration-300"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={(event) => onRemoveFile(index, event)}
                  className="text-red-500 hover:text-red-700 transition duration-300"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
);

const CaseRegistration = () => {
  const navigate = useNavigate();
  const [fos, setfos] = useState([]);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(registration_data);

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  // Fetch investigation officers from backend API when component mounts
  useEffect(() => {
      UserService.getUsers().then(
        (response) => {
          setfos(response.data);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          setErrorMessage(error);
          setShowError(true);
        }
      );
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).map((file) => ({
      originalName: file.name,
      name: file.name,
      file,
    }));
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileNameChange = (index, newName) => {
    setSelectedFiles((prev) =>
      prev.map((file, i) => {
        if (i === index) {
          const extension = file.name.split(".").pop();
          const sanitizedNewName =
            newName.split(".").slice(0, -1).join(".") || newName;
          return { ...file, name: `${sanitizedNewName}.${extension}` };
        }
        return file;
      })
    );
  };

  // Remove file from the list
  const handleRemoveFile = (index, event) => {
    event.preventDefault();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePreviewFile = (file) => {
    const fileType = file.file.type;
    const isImage = fileType.startsWith("image/");
    const isPDF = fileType === "application/pdf";

    if (isImage || isPDF) {
      const objectUrl = URL.createObjectURL(file.file);
      window.open(objectUrl, "_blank");
    } else {
      alert("Preview is only available for Image and PDF files.");
    }
  };

  // Form submission handler
  const caseRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Create a FormData object
      const data = new FormData();
      for (const key in formData) {
        if ( key === "fosAssignments") {
          var fosAssignments =  formData[key]
        } else {
          data.append(key, formData[key]);
        }
      }
      if (selectedFiles.length === 0) {
        alert("No files selected for upload");
      }
  
      // Call the registerCase function and retrieve the caseId
      const caseId = await caseService.registerCase(data, selectedFiles, fosAssignments);
      alert(`Case successfully registered:- ${caseId}`);
      setLoading(false);
  
      // Navigate to the case details page using the returned caseId
      navigate(`/case-detail/${caseId}`);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || "Failed to register case.");
      setShowError(true);
    }
  };  

  // Handle petitioner input change
  const handlePetitionerChange = (index, event) => {
    const { value } = event.target;
    const newPetitioners = [...formData.petitioners];
    newPetitioners[index] = value;
    setFormData({ ...formData, petitioners: newPetitioners });
  };

  const handleTaskChange = (selectedOptions) => {
    const selectedTasks = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData((prevFormData) => ({
      ...prevFormData,
      task: selectedTasks,
    }));
  };

  const handleFOSChange = (index, selectedOption) => {
    const newFOSAssignments = [...formData.fosAssignments];
    newFOSAssignments[index].fos = selectedOption;
    setFormData({ ...formData, fosAssignments: newFOSAssignments });
  };

  const handleFOSTaskChange = (index, selectedOptions) => {
    const newFOSAssignments = [...formData.fosAssignments];
    newFOSAssignments[index].tasks = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({ ...formData, fosAssignments: newFOSAssignments });
  };

  const addFOSAssignment = () => {
    setFormData({
      ...formData,
      fosAssignments: [...formData.fosAssignments, { fos: null, tasks: [] }],
    });
  };

  const removeFOSAssignment = (index) => {
    const newFOSAssignments = formData.fosAssignments.filter((_, i) => i !== index);
    setFormData({ ...formData, fosAssignments: newFOSAssignments });
  };

  // Add a new petitioner field
  const addPetitioner = () => {
    setFormData({
      ...formData,
      petitioners: [...formData.petitioners, []],
    });
  };

  // Remove a petitioner field
  const removePetitioner = (index) => {
    const newPetitioners = formData.petitioners.filter((_, i) => i !== index);
    setFormData({ ...formData, petitioners: newPetitioners });
  };

  const calculateDelayInFir = (fir_date, date_of_loss) => {
    if (!fir_date || !date_of_loss) return 0; // Fix: Use OR (||) instead of AND (&&)
    const dol = new Date(date_of_loss);
    const fir = new Date(fir_date);
    if (isNaN(dol) || isNaN(fir)) {
      return "Invalid date";
    }
    const delayInFir = Math.floor((fir - dol) / (1000 * 60 * 60 * 24)); // Difference in days
    return delayInFir;
  };

  const handleBackClick = () => {
    navigate(-1); // This navigates to the previous page in history
  };

  const taskOptions = Tasks.map((task) => ({ value: task, label: task }));
  const fosActionsOptions = fosActions.map((task) => ({
    value: task,
    label: task,
  }));
  const ir_status = IR_status;
  const losstypes = LossTypes;
  const ivtypes = IVTypes;
  const caseTypes = case_types;

  if (!currentUser) {
    return <Navigate to="/login" />;
  } else if (currentUser.user.user_role !== "Admin") {
    return (
      <div className="alert alert-danger" role="alert">
        Access Denied: Admins Only
      </div>
    );
  }

  return (
    <Container className="main-card mb-4">
      <div className="d-flex justify-content-between mb-2">
        <h2 className="text-title">Register New Case</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleBackClick}
        >
          Back
        </button>
      </div>
      <form onSubmit={caseRegister}>
        <div className="grid gap-8">
          {/* Case Details */}
          <fieldset className="border p-3 mb-1 registration-card">
            <label className="text-xl text-sky-800 font-normal">
              Case Details:
            </label>
            <hr className="mb-3" />
            <div className="grid sm:grid-cols-2 gap-8">
              {/* State */}
              <div>
                <label className="text-gray-800 text-sm lable">
                  State<span className="required-mark">*</span>
                </label>
                <input
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter State"
                  required
                />
              </div>
              {/* Insurer */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Insurer<span className="required-mark">*</span>
                </label>
                <input
                  name="insurer"
                  type="text"
                  value={formData.insurer}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Insurer"
                  required
                />
              </div>
              {/* MACP Court Location */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  MACP Court Location<span className="required-mark">*</span>
                </label>
                <input
                  name="mact_cl"
                  type="text"
                  value={formData.mact_cl}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (/\d/.test(e.key)) {
                      e.preventDefault(); // Prevent number input
                    }
                  }}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter MACP Court Location"
                  required
                />
              </div>
              {/* Assigned By */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Assigned By<span className="required-mark">*</span>
                </label>
                <input
                  name="assigned_by"
                  type="text"
                  value={formData.assigned_by}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Assigned By"
                  required
                />
              </div>
              {/* Assignee Email */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Assignee Email Id<span className="required-mark">*</span>
                </label>
                <input
                  name="email_id"
                  type="email"
                  value={formData.email_id}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Email"
                  required
                />
              </div>
              {/* Case Type */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Case Type/Product<span className="required-mark">*</span>
                </label>
                <select
                  name="case_type"
                  value={formData.case_type}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  required
                >
                  <option value="" disabled>
                    Case Types
                  </option>
                  {caseTypes.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              {/* Claim No */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Claim No<span className="required-mark">*</span>
                </label>
                <input
                  name="claim_no"
                  type="text"
                  value={formData.claim_no}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Claim No"
                  required
                />
              </div>
              {/*DOA*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  DOA<span className="required-mark">*</span>
                </label>
                <input
                  name="doa"
                  type="datetime-local"
                  required
                  value={formData.doa}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="DOA"
                />
              </div>
              {/* MACT Case No */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  MACT Case No<span className="required-mark">*</span>
                </label>
                <input
                  name="mact_case_no"
                  type="text"
                  value={formData.mact_case_no}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter MACT Case No"
                  required
                />
              </div>
              {/* Claim Amount */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Claim Amount<span className="required-mark">*</span>
                </label>
                <input
                  name="claim_amount"
                  type="text"
                  value={formData.claim_amount}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    if (/^\d*$/.test(value)) {
                      // Allows only numbers
                      setFormData({ ...formData, [name]: value });
                    }
                  }}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Claim Amount"
                  required
                />
              </div>
              {/* Claim Filled u/s */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Claim Filled u/s<span className="required-mark">*</span>
                </label>
                <input
                  name="claim_filled_us"
                  type="text"
                  value={formData.claim_filled_us}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Claim Filed u/s"
                  required
                />
              </div>
              {/* Policy No */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Policy No<span className="required-mark">*</span>
                </label>
                <input
                  name="policy_no"
                  type="text"
                  required
                  value={formData.policy_no}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Policy No"
                />
              </div>
              {/* Policy Start Date */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Policy Start Date<span className="required-mark">*</span>
                </label>
                <input
                  name="policy_start_date"
                  type="datetime-local"
                  required
                  value={formData.policy_start_date}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Policy Start Date"
                />
              </div>
              {/* Policy End Date */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Policy END Date<span className="required-mark">*</span>
                </label>
                <input
                  name="policy_end_date"
                  type="datetime-local"
                  required
                  value={formData.policy_end_date}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Policy END Date"
                />
              </div>
              {/* IR Status */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  IR Status<span className="required-mark">*</span>
                </label>
                <select
                  name="ir_status"
                  value={formData.ir_status}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                >
                  <option value="" disabled>
                    IR Status
                  </option>
                  {ir_status.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              {/* Task Dropdown */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Task<span className="required-mark">*</span>
                </label>
                {/* <div className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"> */}
                <Select
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  options={taskOptions}
                  isMulti
                  required
                  value={taskOptions.filter((option) =>
                    formData.task.includes(option.value)
                  )}
                  onChange={handleTaskChange}
                  placeholder="Select tasks..."
                />
                {/* </div> */}
              </div>
              {/* Date of Loss */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Date of Loss<span className="required-mark">*</span>
                </label>
                <input
                  name="date_of_loss"
                  type="datetime-local"
                  required
                  value={formData.date_of_loss}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Date of Loss"
                />
              </div>
              {/* Loss Location */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Loss Location<span className="required-mark">*</span>
                </label>
                <input
                  name="loss_location"
                  type="text"
                  required
                  value={formData.loss_location}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Loss Location"
                />
              </div>
            </div>
          </fieldset>
          {/* Case Title */}
          <fieldset className="border p-3 mb-1 registration-card">
            <label className="text-xl font-normal text-sky-800">
              Case Title:
            </label>
            <hr className="mb-3" />
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Petitioner */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Petitioners<span className="required-mark">*</span>
                </label>
                <div className="flex gap-4 mb-2">
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="petitionerStatus"
                      value="yes"
                      checked={formData.petitionerStatus === "yes"}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="petitionerStatus"
                      value="no"
                      checked={formData.petitionerStatus === "no"}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="petitionerStatus"
                      value="not_required"
                      checked={formData.petitionerStatus === "not_required"}
                      onChange={handleInputChange}
                    />
                    Not Required
                  </label>
                </div>
                {formData.petitionerStatus === "yes" && (
                  <>
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Petitioners Name<span className="required-mark">*</span>
                    </label>
                    {formData.petitioners.map((petitioner, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="text"
                          required
                          name={`petitioner_${index}`}
                          value={petitioner.name}
                          onChange={(e) => handlePetitionerChange(index, e)}
                          className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                          placeholder="Enter Petitioner Name"
                        />
                        {index !== formData.petitioners.length - 1 && (
                          <button
                            type="button"
                            className="ml-2 text-red-500"
                            onClick={() => removePetitioner(index)}
                          >
                            <FaTrashAlt className="ml-3" />
                          </button>
                        )}
                        {index === formData.petitioners.length - 1 && (
                          <button
                            type="button"
                            className="ml-2 text-blue-500"
                            onClick={addPetitioner}
                          >
                            <CiSquarePlus size={30} />
                          </button>
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="text-gray-800 text-sm mb-2 block lable">
                        Petitioner Address
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        name="petitioner_address"
                        type="text"
                        value={formData.petitioner_address}
                        onChange={handleInputChange}
                        className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                        placeholder="Enter Petitioner Address"
                      />
                      <label className="text-gray-800 text-sm mb-2 block lable">
                        District<span className="required-mark">*</span>
                      </label>
                      <input
                        name="petitioner_district"
                        type="text"
                        value={formData.petitioner_district}
                        onChange={handleInputChange}
                        className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                        placeholder="Enter District"
                      />
                      <label className="text-gray-800 text-sm mb-2 block lable">
                        Tehsil<span className="required-mark">*</span>
                      </label>
                      <input
                        name="petitioner_tehsil"
                        type="text"
                        value={formData.petitioner_tehsil}
                        onChange={handleInputChange}
                        className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                        placeholder="Enter Tehsil"
                      />
                    </div>
                  </>
                )}
                {formData.petitionerStatus === "no" && (
                  <div>
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Justification<span className="required-mark">*</span>
                    </label>
                    <textarea
                      name="petitionerJustification"
                      value={formData.petitionerJustification}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Insured */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Insured<span className="required-mark">*</span>
                </label>
                <div className="flex gap-4 mb-2">
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="insuredStatus"
                      value="yes"
                      checked={formData.insuredStatus === "yes"}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="insuredStatus"
                      value="no"
                      checked={formData.insuredStatus === "no"}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="insuredStatus"
                      value="not_required"
                      checked={formData.insuredStatus === "not_required"}
                      onChange={handleInputChange}
                    />
                    Not Required
                  </label>
                </div>
                {formData.insuredStatus === "yes" && (
                  <>
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Insured Name<span className="required-mark">*</span>
                    </label>
                    <input
                      name="insured"
                      type="text"
                      value={formData.insured}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Insured"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Insured Address<span className="required-mark">*</span>
                    </label>
                    <input
                      name="insured_address"
                      type="text"
                      value={formData.insured_address}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Insured Address"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      District<span className="required-mark">*</span>
                    </label>
                    <input
                      name="insured_district"
                      type="text"
                      value={formData.insured_district}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter District"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Tehsil<span className="required-mark">*</span>
                    </label>
                    <input
                      name="insured_tehsil"
                      type="text"
                      value={formData.insured_tehsil}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Tehsil"
                    />
                  </>
                )}
                {formData.insuredStatus === "no" && (
                  <div>
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Justification<span className="required-mark">*</span>
                    </label>
                    <textarea
                      name="insuredJustification"
                      value={formData.insuredJustification}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Driver */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Driver<span className="required-mark">*</span>
                </label>
                <div className="flex gap-4 mb-2">
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="driverStatus"
                      value="yes"
                      checked={formData.driverStatus === "yes"}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="driverStatus"
                      value="no"
                      checked={formData.driverStatus === "no"}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                  <label>
                    <input
                      className="mr-1"
                      type="radio"
                      name="driverStatus"
                      value="not_required"
                      checked={formData.driverStatus === "not_required"}
                      onChange={handleInputChange}
                    />
                    Not Required
                  </label>
                </div>
                {formData.driverStatus === "yes" && (
                  <>
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Driver Name<span className="required-mark">*</span>
                    </label>
                    <input
                      name="driver"
                      type="text"
                      value={formData.driver}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Driver"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Driver Address<span className="required-mark">*</span>
                    </label>
                    <input
                      name="driver_address"
                      type="text"
                      value={formData.driver_address}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Driver Address"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      District<span className="required-mark">*</span>
                    </label>
                    <input
                      name="driver_district"
                      type="text"
                      value={formData.driver_district}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter District"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Tehsil<span className="required-mark">*</span>
                    </label>
                    <input
                      name="driver_tehsil"
                      type="text"
                      value={formData.driver_tehsil}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Tehsil"
                    />
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      DL NO<span className="required-mark">*</span>
                    </label>
                    <input
                      name="dl_no"
                      type="text"
                      required
                      value={formData.dl_no}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      placeholder="Enter Driver License No"
                    />
                  </>
                )}
                {formData.driverStatus === "no" && (
                  <div>
                    <label className="text-gray-800 text-sm mb-2 block lable">
                      Justification<span className="required-mark">*</span>
                    </label>
                    <textarea
                      name="driverJustification"
                      value={formData.driverJustification}
                      onChange={handleInputChange}
                      className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </fieldset>
          {/* IV Details */}
          <fieldset className="border p-3 mb-1 registration-card">
            <label className="text-xl font-normal text-sky-800 ">
              IV Details:
            </label>
            <hr className="mb-3" />
            <div className="grid sm:grid-cols-2 gap-8">
              {/* IV Registration no */}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  IV Registration no<span className="required-mark">*</span>
                </label>
                <input
                  name="iv_no"
                  type="text"
                  required
                  value={formData.iv_no}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="IV Registration no"
                />
              </div>
              {/* IV Type*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  IV Type<span className="required-mark">*</span>
                </label>
                <select
                  name="iv_type"
                  type="text"
                  required
                  value={formData.iv_type}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="IV Type"
                >
                  <option value="" disabled>
                    Select IV Type
                  </option>
                  {ivtypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {/* Product Code*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Product Code<span className="required-mark">*</span>
                </label>
                <input
                  name="product_code"
                  type="text"
                  required
                  value={formData.product_code}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Product Code"
                />
              </div>
            </div>
          </fieldset>
          {/* Loss type */}
          <fieldset className="border p-3 mb-4 registration-card">
            <label className="text-xl font-normal text-sky-800 ">
              Loss type:
            </label>
            <hr className="mb-3" />
            <div className="grid sm:grid-cols-2 gap-8">
              {/*Type of Loss*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Type of Loss<span className="required-mark">*</span>
                </label>
                <select
                  name="type_of_loss"
                  type="text"
                  required
                  value={formData.type_of_loss}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                >
                  <option value="" disabled>
                    Select Type of Loss
                  </option>
                  {losstypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {/*Injured Name*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Injured/deceased Name<span className="required-mark">*</span>
                </label>
                <input
                  name="injured_name"
                  type="text"
                  required
                  value={formData.injured_name}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Injured/deceased Name"
                />
              </div>
            </div>
          </fieldset>
          {/* Police Station Details */}
          <fieldset className="border p-3 mb-1 registration-card">
            <label className="text-xl font-normal text-sky-800 ">
              Police Station Details:
            </label>
            <hr className="mb-3" />
            <div className="grid sm:grid-cols-2 gap-8">
              {/*FIR No*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  FIR No<span className="required-mark">*</span>
                </label>
                <input
                  name="fir_no"
                  type="text"
                  required
                  value={formData.fir_no}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Police Station Details"
                />
              </div>
              {/*FIR Date*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  FIR Date<span className="required-mark">*</span>
                </label>
                <input
                  name="fir_date"
                  type="datetime-local"
                  required
                  value={formData.fir_date}
                  onChange={(e) => {
                    const { value } = e.target;
                    const delay = calculateDelayInFir(
                      value,
                      formData.date_of_loss
                    );
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      fir_date: value,
                      delayInFir: delay,
                    }));
                  }}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="FIR Date"
                />
              </div>
              {/*Delay in FIR*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Delay in FIR<span className="required-mark">*</span>
                </label>
                <input
                  name="delayInFir"
                  type="text"
                  required
                  value={formData.delayInFir}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Delay in FIR"
                  disabled
                />
              </div>
              {/*Police Station*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Police Station<span className="required-mark">*</span>
                </label>
                <input
                  name="police_station"
                  type="text"
                  required
                  value={formData.police_station}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Police Station"
                />
              </div>
              {/*Police Station Address*/}
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Police Station Address<span className="required-mark">*</span>
                </label>
                <input
                  name="police_station_address"
                  type="text"
                  required
                  value={formData.police_station_address}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Police Station"
                />
                <label className="text-gray-800 text-sm mb-2 block lable">
                  District<span className="required-mark">*</span>
                </label>
                <input
                  name="police_station_district"
                  type="text"
                  value={formData.police_station_district}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                  placeholder="Enter District"
                />
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Tehsil<span className="required-mark">*</span>
                </label>
                <input
                  name="police_station_tehsil"
                  type="text"
                  value={formData.police_station_tehsil}
                  onChange={handleInputChange}
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md"
                  placeholder="Enter Tehsil"
                />
              </div>
            </div>
          </fieldset>
          {/* FOS */}
          <fieldset className="border p-3 mb-1 registration-card">
            <label className="text-xl font-normal text-sky-800 ">FOS:</label>
            <hr className="mb-3" />
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <label className="text-gray-800 text-sm mb-2 block lable">
                  Assign FOS & Tasks<span className="required-mark">*</span>
                </label>
                {formData.fosAssignments.map((assignment, index) => (
                <div key={index} className="mb-3 p-2 border rounded-md flex flex-col md:flex-row md:items-center md:gap-3">
                  {/* Select FOS */}
                  <div className="flex-1">
                    <Select
                      className="mb-2 md:mb-0"
                      options={fos.map((officer) => ({
                        value: officer.username,
                        label: officer.username,
                      }))}
                      value={
                        assignment.fos
                          ? { value: assignment.fos, label: assignment.fos }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleFOSChange(index, selectedOption ? selectedOption.value : null)
                      }
                      placeholder="Select Officer..."
                    />
                  </div>

                  {/* Select Tasks */}
                  <div className="flex-1">
                    <Select
                      className="mb-2 md:mb-0"
                      options={fosActionsOptions}
                      isMulti
                      value={fosActionsOptions.filter((option) =>
                        assignment.tasks.includes(option.value)
                      )}
                      onChange={(selectedOptions) => handleFOSTaskChange(index, selectedOptions)}
                      placeholder="Assign tasks..."
                    />
                  </div>

                  {/* Remove FOS Assignment */}
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 transition duration-300 text-xs md:text-sm px-2 py-1 border border-red-500 rounded-md"
                    onClick={() => removeFOSAssignment(index)}
                  >
                    ❌ Remove
                  </button>
                </div>
              ))}
              {/* Button to Add More FOS Assignments */}
              <button
                type="button"
                className="bg-blue-500 text-white text-xs md:text-sm px-3 py-1 rounded-md mt-2"
                onClick={addFOSAssignment}
              >
                + Add FOS
              </button>

              </div>
              {/* Files Section  */}
              <div>
                <FileInput
                  files={selectedFiles}
                  onFileChange={handleFileChange}
                  onFileNameChange={handleFileNameChange}
                  onPreviewFile={handlePreviewFile}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </div>
          </fieldset>
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm"></span>
            )}
            <span>Register</span>
          </button>
        </div>
      </form>

      {showError && (
        <ErrorDialogBox
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </Container>
  );
};

export default CaseRegistration;
