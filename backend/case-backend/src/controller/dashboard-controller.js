const caseService = require('../service/case-service');
require('dotenv').config();
const Logger = require(process.env.DEPENDENCY_PATH + 'logger.js');

exports.getDashboardDetails = async (req, res) => {
    const { username, role } = req.query
    const logger = new Logger(username);
    const user = { username: username, role: role }
    try {
        const dashboard = await caseService.dashboardCasesCount(user);
        dashboard.users -= 1; // Excluding the admin user
        res.status(200).json(dashboard);
    } catch (error) {
        console.log(error);
        if (process.env.LOGGER_ENABLED == "true") await logger.error(`Unable to View Case : ${error}`);
        res.status(503).json({
            message: `Unable to View Case : ${error}`
        });
    }
};