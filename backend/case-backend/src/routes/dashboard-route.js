const express = require("express")
const routes = express.Router()
const dashboardController = require("../controller/dashboard-controller")

routes.get("/", dashboardController.getDashboardDetails);


module.exports = routes