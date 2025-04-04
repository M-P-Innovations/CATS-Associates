const bcrypt = require('bcryptjs');
const auth = require('../utils/auth.js');
const userService = require('../service/users-service.js')
require('dotenv').config();
const Logger = require(process.env.DEPENDENCY_PATH + 'logger');

exports.login = async (req, res) => {
    const user = req.body;
    const username = req.body.username.toLowerCase().trim();
    const password = req.body.password;
    const dynamoUser = await userService.getUser(username,"login");
    try {
        if (!user || !username || !password) {
            res.status(503).json({
                message: 'Username and Password are required'
            });
        }
        else if (!dynamoUser || !dynamoUser.username) {
            res.status(503).json({
                message: 'User does not exist'
            });
        }
        else if (!dynamoUser.active) {
            res.status(503).json({
                message: 'User is inactive. Please reach out to admin.'
            });
        }
        else if (!bcrypt.compareSync(password, dynamoUser.password)) {
            res.status(503).json({
                message: 'Incorrect Password'
            });
        }
        else {

            const userInfo = {
                username: dynamoUser.username,
                user_role: dynamoUser.user_role,
                city: dynamoUser.city,
                email: dynamoUser.email,
                logoValue: dynamoUser.logoValue
            };

            const token = auth.generateToken(userInfo);
            const response = {
                user: userInfo,
                token: token
            };
            const logger = new Logger(username);
            if (process.env.LOGGER_ENABLED == "true") await logger.info(`User Logged In`);
            res.json(response);
        }
    }
    catch (error) {
        console.log(error);
        res.status(503).json({
            message: "Error while logging in"
        });
    }
}
