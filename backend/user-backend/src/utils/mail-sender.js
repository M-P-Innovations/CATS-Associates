const nodemailer = require("nodemailer");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
require("dotenv").config();

const AWS_REGION = process.env.REGION; // e.g., 'us-east-1'
const SMTP_USERNAME_PARAM = "nodemailer-smtp-username";
const SMTP_PASSWORD_PARAM = "nodemailer-smtp-password";

/**
 * Send an email using AWS SES SMTP credentials stored in Parameter Store.
 *
 * @param {string} senderEmail - The sender's email address.
 * @param {string} receiverEmail - The recipient's email address.
 * @param {string} subject - The email subject.
 * @param {string} emailBody - The email body in HTML format.
 * @returns {object} - The result of the email operation.
 */
const sendEmail = async (senderEmail, receiverEmail, subject, emailBody) => {
    const ssmClient = new SSMClient({ region: AWS_REGION });

    // Fetch SMTP credentials from Parameter Store
    const [usernameResponse, passwordResponse] = await Promise.all([
        ssmClient.send(new GetParameterCommand({ Name: SMTP_USERNAME_PARAM, WithDecryption: true })),
        ssmClient.send(new GetParameterCommand({ Name: SMTP_PASSWORD_PARAM, WithDecryption: true })),
    ]);

    const SMTP_USERNAME = usernameResponse.Parameter.Value;
    const SMTP_PASSWORD = passwordResponse.Parameter.Value;

    // Configure the SMTP transport
    const transporter = nodemailer.createTransport({
        host: `email-smtp.${AWS_REGION}.amazonaws.com`, // SES SMTP endpoint
        port: 587, // Use port 587 for STARTTLS
        secure: false, // Use `false` for STARTTLS
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD,
        },
    });

    // Define the email options
    const mailOptions = {
        from: senderEmail,
        to: receiverEmail,
        subject: subject,
        html: emailBody,
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", result);
        return result; // Return the email result object
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Throw error to be handled by the caller
    }
};

module.exports = { sendEmail };
