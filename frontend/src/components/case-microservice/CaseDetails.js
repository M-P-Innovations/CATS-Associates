import React, { useState, useEffect } from "react";
import { Container, Dropdown, Modal, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import caseService from "../../services/case-service";
import { case_details_form_fields } from "../../common/models/CaseDetailsFormFields";
import "../../common/Common.css";
import UserService from "../../services/user.service";
import Hooks from "../../config/hooks";
import Spinner from "../../common/Spinner";
import { FaFileDownload, FaClipboardList } from "react-icons/fa";
import { FaWpforms } from "react-icons/fa";
import Select from "react-select";
import { fosActions } from "../../common/models/fosActions";

const formattedFosActions = fosActions.map((action) => ({
  value: action,
  label: action,
}));

const CaseDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic_details");
  const { user: currentUser } = useSelector((state) => state.auth);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { caseId } = useParams();
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedData, setUpdatedData] = useState([]);
  const [isCollageModalOpen, setIsCollageModalOpen] = useState(false);
  const handleUploadSuccess = () => {
    setIsCollageModalOpen(false);
  };
  const {
    capturedPhotos,
    handleCapturePhoto,
    generateCollageAndPDF,
    handleRemovePhoto,
    locationError,
    loading1,
  } = Hooks.usePhotoCaptureAndPDF(caseService, caseId, activeTab, handleUploadSuccess);
  const [fosData, setfosData] = useState();
  const [caseDetails, setcaseDetail] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [fosAssignments, setFosAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // Track if fields should be disabled based on the select field's value
  const [disableFields, setDisableFields] = useState(false);
  const filteredTabs =
    currentUser?.user?.user_role === "FOS"
      ? ["basic_details"]
      : Object.keys(case_details_form_fields);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      UserService.getUsers(),
      caseService.getCaseById(caseId, activeTab),
    ])
      .then(([usersResponse, caseResponse]) => {
        setFosAssignments(caseResponse.data.fosAssignments);
        setCommentsList(caseResponse.data.commentsList);
        setfosData(usersResponse.data);
        setcaseDetail(caseResponse.data);
        setFormValues((prev) => ({
          ...prev,
          [activeTab]: caseResponse.data, // Initialize formValues with fetched data
        }));
      })
      .catch((error) => {
        alert("Error fetching data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [caseId, activeTab]);

  // Comment section
  const handleAddComment = async () => {
    if (comment.trim()) {
      const newComment = {
        text: comment,
        dateTime: new Date().toLocaleString(),
        user: currentUser.user.username,
        isSaved: false, // Temporarily mark as unsaved
      };
  
      // Make sure commentsList is always an array
      const updatedCommentsList = Array.isArray(commentsList) ? [newComment, ...commentsList] : [newComment];
  
      setCommentsList(updatedCommentsList);
      setComment("");
  
      try {
        // Save all comments, including the new one, to the backend
        await caseService.updateCaseSection(caseId, { commentsList: updatedCommentsList });
  
        // Mark all comments as saved
        const savedComments = updatedCommentsList.map((comment) => ({
          ...comment,
          isSaved: true,
        }));
  
        setCommentsList(savedComments);
      } catch (error) {
        alert("Failed to save comment. Please try again.");
      }
    }
  };  

  // Form Data
  const handleFieldChange = (id, value, type) => {
    if (type === "select" && value !== "Yes") {
      setDisableFields(true);
    } else if (type === "select" && value === "Yes") {
      setDisableFields(false);
    }
    setFormValues((prev) => {
      const updated = {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [id]: value,
        },
      };
      const updatedData = {
        ...prev[activeTab],
        [id]: value,
      };
      setUpdatedData(updatedData);
      return updated;
    });
    setIsFormDirty(true);
  };

  const handleClear = () => {
    // Reset form values to initial state
    setFormValues(""); // Replace with your initial form values
    setIsFormDirty(false); // Reset dirty state
  };

  const handleSave = () => {
    setLoading(true);
    if (updatedData) {
      caseService
        .updateCaseSection(caseId, updatedData)
        .then(() => {
          alert("Section updated successfully");
          setIsFormDirty(false);
          setLoading(false);
        })
        .catch((error) => {
          alert("Failed to update section");
          setLoading(false);
        });
    } else {
      alert("No changes to save");
      setLoading(false);
    }
  };

  // Upload Files
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

  const handleRemoveFile = (index, event) => {
    event.preventDefault();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

  const uploadFiles = () => {
    setLoading(true);
    if (selectedFiles.length === 0) {
      alert("No files selected for upload");
      return;
    }
    caseService
      .uploadCaseFiles(caseId, activeTab, selectedFiles)
      .then(() => {
        alert("Files uploaded successfully");
        setSelectedFiles([]);
        setLoading(false);
      })
      .catch((error) => {
        alert("Failed to upload files");
        setLoading(false);
      });
  };

  const handleLogClick = () => {
    navigate(`/activityLogs/${caseId}`); // This navigates to the previous page in history
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDisableFields(false); // Resetting disableFields state
  };

  const downloadAll = (caseId) => {
    setLoading(true);
    caseService
      .getDownloadUrl(caseId)
      .then((response) => {
        window.location.href = response.data.presignedUrl;
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  // const updateCaseField = (fieldName, value) => {
  //   setLoading(true);
  //   const sectionData = {
  //     [fieldName]: value, // Dynamically set the field to update
  //   };
  //   caseService
  //     .updateCaseSection(caseId, sectionData)
  //     .then(() => {
  //       alert(
  //         `${fieldName.replace(/_/g, " ").toUpperCase()} updated successfully`
  //       );

  //       // Update the case details in UI immediately
  //       setcaseDetail((prev) => ({
  //         ...prev,
  //         [fieldName]: value, // Update only the specific field
  //       }));

  //       setFormValues((prev) => ({
  //         ...prev,
  //         [fieldName]: value, // Update form values dynamically
  //       }));

  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       alert(`Failed to update ${fieldName.replace(/_/g, " ")}`);
  //       setLoading(false);
  //     });
  // };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAssignment(null);
  };

  const handleFOSChange = (selectedOption) => {
    setCurrentAssignment((prev) => ({ ...prev, fos: selectedOption.value }));
  };

  const handleFOSTaskChange = (selectedOptions) => {
    setCurrentAssignment((prev) => ({
      ...prev,
      tasks: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  const handleSaveFos = () => {
    setLoading(true);
    let updatedFOSAssignments = [...fosAssignments];

    if (isEditing) {
      // Update existing FOS assignment
      updatedFOSAssignments[currentAssignment.index] = {
        fos: currentAssignment.fos,
        tasks: currentAssignment.tasks,
      };
    } else {
      // Add new FOS assignment
      updatedFOSAssignments.push({
        fos: currentAssignment.fos,
        tasks: currentAssignment.tasks,
      });
    }

    setFosAssignments(updatedFOSAssignments);
    handleCloseModal();

    // Save the updated FOS assignments to the backend
    caseService
      .updateCaseSection(caseId, { fosAssignments: updatedFOSAssignments })
      .then(() => {
        setLoading(false);
        alert(
          isEditing
            ? "FOS assignment updated successfully."
            : "New FOS added successfully."
        );
      })
      .catch(() => {
        setLoading(false);
        alert("Failed to update FOS assignments.");
      });
  };

  const handleAddFos = () => {
    setCurrentAssignment({ fos: "", tasks: [] }); // Reset form
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditFos = (index) => {
    setCurrentAssignment({ ...fosAssignments[index], index });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleRemoveFos = (index) => {
    const newFosAssignments = fosAssignments.filter((_, i) => i !== index);
    setFosAssignments(newFosAssignments);
    // Optionally, update the backend immediately after removing
    caseService
      .updateCaseSection(caseId, { fosAssignments: newFosAssignments })
      .then(() => {
        alert("FOS assignment removed successfully.");
      })
      .catch((error) => {
        alert("Failed to remove FOS assignment.");
      });
  };

  if (!currentUser) return <Navigate to="/login" />;

  return (
    <Container className="main-card space-y-4 mb-4">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
            <div className="d-flex flex-column mb-3">
              <h2 className="text-title mb-2">
                <u>{`${caseDetails.case_title}`}</u>
              </h2>
              <h6 className="mb-2">{`${caseDetails.claim_no}`}</h6>
            </div>
            {currentUser?.user?.user_role === "Admin" && (
              <div className="d-flex gap-2">
                <Dropdown>
                  <Dropdown.Toggle variant="secondary">
                    Manage FOS
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="p-2">
                    {fosAssignments.map((assignment, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center px-2"
                      >
                        <Dropdown.Item onClick={() => handleEditFos(index)}>
                          {assignment.fos}
                        </Dropdown.Item>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveFos(index)}
                        >
                          ✖
                        </Button>
                      </div>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={handleAddFos}
                      className="text-success"
                    >
                      + Add FOS
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Modal for Add/Edit FOS */}
                <Modal show={showModal} onHide={handleCloseModal}>
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {isEditing ? "Edit FOS Assignment" : "Add FOS"}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group>
                        <Form.Label>FOS</Form.Label>
                        <Select
                          options={fosData.map((officer) => ({
                            value: officer.username,
                            label: officer.username,
                          }))}
                          value={
                            currentAssignment
                              ? {
                                  value: currentAssignment.fos,
                                  label: currentAssignment.fos,
                                }
                              : null
                          }
                          onChange={handleFOSChange}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Tasks</Form.Label>
                        <Select
                          options={formattedFosActions}
                          isMulti
                          value={
                            currentAssignment && currentAssignment.tasks
                              ? currentAssignment.tasks.map((task) => ({
                                  value: task,
                                  label: task,
                                }))
                              : []
                          }
                          onChange={handleFOSTaskChange}
                          placeholder="Select tasks..."
                        />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleSaveFos}>
                      {isEditing ? "Save Changes" : "Add FOS"}
                    </Button>
                  </Modal.Footer>
                </Modal>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary">Action</Dropdown.Toggle>
                  <Dropdown.Menu className="p-2">
                    <Dropdown.Item
                      onClick={handleLogClick}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaClipboardList color="blue" /> Get Logs
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => downloadAll(caseId)}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaFileDownload color="green" /> Download Documents
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => navigate(`/rti-form/${caseId}`)}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaWpforms color="green" /> Generate RTI Form
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => navigate(`/court-form/${caseId}`)}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaWpforms color="green" /> Generate Court Form
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
          </div>
          <hr className="mb-4" />
          <div>
            <div className="tabs-container flex flex-wrap gap-2 mb-4">
              {filteredTabs.map((tab) => (
                <Hooks.TabButton
                  key={tab}
                  isActive={activeTab === tab}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </Hooks.TabButton>
              ))}
            </div>
            <div className="dropdown-container hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="p-2 border rounded-md bg-gray-200 text-gray-700"
              >
                {filteredTabs.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <form>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {case_details_form_fields[activeTab].map((field, index) => (
                  <Hooks.RenderField
                    key={index}
                    field={field}
                    formValues={formValues[activeTab] || {}}
                    onFieldChange={handleFieldChange}
                    isDisabled={disableFields && field.dependsOn} // Disable all fields except select
                  />
                ))}
              </div>
              <div className="flex-wrap gap-4 my-4 text-center">
                <button
                  type="button"
                  onClick={() => handleSave(activeTab)}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                    isFormDirty
                      ? "hover:bg-blue-700"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={!isFormDirty}
                >
                  Save Details
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className={`px-4 py-2 m-2 bg-gray-200 text-gray-700 rounded-md ${
                    isFormDirty
                      ? "hover:bg-gray-300"
                      : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={!isFormDirty}
                >
                  Clear Details
                </button>
              </div>

              {/* Files Section  */}
              <div className="border-2 px-3 pt-2 mb-4">
                <Hooks.FileInput
                  files={selectedFiles}
                  onFileChange={handleFileChange}
                  onFileNameChange={handleFileNameChange}
                  onRemoveFile={handleRemoveFile}
                  onPreviewFile={handlePreviewFile}
                  onCapturePhoto={handleCapturePhoto}
                  onGenerateCollageAndPDF={generateCollageAndPDF}
                />
                {locationError && (
                  <div className="text-red-500 mt-2">
                    Error accessing location: {locationError}. Please check your
                    browser settings and ensure location access is enabled.
                  </div>
                )}
                <div className="flex-wrap gap-4 mt-4 text-center">
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => uploadFiles(activeTab)}
                      className="px-4 py-2 m-2 bg-green-500 text-white rounded-md hover:bg-green-700"
                    >
                      Upload Files
                    </button>
                  )}
                  {capturedPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCollageModalOpen(true)}
                      className="px-4 py-2 mb-3 bg-blue-500 text-white rounded-md hover:bg-blue-700"
                    >
                      View Photo Collage
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Comment Section */}
            <section className="px-3 py-2 mt-2 border-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Comments
              </h2>

              <div className="space-y-4 mb-4">
                {commentsList && commentsList.length > 0 ? (
                  commentsList.map((comment, index) => (
                    <div
                      key={index}
                      className="relative bg-gray-100 p-3 rounded-md shadow-md text-gray-700 overflow-hidden"
                    >
                      <p className="text-gray-800 font-normal break-words">
                        {comment.text}
                      </p>
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        {comment.dateTime} - {comment.user}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No comments yet. Be the first to add one!
                  </p>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any additional comments here..."
                  className="w-full h-32 p-4 border-1 border-gray-300 rounded-md focus:outline-none focus:border-gray-500 text-gray-700"
                ></textarea>

                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition duration-300 ease-in-out transform ${
                    comment.trim()
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <FiArrowRight size={20} />
                </button>
              </div>
            </section>
          </div>
          <Hooks.CollageModal
            isOpen={isCollageModalOpen}
            onClose={() => setIsCollageModalOpen(false)}
            photos={capturedPhotos}
            onRemovePhoto={handleRemovePhoto}
            onUploadPdf={generateCollageAndPDF}
            loading={loading1}
          />
        </>
      )}
    </Container>
  );
};

export default CaseDetail;
