const express = require("express")
const routes = express.Router()
const loginService = require("../service/login")

routes.post("/", loginService.login);

module.exports = routes
