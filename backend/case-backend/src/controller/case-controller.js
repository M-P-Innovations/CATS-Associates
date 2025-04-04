const caseService = require('../service/case-service');
const { section_details } = require('./module/sections_details')
require('dotenv').config();
const Logger = require(process.env.DEPENDENCY_PATH + 'logger.js');


exports.getCaseDetails = async (req, res) => {
  const { caseId } = req.body;
  const { activeTab } = req.body;
  const { username } = req.query
  const logger = new Logger(username, caseId);
  try {
    var fieldsToList = section_details[activeTab]
      .filter(detail => detail.id) // Filter out empty values
      .map(detail => detail.id) // Extract the `id` values
      .join(',') // Join them with a comma
    if (fieldsToList.endsWith(',')) {
      fieldsToList = fieldsToList.slice(0, -1); // Remove the last character
    }
    const additionalFields = ['claim_no', 'fos', 'case_title', 'ir_status', 'fosAssignments', 'commentsList'];
    additionalFields.forEach(field => {
      if (!fieldsToList.includes(field)) {
        fieldsToList += `,${field}`;
      }
    });
    console.log(fieldsToList);

    // Fetch the case details
    const case_details = await caseService.getCase(caseId, fieldsToList);

    // if (process.env.LOGGER_ENABLED == "true") await logger.info(`Viewed Case`); // logger-line
    res.status(200).json(case_details);
  } catch (error) {
    console.log(error);
    if (process.env.LOGGER_ENABLED == "true") await logger.error(`Unable to View Case`);
    res.status(503).json({
      message: `Unable to View Case : ${error}`
    });
  }
};

exports.listCases = async (req, res) => {
  var { username, role, caseId, fieldName, fieldValue } = req.query
  const logger = new Logger(username, caseId);
  const user = { username: username, role: role }

  try {
    if (typeof fieldName === 'string' && typeof fieldValue === 'string') {
      fieldName = fieldName.replace('[', '').replace(']', '').split(',')
      fieldValue = fieldValue.replace('[', '').replace(']', '').split(',')
    }
    const filter = { fieldName: fieldName, fieldValue: fieldValue }
    console.log(filter);
    const fieldsToList = 'caseId, claim_no, doa, case_type, case_title, insurer, registration_date, ir_status, fosAssignments, policy_no' // Replace with your required field names
    const cases = await caseService.listCasesWithFilter(user, filter, fieldsToList);
    res.status(200).json(cases);
  } catch (error) {
    console.log(error);
    if (process.env.LOGGER_ENABLED == "true") await logger.error(`Failed to list Cases`);
    res.status(503).json({
      message: `Failed to list Cases : ${error}`
    });
  }
};


exports.getForm = async (req, res) => {
  const { caseId } = req.body
  const { username, form } = req.query
  const logger = new Logger(username, caseId);

  //RTI form 
  if (form == "rti_form") {
    try {
      const RTIForm = await caseService.createRTIForm(caseId);
      if (process.env.LOGGER_ENABLED == "true") await logger.info(`RTI Form Generated`);
      res.status(200).json(RTIForm);
    } catch (error) {
      console.log(error);
      if (process.env.LOGGER_ENABLED == "true") await logger.error(`Error while generating RTI Form`);
      res.status(503).json({
        message: `Error while generating RTI Form : ${error}`
      });
    }
  }

  // Case form
  else if (form == "court_form") {
    try {
      const CourtForm = await caseService.createCourtForm(caseId);
      if (process.env.LOGGER_ENABLED == "true") await logger.info(`Court Form Generated`);
      res.status(200).json(CourtForm);
    } catch (error) {
      console.log(error);
      if (process.env.LOGGER_ENABLED == "true") await logger.error(`Error while generating Court Form`);
      res.status(503).json({
        message: `Error while generating Court Form : ${error}`
      });
    }
  }

  else {
    console.log(error)
    if (process.env.LOGGER_ENABLED == "true") await logger.warn(`Form can be of type rti_form or court_form only`)
    res.status(503).json({
      message: `Form can be of type rti_form or court_form only`
    });
  }
}

exports.updateCase = async (req, res) => {
  const { username, role, caseId ,claim_no} = req.query;
  let { sectionData } = req.body;
  const logger = new Logger(username, caseId);
  try {
    // Role authorization check
    if (role !== "Admin" && role !== "BOF") {
      return res.status(401).json({
        message: "User is not authorized to update fields",
      });
    }

    // Ensure sectionData is parsed to an object if it's a string
    if (typeof sectionData === "string") {
      sectionData = JSON.parse(sectionData);
    }
    console.log(sectionData);
    // Update the case details
    const updatedCase = await caseService.updateCaseDetails(caseId, claim_no,sectionData);
    res.status(200).json(updatedCase);
    if (process.env.LOGGER_ENABLED === "true") {
      const updatedFields = Object.keys(sectionData).map(key => key.replace(/_/g, ' ')).join(', ');
      await logger.info(`Updated Case Fields: ${updatedFields}`);
    }
  } catch (error) {
    console.error(error);

    // Log error if enabled
    if (process.env.LOGGER_ENABLED === "true") {
      await logger.error(`Error while updating Case Fields`);
    }

    res.status(503).json({
      message: `Error while updating Case Fields: ${error}`,
    });
  }
};
