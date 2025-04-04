const express = require("express")
const routes = express.Router()
const loginController = require("../controller/login-controller")
const userService = require("../controller/users-controller")

routes.post("/", loginController.login);

// routes.post("/reset-password",userService.passwordReset);


module.exports = routes
