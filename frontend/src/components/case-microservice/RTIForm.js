import React, { useCallback, useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import caseService from "../../services/case-service"; // Assuming you have a service to fetch case details
import Spinner from "../../common/Spinner";
import "../../common/Common.css";
import { BsTranslate } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from "axios";
import RTIStamp from "../../common/assets/images/RTI-stamp.jpeg";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RTIForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useSelector((state) => state.auth);
    const contentRef = useRef();
    const [inputVisible, setInputVisible] = useState(false); // Toggle input visibility
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [RTI, setRTI] = useState("");
    const inputRef = useRef(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showCopiedPopup, setShowCopiedPopup] = useState(false); // For showing copied popup
    const { caseId } = useParams();

    // Fetch data only once when component mounts
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await caseService.getRTIForm(caseId);
                if (isMounted) {
                    setRTI(response.data);
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    setLoading(false);
                    setErrorMessage(error.message || "Failed to fetch case details.");
                    setShowError(true);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Clean up to avoid memory leaks
        };
    }, [caseId]); // Empty array ensures the effect runs only once on mount

    // Fetch suggestions when input value changes
    useEffect(() => {
        if (inputValue) {
            const fetchSuggestions = async () => {
                try {
                    const response = await axios.get(
                        `https://inputtools.google.com/request?text=${inputValue}&itc=mr-t-i0-und&num=13&cp=0&cs=1&ie=utf-8&oe=utf-8`
                    );
                    const data = response.data;
                    if (data[0] === 'SUCCESS') {
                        setSuggestions(data[1][0][1]); // List of suggestions
                    }
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]); // Clear suggestions when input is empty
        }
    }, [inputValue]);

    // Handle input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        setSuggestions([]);
    };

    // Copy text to clipboard
    const handleCopyClick = () => {
        navigator.clipboard.writeText(inputValue);

        // Show the copied popup
        setShowCopiedPopup(true);

        // Hide the popup after 2 seconds
        setTimeout(() => {
            setShowCopiedPopup(false);
        }, 2000);
    };

    // Hide input box when clicking outside
    const handleOutsideClick = useCallback((e) => {
        if (inputVisible && inputRef.current && !inputRef.current.contains(e.target)) {
            setInputVisible(false);
        }
    }, [inputVisible]);

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    // PDF download logic
    const downloadPDF = () => {
        const content = contentRef.current;

        // Hide the buttons before taking the screenshot
        const downloadButton = document.getElementById("download-btn");
        const textboxButton = document.getElementById("textbox-btn");

        // Temporarily hide the buttons
        downloadButton.style.visibility = "hidden";
        textboxButton.style.visibility = "hidden";

        // Create a new iframe to handle the print
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        // Write the content to the iframe
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`<html><head><title>${caseId}</title></head><body>`);
        doc.write(content.innerHTML);
        doc.write('</body></html>');
        doc.close();

        // Wait for the iframe content to load, then print and remove the iframe
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Fallback to restore buttons after print
        const restoreButtons = () => {
            // Restore the buttons after printing
            downloadButton.style.visibility = "visible";
            textboxButton.style.visibility = "visible";
            
            // Remove the iframe
            document.body.removeChild(iframe);
        };

        // Ensure the buttons are restored after printing (works across all cases)
        iframe.contentWindow.onafterprint = restoreButtons;

        // Fallback in case onafterprint doesn't trigger
        setTimeout(restoreButtons, 500); // Adjust the timeout as needed
    };

    const handleBackClick = () => {
        navigate(-1); // This navigates to the previous page in history
      };

    if (!currentUser) {
        return <Navigate to="/login" />;
    } else if (currentUser.user.user_role !== "Admin") {
        return (
            <div className="alert alert-danger" role="alert">
                Access Denied: Admins Only
            </div>
        );
    }

    const multilineText = `
        <img src=${RTIStamp} alt="" style="float: right; height: 100px; width: 200px;"/>
        ${RTI}`;

    return (
        <Container className="main-card mb-4" style={{ width: '800px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
                onClick={handleBackClick}
                className="form-back-btn"
            >
                ← Back
            </button>
            {loading ? (
                <Spinner />
            ) : (
                <div ref={contentRef} className="card shadow-lg p-4 mb-4" style={{ width: '800px', height: 'auto', overflow: 'hidden' }}>
                    {/* RTI Form */}
                    <div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: multilineText }} />
                    {/* TextBox */}
                    <div id="textbox-btn">
                        {!inputVisible && (
                            <button
                                onClick={() => setInputVisible(!inputVisible)}
                                style={{
                                    position: 'fixed',
                                    top: '14%',
                                    right: '20px',
                                    width: '45px',  // Ensure width and height are equal for a circle
                                    height: '45px',
                                    cursor: 'pointer',
                                    borderRadius: '50%',  // Circular shape
                                    backgroundColor: '#f5f5f6',  // Off-white background
                                    border: '1px solid ',
                                    zIndex: 1000,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '20px'
                                }}
                            >
                            <BsTranslate/>
                            </button>
                        )}

                        {inputVisible && (
                            <div
                                ref={inputRef}
                                className="input-container shadow-lg p-2"
                                style={{
                                    position: 'fixed',
                                    top: '14%',
                                    right: '20px',
                                    zIndex: 1000,
                                    width: '300px',
                                    backgroundColor: 'whitesmoke'
                                }}
                            >
                                {/* Copied! Popup */}
                                {showCopiedPopup && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '-30px',
                                            right: '10px',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '5px',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Copied!
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        placeholder="Type your words..."
                                        style={{ width: '85%', padding: '5px', fontSize: '14px' }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCopyClick}
                                        style={{
                                            marginLeft: '5px',
                                            padding: '5px',
                                            borderRadius: '10%',
                                            backgroundColor: '#D3D3D3',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            width: '15%',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>📋</span>
                                    </button>
                                </div>

                                {suggestions.length > 0 && (
                                    <ul
                                        style={{
                                            listStyleType: 'none',
                                            padding: '0',
                                            marginTop: '5px',
                                            border: '1px solid #ccc',
                                            width: '100%',
                                            zIndex: 2000,
                                            backgroundColor: '#fff',
                                            position: 'absolute',
                                            top: '40px',
                                            left: '0px',
                                        }}
                                    >
                                        {suggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                style={{
                                                    padding: '5px',
                                                    cursor: 'pointer',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Download Buttons */}
                    <div className="col-12 text-center mt-2 mb-4">
                        <button type="button" id="download-btn" className="btn btn-primary btn-sm" onClick={downloadPDF}>Download RTI</button>
                    </div>
                </div>
            )}
            {showError && (
                <ErrorDialogBox message={errorMessage} onClose={() => setShowError(false)} />
            )}
        </Container>
    );
};

export default RTIForm;
