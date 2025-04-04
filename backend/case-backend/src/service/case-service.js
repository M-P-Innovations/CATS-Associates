const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand, ScanCommand, BatchGetItemCommand, BatchWriteItemCommand, Select } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { translateToMarathi } = require('../utils/marathi-translator');
const { generateRTIForm } = require('../utils/generate-rti-form');
const { generateCourtForm } = require('../utils/generate-case-form');
const { sendEmail } = require('../utils/mail-sender');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const caseTable = process.env.DYNAMODB_NAME;
const userTable = process.env.USER_DYNAMODB_NAME;
const logTable = process.env.LOGGING_TABLE;


const getCase = async (caseId, fieldsToGet) => {
  const params = {
    TableName: caseTable,
    Key: marshall({ caseId })
  };

  if (fieldsToGet) {
    // Add filter expression and its attributes
    params.ProjectionExpression = fieldsToGet;
  }

  try {
    const { Item } = await dynamodbClient.send(new GetItemCommand(params));
    return unmarshall(Item);
  } catch (error) {
    console.error('There is an error getting case: ', error);
    throw new Error(error);
  }
};

/**
 * Lists cases with a filter based on the user's role and provided filter criteria.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} user.role - The role of the user (e.g., "FOS").
 * @param {string} user.username - The username of the user.
 * @param {Object} filter - The filter object containing field name and value.
 * @param {string|string[]} filter.fieldName - The field name(s) to filter by.
 * @param {string|string[]} filter.fieldValue - The field value(s) to filter by.
 * @param {string} fieldsToList - The fields to list in the response.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of case objects.
 * @throws {Error} - Throws an error if there is an issue fetching the cases.
 */
const listCasesWithFilter = async (user, filter, fieldsToList) => {
  try {
    // If the user is an FOS (Field Officer), fetch only their assigned cases
    if (user.role === "FOS") {
      const params = {
        TableName: userTable,
        Key: marshall({ username: user.username })
      };

      // Fetch user details from DynamoDB
      const { Item } = await dynamodbClient.send(new GetItemCommand(params));
      const userItem = unmarshall(Item);
      const { cases } = userItem;

      // Extract case IDs assigned to the user
      const caseIds = cases.map(caseItem => caseItem.caseId);

      // Split caseIds into batches of 100 (DynamoDB batch limits)
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < caseIds.length; i += batchSize) {
        batches.push(caseIds.slice(i, i + batchSize));
      }

      let results = [];

      // Process each batch of case IDs
      for (const batch of batches) {
        const params = {
          RequestItems: {
            [caseTable]: {
              Keys: batch.map((caseId) => ({ caseId: { S: caseId } })),
            },
          },
        };

        try {
          const command = new BatchGetItemCommand(params);
          const response = await dynamodbClient.send(command);

          if (response.Responses && response.Responses[caseTable]) {
            // Convert DynamoDB format to JSON
            results = results.concat(response.Responses[caseTable].map(unmarshall));
          }

          // Handle any unprocessed items (retry logic)
          let unprocessedKeys = response.UnprocessedKeys;
          while (unprocessedKeys && Object.keys(unprocessedKeys).length > 0) {
            const retryParams = { RequestItems: unprocessedKeys };
            const retryCommand = new BatchGetItemCommand(retryParams);
            const retryResponse = await dynamodbClient.send(retryCommand);

            if (retryResponse.Responses && retryResponse.Responses[caseTable]) {
              results = results.concat(retryResponse.Responses[caseTable].map(unmarshall));
            }

            unprocessedKeys = retryResponse.UnprocessedKeys;
          }
        } catch (error) {
          console.error("Error fetching cases:", error);
        }
      }

      return results;
    } else {
      // If the user is not an FOS, apply filters to fetch cases
      let { fieldName, fieldValue } = filter;

      // Ensure fieldName and fieldValue are arrays for consistency
      if (fieldName && !Array.isArray(fieldName)) { fieldName = [fieldName]; }
      if (fieldValue && !Array.isArray(fieldValue)) { fieldValue = [fieldValue]; }

      const params = {
        TableName: caseTable,
        ProjectionExpression: fieldsToList, // Specify fields to retrieve
      };

      // Apply filter conditions if field names and values are provided
      if (fieldName && fieldValue && fieldName.length > 0 && fieldValue.length > 0) {
        if (fieldName.length !== fieldValue.length) {
          throw new Error("fieldName and fieldValue must be arrays of the same length.");
        }

        let filterExpressions = [];
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};

        if (fieldName.includes("petitioner_district" || "petitioner_tehsil")) {
          filterExpressions.push("(#status = :status1 OR #status = :status2)");
          expressionAttributeNames["#status"] = "ir_status";
          expressionAttributeValues[":status1"] = { S: "under_investigation" };
          expressionAttributeValues[":status2"] = { S: "further_investigation" };
        }

        // Construct filter expressions dynamically
        fieldName.forEach((field, index) => {
          if (field) {
            const fieldPlaceholder = `#field${index}`;
            const valuePlaceholder = `:value${index}`;

            filterExpressions.push(`${fieldPlaceholder} = ${valuePlaceholder}`);
            expressionAttributeNames[fieldPlaceholder] = field;
            expressionAttributeValues[valuePlaceholder] = { S: fieldValue[index] };
          }
        });

        // Combine filter expressions
        if (filterExpressions.length > 0) {
          params.FilterExpression = filterExpressions.join(' AND ');
          params.ExpressionAttributeNames = expressionAttributeNames;
          params.ExpressionAttributeValues = expressionAttributeValues;
          if (fieldName.includes("petitioner_district" || "petitioner_tehsil")) {
            filterExpressions.push("(#status = :status1 OR #status = :status2)");
            expressionAttributeNames["#status"] = "ir_status";
            expressionAttributeValues[":status1"] = { S: "under_investigation" };
            expressionAttributeValues[":status2"] = { S: "further_investigation" };
          }
        }
      }

      const cases = [];
      let data;

      // Scan through DynamoDB table to retrieve filtered cases
      do {
        data = await dynamodbClient.send(new ScanCommand(params));
        data.Items.forEach(item => {
          cases.push(unmarshall(item));
        });
        params.ExclusiveStartKey = data.LastEvaluatedKey; // Handle pagination
      } while (data.LastEvaluatedKey);

      return cases;
    }
  } catch (error) {
    console.error('There was an error getting all cases: ', error);
    throw new Error(error);
  }
};



