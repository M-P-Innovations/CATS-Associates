const userService = require('../service/users-service');
require('dotenv').config();
const Logger = require(process.env.DEPENDENCY_PATH + 'logger.js');

exports.getUser = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await userService.getUser(username);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(503).json({
      message: "Server Error. Please try again later."
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let users = await userService.getAllUsers();
    users = users.filter(user => user.username !== 'admin');
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(503).json({
      message: "Server Error. Please try again later."
    });
  }
};

exports.updateUser = async (req, res) => {
  const { username } = req.body;
  const updates = { active: req.body.active, user_role: req.body.user_role, reset_pass: req.body.reset_pass, profile: req.body.profile };
  const log_username = req.query.username
  const logger = new Logger(log_username);
  try {
    const updatedUser = await userService.updateUser(username, updates);
    if (process.env.LOGGER_ENABLED == "true") await logger.info(`Updated ${username} User : ${JSON.stringify(updatedUser)}`);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    if (process.env.LOGGER_ENABLED == "true") await logger.error(`Unable to Update User '${username}' : ${error}`)
    res.status(503).json({
      message: "Server Error. Please try again later."
    });
  }
};

// exports.deleteUser = async (req, res) => {
//   const username = req.body.username;
//   const log_username = req.query.username;
//   const logger = new Logger(log_username);
//   try {
//     const result = await userService.deleteUser(username);
//     if (process.env.LOGGER_ENABLED == "true") await logger.info(`Deleted ${username} User`);
//     res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//     if (process.env.LOGGER_ENABLED == "true") await logger.error(`Error while Deleting ${username} User : ${error} `);
//     res.status(503).json({
//       message: "Server Error. Please try again later."
//     });
//   }
// };

// exports.passwordReset = async (req, res) => {
//   const username = req.query.username;
//   const password = req.body.password;

//   try {
//     const result = await userService.passwordReset(username, password);
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(503).json({
//       message: "Server Error. Please try again later."
//     });
//   }
// };
