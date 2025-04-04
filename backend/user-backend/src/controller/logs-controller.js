const bcrypt = require('bcryptjs');
const auth = require('../utils/auth.js');
const logsService = require('../service/logs-service.js')
require('dotenv').config();
const Logger = require(process.env.DEPENDENCY_PATH + 'logger');

exports.getLogs = async (req, res) => {
  const { username ,caseId} = req.query
  const { startDate, endDate } = req.body
  try {
    const logs = await logsService.getAllLogs(startDate,endDate,caseId);
    res.status(200).json(logs);
  } catch (error) {
    console.error("There was an error getting logs by date range: ", error.message);
    res.status(503).json({
      message: "Server Error. Please try again later."
    });
  }
}