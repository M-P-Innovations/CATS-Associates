const express = require("express")
const routes = express.Router()
const registerService = require("../service/register")

routes.post("/", registerService.register);

module.exports = routes
