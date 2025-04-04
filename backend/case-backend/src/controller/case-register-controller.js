const bcrypt = require("bcryptjs");
const caseService = require("../service/case-service");
const idGenerator = require("../utils/generate-id");
require("dotenv").config();
const documentService = require("../service/document-service");
const Logger = require(process.env.DEPENDENCY_PATH + "logger.js");

exports.registerCase = async (req, res) => {
  const { username } = req.query;
  const {
    date_of_loss,
    petitioners,
    petitioner_address,
    petitioner_district,
    petitioner_tehsil,
    insured,
    insured_address,
    insured_district,
    insured_tehsil,
    driver,
    loss_location,
    driver_address,
    driver_district,
    driver_tehsil,
    insurer,
    state,
    email_id,
    assigned_by,
    case_type,
    claim_no,
    ir_status,
    task,
    mact_cl,
    mact_case_no,
    policy_no,
    dl_no,
    iv_no,
    iv_type,
    product_code,
    type_of_loss,
    injured_name,
    doa,
    fir_no,
    fir_date,
    police_station,
    delayInFir,
    police_station_address,
    police_station_district,
    police_station_tehsil,
    petitionerStatus,
    insuredStatus,
    driverStatus,
    petitionerJustification,
    insuredJustification,
    driverJustification,
    claim_amount,
    claim_filled_us,
    policy_start_date,
    policy_end_date,
    fosAssignments,
  } = req.body;

  try {
    console.log(username);
    const user = { username: username, role: "" };
    const filter_params = {
      fieldName: "claim_no",
      fieldValue: claim_no,
    };
    const caseId = idGenerator.generateUniqueIdWithPrefix("Case-");
    const registration_date = new Date().toISOString().slice(0, 16);
    let caseTitle = petitioners && petitioners.length > 0 && petitioners !== "[object Object]"
      ? `${petitioners.split(',')[0]} vs ${req.body.insured}` 
      : req.body.insured;
     const case_title = caseTitle;
     console.log(case_title);
    // Check if the case already exists in DynamoDB
    const dynamoCase = await caseService.listCasesWithFilter(
      user,
      filter_params
    );

    if (dynamoCase && Object.keys(dynamoCase).length > 0) {
      return res.status(503).json({
        message: "Cannot Register this case : Claim number Already Exist",
      });
    } else {
      const reg_case = {
        caseId: caseId,
        registration_date: registration_date,
        case_title: case_title,
        // Fields from registration page
        date_of_loss: date_of_loss,
        petitioners: JSON.stringify(petitioners),
        petitioner_address: petitioner_address,
        petitioner_district: petitioner_district,
        petitioner_tehsil: petitioner_tehsil,
        insured: insured,
        insured_address: insured_address,
        insured_district: insured_district,
        insured_tehsil: insured_tehsil,
        driver: driver,
        driver_address: driver_address,
        driver_district: driver_district,
        driver_tehsil: driver_tehsil,
        insurer: insurer,
        state: state,
        email_id: email_id,
        assigned_by: assigned_by,
        case_type: case_type,
        claim_no: claim_no,
        ir_status: ir_status,
        task: task,
        mact_cl: mact_cl,
        mact_case_no: mact_case_no,
        policy_no: policy_no,
        dl_no: dl_no,
        iv_no: iv_no,
        iv_type: iv_type,
        product_code: product_code,
        type_of_loss: type_of_loss,
        injured_name: injured_name,
        doa: doa,
        fir_no: fir_no,
        fir_date: fir_date,
        police_station: police_station,
        delayInFir: delayInFir,
        police_station_address: police_station_address,
        police_station_district: police_station_district,
        police_station_tehsil: police_station_tehsil,
        petitionerStatus: petitionerStatus,
        insuredStatus: insuredStatus,
        driverStatus: driverStatus,
        petitionerJustification: petitionerJustification,
        insuredJustification: insuredJustification,
        driverJustification: driverJustification,
        loss_location: loss_location,
        claim_amount: claim_amount,
        claim_filled_us: claim_filled_us,
        policy_start_date: policy_start_date,
        policy_end_date: policy_end_date,
        // fosAssignments: fosAssignments,
      };
      console.log(reg_case);
      const logger = new Logger(username, caseId);

      const saveUserResponse = await caseService.createCase(reg_case);
      if (!saveUserResponse) {
        if (process.env.LOGGER_ENABLED == "true")
          await logger.error(
            `Unable to Register : ` + saveUserResponse.message
          );
        return res.status(503).json({
          message: `Unable to Register : ` + saveUserResponse.message,
        });
      }
      if (process.env.LOGGER_ENABLED == "true")
        await logger.info(`Case Registered successfully`);
      res.json(caseId);
    }
  } catch (error) {
    console.log(error);
    if (process.env.LOGGER_ENABLED == "true")
      await Logger.error(`Error While Registering Case: ${error}`);
    res.status(503).json({
      message: `Error While Registering Case: ${error}`,
    });
  }
};
