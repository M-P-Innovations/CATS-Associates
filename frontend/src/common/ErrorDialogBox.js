import React from "react";

const ErrorDialogBox = ({ message, onClose }) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-sm w-full z-10">
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-red-500">Error</h2>
                    <p className="mt-2 text-gray-700">{message}</p>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ErrorDialogBox;