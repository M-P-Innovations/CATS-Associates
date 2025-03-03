import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import React, { useRef } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import Masonry from "react-masonry-css";
import Spinner from "../common/Spinner";

const usePhotoCaptureAndPDF = (
  caseService,
  caseId,
  activeTab,
  onUploadSuccess
) => {
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [loading1, setLoading] = useState(false);

  const fetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    try {
      const getPosition = () =>
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

      const position = await getPosition();
      const coords = position.coords;
      setLocationError(null);
      return coords;
    } catch (error) {
      setLocationError(error.message);
    }
  }, []);

  const handleCapturePhoto = useCallback(
    async (event) => {
      const currentLocation = await fetchLocation();
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const datetime = new Date().toLocaleString();
            const locationText = currentLocation
              ? `${currentLocation.latitude.toFixed(
                  6
                )}, ${currentLocation.longitude.toFixed(6)}`
              : "Location unavailable";

            const fontSize = Math.max(16, img.width * 0.03);
            ctx.font = `${fontSize}px Arial`;

            ctx.shadowColor = "black";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            const padding = 20;
            const lineHeight = fontSize * 1.2;
            const locationY = img.height - padding;
            const datetimeY = locationY - lineHeight;
            const textX = padding;

            ctx.fillStyle = "white";
            ctx.fillText(datetime, textX, datetimeY);
            ctx.fillText(locationText, textX, locationY);

            const dataUrl = canvas.toDataURL("image/jpeg");
            setCapturedPhotos((prev) => [...prev, dataUrl]);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    [fetchLocation]
  );

  const uploadPDF = useCallback(
    async (pdf) => {
      setLoading(true);
      try {
        await caseService.uploadCasepdf(caseId, activeTab, pdf);
        alert("PDF uploaded successfully!");
        setCapturedPhotos([]); // Reset photos
        onUploadSuccess(); // Close the modal from the parent
      } catch (error) {
        console.error("Error uploading PDF:", error);
      } finally {
        setLoading(false);
      }
    },
    [caseService, caseId, activeTab, onUploadSuccess]
  );

  const generateCollageAndPDF = useCallback(async () => {
    if (capturedPhotos.length === 0) {
      alert("No photos captured to create a collage!");
      return;
    }

    const A4_WIDTH = 595;
    const A4_HEIGHT = 842;
    const padding = 10;
    const cols = 2;
    const photoWidth = (A4_WIDTH - padding * (cols + 1)) / cols;
    const rows = Math.floor((A4_HEIGHT - padding) / (photoWidth + padding));
    const imagesPerPage = rows * cols;

    const pdf = new jsPDF("portrait", "px", [A4_WIDTH, A4_HEIGHT]);

    for (
      let page = 0;
      page < Math.ceil(capturedPhotos.length / imagesPerPage);
      page++
    ) {
      if (page > 0) {
        pdf.addPage();
      }

      const startIndex = page * imagesPerPage;
      const endIndex = Math.min(
        startIndex + imagesPerPage,
        capturedPhotos.length
      );

      for (let i = startIndex; i < endIndex; i++) {
        const img = new Image();
        img.src = capturedPhotos[i];

        await new Promise((resolve) => {
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const adjustedHeight = photoWidth / aspectRatio;

            const indexOnPage = i - startIndex;
            const x = padding + (indexOnPage % cols) * (photoWidth + padding);
            const y =
              padding +
              Math.floor(indexOnPage / cols) * (adjustedHeight + padding);

            pdf.addImage(img, "JPEG", x, y, photoWidth, adjustedHeight);
            resolve();
          };
        });
      }
    }

    uploadPDF(pdf);
  }, [capturedPhotos, uploadPDF]);

  const handleRemovePhoto = useCallback((index) => {
    setCapturedPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  }, []);

  return {
    capturedPhotos,
    handleCapturePhoto,
    generateCollageAndPDF,
    handleRemovePhoto,
    locationError,
    loading1,
  };
};

const CollageModal = ({
  isOpen,
  onClose,
  photos,
  onRemovePhoto,
  onUploadPdf,
  loading,
}) => {
  const collageRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const breakpointColumnsObj = {
    default: 2,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-[794px] w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Photo Collage</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div ref={collageRef} className="max-w-[794px] p-2">
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex w-auto"
                columnClassName="bg-clip-padding px-2"
              >
                {photos.map((photo, index) => (
                  <div key={index} className="mb-4 relative">
                    <img
                      src={photo}
                      alt={`Captured ${index + 1}`}
                      className="w-full h-auto object-cover"
                    />
                    <button
                      onClick={() => onRemovePhoto(index)}
                      className="remove-photo-btn absolute top-2 right-2 bg-red-500 bg-opacity-50 text-white p-2 rounded-full shadow-md hover:bg-opacity-75 transition-colors duration-200"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </Masonry>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                id="download-btn"
                onClick={onUploadPdf}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
                disabled={loading}
              >
                Upload PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, children }) => (
  <button
    className={`px-4 py-2 rounded-md ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const RenderField = ({ field, onFieldChange, formValues, isDisabled }) => {
  const { type, label, options, props, id } = field;

  const handleChange = (event) => {
    onFieldChange(id, event.target.value, type);
  };

  // Ensure `disabled` is set if `props.disabled` is present; otherwise, use `isDisabled`
  const disabled = props?.disabled ?? isDisabled;

  const inputClasses =
    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === "input" && (
        <input
          {...props}
          value={formValues[id] || ""}
          onChange={handleChange}
          disabled={disabled}
          className={inputClasses}
        />
      )}
      {type === "textarea" && (
        <textarea
          {...props}
          value={formValues[id] || ""}
          onChange={handleChange}
          disabled={disabled}
          className={inputClasses}
        />
      )}
      {type === "radio" && (
        <div className="flex items-center space-x-4">
          {options.map((option) => (
            <label key={option.value} className="inline-flex items-center">
              <input
                type="radio"
                name={label.replace(/\s+/g, "_")}
                value={option.value}
                checked={formValues[id] === option.value}
                onChange={handleChange}
                disabled={disabled}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">{option.label}</span>
            </label>
          ))}
        </div>
      )}
      {type === "select" && (
        <select
          {...props}
          value={formValues[id] || ""}
          onChange={handleChange}
          className={`${inputClasses} bg-white`}
          disabled={disabled}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

const FileInput = ({
  files,
  onFileChange,
  onFileNameChange,
  onRemoveFile,
  onPreviewFile,
  onCapturePhoto,
}) => (
  <>
    <div className="">
      <label className="text-xl font-semibold text-gray-800 mb-2 ">Files</label>
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
        <label
          htmlFor="capturePhoto"
          className={`cursor-pointer ml-3 px-3 py-2 border rounded-md text-gray-600 bg-gray-100 transition duration-300 hover:bg-gray-200 text-center`}
        >
          Take Photo
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onCapturePhoto}
          className="hidden"
          id="capturePhoto"
        />
      </div>
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

const Hooks = {
  usePhotoCaptureAndPDF,
  TabButton,
  RenderField,
  FileInput,
  CollageModal,
};

export default Hooks;
