// logger.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
// require('dotenv').config();

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

class Logger {
  constructor(name, caseId, logging_table = process.env.LOGGING_TABLE) {
    this.name = name;
    this.caseId = caseId
    this.logging_table = logging_table;
  }

  async log(level, message) {
    const command = new PutCommand({
      TableName: this.logging_table,
      Item: {
        id: Date.now().toString(),
        dateTime: new Date().toLocaleString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }).replace(',', ''),
        level: level,
        user: this.name,
        caseId: this.caseId,
        message: message,
      },
    });

    const response = await docClient.send(command);
    console.log(response);
  }

  info(message) { return this.log("info", message); }
  debug(message) { return this.log("debug", message); }
  trace(message) { return this.log("trace", message); }
  warn(message) { return this.log("warn", message); }
  error(message) { return this.log("error", message); }
  fatal(message) { return this.log("fatal", message); }
}

module.exports = Logger; // Ensure this line is present
