const documentService = require('../service/document-service');
const caseService = require('../service/case-service');
const { error } = require('pdf-lib');
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
require('dotenv').config();
const { sendEmail } = require("../utils/mail-sender");
const Logger = require(process.env.DEPENDENCY_PATH + 'logger.js');

exports.uploadDocuments = async (req, res) => {
  // const files = req.files
  const { username, caseId, section ,claim_no} = req.query
  const { filenames } = req.body;
  const logger = new Logger(username, caseId);
  try {
    console.log("filenames:- ", filenames);
    if (!section) {
      return res.status(400).json({ message: "Section not provided" });
    }
    const upload = await documentService.uploadDocs(filenames, section, caseId);

    if (process.env.LOGGER_ENABLED == "true") await logger.info(`Documents Uploaded successfully`); // logger-line
    res.status(200).json({ data: upload });
    const sender = "no-reply@mark-associates.com";
    const receiver = "pjpbolt@gmail.com";
    const subject = `Documents Uploaded for ${claim_no}`;
    const formatText = (text) => {
      return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    };

    const body = `
      <p>${formatText(username)} has successfully uploaded documents for ${claim_no} to the section: <strong>${formatText(section)}</strong>.</p>
    `;

    await sendEmail(sender, receiver, subject, body);

  } catch (error) {
    console.log(error);
    if (process.env.LOGGER_ENABLED == "true") await logger.error(`Unable to upload documents`);
    res.status(503).json({
      message: `Unable to generate url: ${error}`
    });
  }
};

exports.createZipFile = async (req, res) => {

  const { username, caseId } = req.query;
  const logger = new Logger(username, caseId);

  // Send immediate response
  res.status(200).json({ message: "Creating zip file for the case" });

  try {
    const lambdaClient = new LambdaClient({ region: process.env.REGION });

    // Invoke new Lambda asynchronously
    const invokeCommand = new InvokeCommand({
      FunctionName: process.env.ZIP_PROCESSOR_LAMBDA, // Set in ENV
      InvocationType: "Event", // Async call
      Payload: JSON.stringify({ caseId }),
    });

    await lambdaClient.send(invokeCommand);
    console.log(`🚀 Zip process triggered for caseId: ${caseId}`);

  } catch (error) {
    console.error("🚨 Error invoking zip processor:", error);
    if (process.env.LOGGER_ENABLED == "true") {
      await logger.error("Failed to trigger zip process.");
    }
  }
};

exports.downloadDocuments = async (req, res) => {
  const { username, role, caseId, fieldName, fieldValue, download_all } = req.query
  const logger = new Logger(username, caseId);
  const user = { username: username, role: role }
  var filter = { fieldName: fieldName, fieldValue: fieldValue }
  if (fieldName && fieldValue) {
    try {
      if (fieldValue == "all_cases") {
        filter.fieldValue = "";
      }
      const cases = await caseService.listCasesWithFilter(user, filter);
      if (cases.length === 0) {
        console.log('No cases found to download.');
        res.status(200).json('No cases found to download.');
      }
      const excelBuffer = await documentService.downloadExcelFile(cases);
      const filename = `cases_${new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]}.csv`;

      // Set headers and send the file as a response
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(excelBuffer));

    } catch (error) {
      console.log(error);
      if (process.env.LOGGER_ENABLED == "true") await logger.error(`Unable to download table data`);
      res.status(503).json({
        message: `Unable to download table data : ${error}`
      });
    }
  } else if (download_all) {
    try {
      const presignedUrl = await documentService.generateDownloadPresignedUrl(caseId);

      if (process.env.LOGGER_ENABLED == "true")
        await logger.info(`Presigned URL generated successfully`);

      if (presignedUrl === "No files to download.") {
        console.log("No files to download.");
        return res.status(404).json({ message: "No files to download." });
      }

      res.status(200).json({ presignedUrl });
    } catch (error) {
      console.error(error);

      if (process.env.LOGGER_ENABLED == "true")
        await logger.error(`Unable to generate presigned URL`);

      res.status(503).json({
        message: `Unable to generate presigned URL: ${error.message}`,
      });
    }
  }
  else {
    res.status(400).json({ message: "Invalid request, Please Provide correct option to download" });
  }
};