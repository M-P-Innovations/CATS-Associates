require('dotenv').config();
const randomstring = require("randomstring");
const userService = require("./users-service")

const { sendEmail } = require("../utils/mail-sender");

// Store users otp
const storeOtp = new Map();

// Generate a 6-digit OTP
const generateOTP = () => {
  return randomstring.generate({ length: 6, charset: "numeric" });
};

// Send OTP via email
const sendOtpMail = async (receiver_email, username) => {
  const otp = generateOTP();
  const dynamoUser = await userService.getUser(username);

  if (!dynamoUser) {
    throw new Error('User does not exist');
  }

  try {
    const sender = "no-reply@mark-associates.com";
    const receiver = receiver_email;
    const subject = "Reset Password OTP";
    const body = `
        <h2>Hi ${username}</h2>
        <p>Your OTP to reset your password is ${otp}</p>
    `;

    await sendEmail(sender, receiver, subject, body);
    console.log("Email sent Successfully");
    storeOtp.set(username, otp);
    return otp;
  } catch (error) {
    console.error('There is an error when Sending OTP: ', error);
    throw new Error(error);
  }
};

// Verify OTP
const verifyOtp = (username, otp) => {
  return otp === storeOtp.get(username);
};

module.exports = {
  sendOtpMail,
  verifyOtp
};