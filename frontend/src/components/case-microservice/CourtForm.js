import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import caseService from "../../services/case-service"; // Assuming you have a service to fetch case details
import Spinner from "../../common/Spinner";
import "../../common/Common.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import ErrorDialogBox from "../../common/ErrorDialogBox";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CourtForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useSelector((state) => state.auth);
    const contentRef = useRef();
    const [FORM, setFORM] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const { caseId } = useParams();

    // Fetch data only once when component mounts
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await caseService.getCourtForm(caseId);
                if (isMounted) {
                    setFORM(response.data);
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

    // PDF download logic
    const downloadPDF = () => {
        const content = contentRef.current;

        // Hide the buttons before taking the screenshot
        const downloadButton = document.getElementById("download-btn");

        // Temporarily hide the buttons
        downloadButton.style.visibility = "hidden";

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
        ${FORM}`;

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
                    {/* Court Form */}
                    <div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: multilineText }} />

                    {/* Download Buttons */}
                    <div className="col-12 text-center mt-2 mb-4">
                        <button type="button" id="download-btn" className="btn btn-primary btn-sm" onClick={downloadPDF}>Download Court Form</button>
                    </div>
                </div>
            )}
            {showError && (
                <ErrorDialogBox message={errorMessage} onClose={() => setShowError(false)} />
            )}
        </Container>
    );
};

export default CourtForm;
