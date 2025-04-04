const express = require("express")
const routes = express.Router()
const otpController = require("../controller/otp-controller")

routes.post("/send-otp", otpController.sendOtp);

routes.post('/verify-otp', otpController.verifyOtp);


module.exports = routes
