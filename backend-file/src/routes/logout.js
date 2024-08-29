const express = require("express")
const routes = express.Router()
const logoutService = require("../service/logout")

routes.post("/", logoutService.logout);

module.exports = routes