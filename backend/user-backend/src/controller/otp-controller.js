// otpController.js
const otpService = require('../service/otp-service');
const userService = require('../service/users-service.js')

exports.sendOtp = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: 'Username is required'
      });
    }
    const { email } = await userService.getUser(username);
    const otp = await otpService.sendOtpMail(email, username);
    res.status(200).json({
      message: `OTP sent successfully for ${username} to ${email}`,
    });

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const { username } = req.query;

    if (otpService.verifyOtp(username, otp)) {
      res.status(200).json({ message: "Verification successful" });
    } else {
      res.status(400).json({ message: "Incorrect OTP" });
    }

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      message: "Error verifying OTP",
      error: error.message
    });
  }
};