const createCase = async (reg_case) => {
  const params = {
    TableName: caseTable,
    Item: marshall(reg_case)
  };

  try {
    await dynamodbClient.send(new PutItemCommand(params));
    return true;
  } catch (error) {
    console.error('There is an error while creating a case: ', error);
    throw new Error(error);
  }
};

const createRTIForm = async (caseId) => {
  try {
    const fieldsToGet = "claim_no,insurer,police_station ,fir_no, fir_date";
    const data = await getCase(caseId, fieldsToGet);
    const { claim_no, insurer, ...dataToTranslate } = data;
    var current_date = new Date().toLocaleDateString('en-IN').replace(/\//g, '-')
    dataToTranslate.current_date = current_date;
    const translatedData = await translateToMarathi(dataToTranslate);
    translatedData.claim_no = claim_no;
    translatedData.insurer = insurer;
    const RTIForm = generateRTIForm(translatedData);
    return RTIForm;
  } catch (error) {
    console.error('There is an error while generating RTI Form: ', error);
    throw new Error(error);
  }
}

const createCourtForm = async (caseId) => {
  try {
    const fieldsToGet = "mact_cl,fosAssignments";
    const data = await getCase(caseId, fieldsToGet);
    // Take first user from fosAssignments
    const fos_username = data.fosAssignments[0].fos;
    // Fetch User details
    const userParams = {
      TableName: userTable,
      Key: marshall({ username: fos_username })
    };
    userParams.ProjectionExpression = "email, username, mobile_number, #name";
    userParams.ExpressionAttributeNames = { "#name": "name" };
    const { Item } = await dynamodbClient.send(new GetItemCommand(userParams));
    const user = unmarshall(Item);
    const courtFormData = {
      court_location: data.mact_cl,
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      current_date: new Date().toLocaleDateString('en-IN').replace(/\//g, '-')
    }
    const CourtForm = generateCourtForm(courtFormData);
    return CourtForm;
  } catch (error) {
    throw new Error(error);
  }
}

const dashboardCasesCount = async (user) => {
  try {
    const statusCount = {
      all_cases: 0,
      withdrawn: 0,
      case_submitted: 0,
      under_investigation: 0,
      further_investigation: 0,
      users: 0, // Initialize this field if it will always be part of the response
      closed: 0 // Initialize this field for 'closed' cases
    };

    // Set filter for non-admin users to only get cases assigned to the specified username
    if (user.role === "FOS") {
      const params = {
        TableName: userTable,
        Key: marshall({ username: user.username })
      };
      const { Item } = await dynamodbClient.send(new GetItemCommand(params));
      const userItem = unmarshall(Item);
      const { cases } = userItem;
      return { all_cases: cases.length };

    } else {
      // Total Case Count (all cases or filtered by fos for non-admin users)
      const totalCasesParams = {
        TableName: caseTable,
        Select: "COUNT"
      };
      const totalCasesData = await dynamodbClient.send(new ScanCommand(totalCasesParams));
      statusCount.all_cases = totalCasesData.Count;

      // Count cases for each specific status
      const caseStatuses = ["withdrawn", "case_submitted", "under_investigation", "further_investigation", "closed"];
      for (const status of caseStatuses) {
        const caseParams = {
          TableName: caseTable,
          FilterExpression: `#status = :statusValue`,
          ExpressionAttributeNames: { "#status": "ir_status" },// Adjust based on attribute name
          ExpressionAttributeValues: { ":statusValue": { S: status } },
          Select: "COUNT",
        };

        const caseData = await dynamodbClient.send(new ScanCommand(caseParams));
        statusCount[status] = caseData.Count;
      }

      // User Count (Admin only)
      if (user.role === "Admin") {
        const userParams = {
          TableName: userTable,
          Select: "COUNT",
        };
        const userData = await dynamodbClient.send(new ScanCommand(userParams));
        statusCount.users = userData.Count;
      }
      console.log(statusCount);

      return statusCount;
    }
  } catch (error) {
    throw new Error(`Error retrieving dashboard count: ${error.message}`);
  }
};


const updateCaseDetails = async (caseId, claim_no, sectionData) => {
  if (!sectionData || typeof sectionData !== 'object' || Object.keys(sectionData).length === 0) {
    throw new Error("sectionData must be a non-empty object.");
  }

  const updateParams = {
    TableName: caseTable,
    Key: marshall({ caseId }),
    UpdateExpression: "SET",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    ReturnValues: "UPDATED_NEW",
  };

  // Dynamically build the UpdateExpression, ExpressionAttributeNames, and ExpressionAttributeValues
  const updateExpressions = [];
  for (const [key, value] of Object.entries(sectionData)) {
    if (value !== undefined) {
      const attributeNamePlaceholder = `#${key}`;
      const valuePlaceholder = `:${key}`;
      updateExpressions.push(`${attributeNamePlaceholder} = ${valuePlaceholder}`);
      updateParams.ExpressionAttributeNames[attributeNamePlaceholder] = key;
      updateParams.ExpressionAttributeValues[valuePlaceholder] = value; // Directly assign the value
    }
  }

  if (updateExpressions.length === 0) {
    throw new Error("No valid fields to update.");
  }

  // Join all expressions and append to UpdateExpression
  updateParams.UpdateExpression += " " + updateExpressions.join(", ");

  // Marshall the ExpressionAttributeValues
  updateParams.ExpressionAttributeValues = marshall(updateParams.ExpressionAttributeValues);

  try {
    const data = await dynamodbClient.send(new UpdateItemCommand(updateParams));

    // Update the userTable if fosAssignments is present in sectionData
    if (sectionData.fosAssignments) {
      await updateUserTableAndSendEmail(sectionData, caseId, claim_no);
    }

    return data.Attributes ? unmarshall(data.Attributes) : null; // Return updated attributes if available
  } catch (error) {
    throw new Error(`Error updating Case Details: ${error.message}`);
  }
};


const updateUserTableAndSendEmail = async (sectionData, caseId, claim_no) => {
  const { fosAssignments } = sectionData;

  for (const fosAssignment of fosAssignments) {
    const { fos, tasks } = fosAssignment;
    const username = fos;

    // Get the user from the userTable
    const getUserParams = {
      TableName: userTable,
      Key: marshall({ username })
    };

    try {
      const { Item } = await dynamodbClient.send(new GetItemCommand(getUserParams));
      if (!Item) {
        console.error(`User with fos ${fos} not found`);
        continue;
      }
      const user = unmarshall(Item);
      // Check if the case already exists for the user
      let userCase = user.cases
        ? user.cases.find((c) => c.caseId === caseId)
        : null;

      if (!userCase) {
        // If the case does not exist, create a new case entry
        userCase = { caseId, tasks: [] };
        if (!user.cases) {
          user.cases = [];
        }
        user.cases.push(userCase);
      }
      // Update the user's cases and tasks
      for (const task of tasks) {
        // Add the task to the case
        userCase.tasks.push(task);
      }

      // Update the user in the userTable
      const updateUserParams = {
        TableName: userTable,
        Key: marshall({ username }),
        UpdateExpression: "SET cases = :cases",
        ExpressionAttributeValues: marshall({ ":cases": user.cases }),
        ReturnValues: "UPDATED_NEW"
      };

      await dynamodbClient.send(new UpdateItemCommand(updateUserParams));

      // Send email to the user 
      const sender = "no-reply@mark-associates.com";
      const receiver = user.email;
      const subject = "New Case Assigned";
      const body = `
        <h2>Hi ${username},</h2>
        <p>A new case with Claim No: <strong>${claim_no}</strong> has been assigned to you.</p>
        <p><strong>Tasks:</strong> ${tasks.join(', ')}</p>
        <p>Please check your dashboard for more details.</p>
      `;

      await sendEmail(sender, receiver, subject, body);
      console.log("Email sent Successfully");
    } catch (error) {
      console.error(`Error updating user with fos ${fos}: `, error);
    }
  }
};

// const deleteUser = async (username) => {
//   const params = {
//     TableName: userTable,
//     Key: marshall({ username })
//   };

//   try {
//     await dynamodbClient.send(new DeleteItemCommand(params));
//     return { message: 'User deleted successfully' };
//   } catch (error) {
//     console.error("There was an error deleting the user: ", error);
//     // throw new Error('Error deleting user');
//   }
// };

module.exports = {
  getCase,
  listCasesWithFilter,
  createCase,
  createRTIForm,
  createCourtForm,
  dashboardCasesCount,
  updateCaseDetails
};
