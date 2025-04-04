const express = require("express")
const routes = express.Router()
const logsController = require("../controller/logs-controller.js")

routes.post("/", logsController.getLogs);

module.exports = routes
