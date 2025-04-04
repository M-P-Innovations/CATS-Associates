const express = require("express")
const routes = express.Router()
const registerController = require("../controller/register-controller")

routes.post("/", registerController.register);

module.exports = routes
