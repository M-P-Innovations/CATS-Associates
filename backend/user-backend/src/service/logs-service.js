const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config();
const moment = require("moment-timezone");

const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const logTable = process.env.LOGGING_TABLE;

const getAllLogs = async (startDate, endDate, caseId) => {
    if (!startDate || !endDate) {
        endDate = moment.tz("Asia/Kolkata");
        // Get the date one month ago
        startDate = endDate.clone().subtract(1, 'months');
    }

    // Convert the date strings to local time timestamps
    const startTimestamp = moment.tz(startDate, "Asia/Kolkata").valueOf();
    const endTimestamp = moment.tz(endDate, "Asia/Kolkata").valueOf();

    // Base filter expression to filter by date range
    let filterExpression = '#id BETWEEN :startVal AND :endVal';
    let expressionAttributeValues = {
        ':startVal': { S: startTimestamp.toString() },
        ':endVal': { S: endTimestamp.toString() },
    };

    // Conditionally add caseId filter
    if (caseId) {
        filterExpression += ' AND #caseId = :caseIdVal';
        expressionAttributeValues[':caseIdVal'] = { S: caseId };
    }

    // Only add #caseId to ExpressionAttributeNames if caseId is used
    const expressionAttributeNames = {
        '#id': 'id',
    };

    if (caseId) {
        expressionAttributeNames['#caseId'] = 'caseId';
    }

    const params = {
        TableName: logTable, // Replace with your DynamoDB table name
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
    };

    try {
        const command = new ScanCommand(params);
        const data = await dynamodbClient.send(command);

        // Unmarshall the data into a more usable format
        const items = data.Items.map(item => unmarshall(item));
        console.log(`Logs Generated from ${startDate} to ${endDate}${caseId ? ' for caseId: ' + caseId : ''}`);
        return items; // Returns the filtered items
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    getAllLogs
};
