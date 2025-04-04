require("dotenv").config();
const { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const XLSX = require("xlsx");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Initialize the S3 client
const s3Client = new S3Client({ region: process.env.REGION });

/**
 * Uploads multiple documents to an S3 bucket under a specific case and section.
 * @param {Array} files - Array of file objects to upload.
 * @param {string} section - The section where files will be stored.
 * @param {string} caseId - The case ID for organizing files.
 * @returns {Promise<Array>} - Array of responses from the S3 upload.
 */
const uploadDocs = async (filenames, section, caseId) => {
    try {
        const urls = {};

        for (const filename of filenames) {
            const key = `${caseId}/${section}/${filename}`;

            // Create a command for uploading the object
            const command = new PutObjectCommand({
                Bucket: process.env.DOCS_BUCKET_NAME,
                Key: key,
                ContentType: "application/octet-stream", // You can change this based on file type
            });

            // Generate a pre-signed URL with a 5-minute expiration
            const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

            urls[filename] = presignedUrl;
        }

        return urls;
    } catch (error) {
        console.error("Error generating pre-signed URLs:", error.message);
        throw new Error("Failed to generate pre-signed URLs.");
    }
};

/**
 * Generates an Excel file from a list of cases and returns it as a buffer.
 * @param {Array} cases - List of cases to include in the Excel file.
 * @returns {Buffer} - The Excel file in buffer format.
 */
const downloadExcelFile = async (cases) => {
    try {
        // Format the data for the CSV file
        const formattedData = cases.map((caseItem) => {
            const flatItem = {};
            for (const key in caseItem) {
                flatItem[key] =
                    typeof caseItem[key] === "object" ? JSON.stringify(caseItem[key]) : caseItem[key];
            }
            return flatItem;
        });

        // Create a worksheet and convert it to CSV
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);

        // Return the CSV content as a string
        return csvContent;
    } catch (error) {
        console.error("Error generating CSV file:", error.message);
        throw new Error("Failed to generate CSV file.");
    }
};

// const createCaseZip = async (caseId) => {
//     try {
//         const folderName = `${caseId}/`;
//         const bucketName = process.env.DOCS_BUCKET_NAME;
//         const zipBucketName = process.env.ZIP_BUCKET_NAME || bucketName;
//         const zipFileName = `${caseId}_documents.zip`;
//         const zipFileKey = `zipped/${zipFileName}`;

//         // List objects in the folder
//         const listCommand = new ListObjectsCommand({
//             Bucket: bucketName,
//             Prefix: folderName,
//         });
//         const listResponse = await s3Client.send(listCommand);

//         if (!listResponse.Contents || listResponse.Contents.length === 0) {
//             console.log(`No files found for caseId: ${caseId}, skipping zip process.`);
//             return;
//         }

//         // Create zip archive and a stream
//         console.log(`Creating zip for caseId: ${caseId}`);
//         const archive = archiver("zip", { zlib: { level: 9 } });
//         const passThrough = new PassThrough();

//         // Start uploading stream to S3
//         const upload = new Upload({
//             client: s3Client,
//             params: {
//                 Bucket: zipBucketName,
//                 Key: zipFileKey,
//                 Body: passThrough,
//                 ContentType: "application/zip",
//             },
//         });

//         archive.pipe(passThrough);

//         for (const item of listResponse.Contents) {
//             const fileKey = item.Key;
//             if (fileKey.endsWith("/")) continue;

//             const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });
//             const response = await s3Client.send(getCommand);

//             archive.append(response.Body, { name: fileKey.replace(folderName, "") });
//         }

//         await Promise.all([archive.finalize(), upload.done()]);
//         console.log(`Zip created successfully for caseId: ${caseId}`);

//     } catch (error) {
//         console.error(`Error creating zip for caseId: ${caseId}:`, error.message);
//     }
// };

const generateDownloadPresignedUrl = async (caseId) => {
    try {
        const zipFileKey = `zipped/${caseId}_documents.zip`;

        // Check if the file exists in S3
        await s3Client.send(
            new HeadObjectCommand({
                Bucket: process.env.DOCS_BUCKET_NAME,
                Key: zipFileKey,
            })
        );

        // If file exists, generate presigned URL
        const presignedUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: process.env.DOCS_BUCKET_NAME,
                Key: zipFileKey,
            }),
            { expiresIn: 120 } // 2 minutes validity
        );

        return presignedUrl;
    } catch (error) {
        if (error.name === "NotFound") {
            return "No files to download.";
        }
        console.error("Error generating presigned URL:", error.message);
        throw new Error("Failed to generate presigned URL.");
    }
};


module.exports = {
    uploadDocs,
    downloadExcelFile,
    generateDownloadPresignedUrl,
};
