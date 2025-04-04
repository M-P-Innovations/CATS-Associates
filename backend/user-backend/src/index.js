const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config()

//Import Routes
const healthRoute = require('./routes/health-route');
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const usersRoute = require('./routes/users-route');
const otpRoute = require('./routes/otp-route');
const logsRoute = require('./routes/logs-route.js')


app.use(express.json());
app.use(cors());


// Routes
app.use('/health', healthRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/users', usersRoute);
app.use('/otp', otpRoute);
app.use('/logs',logsRoute);


// To run and test locally
if (process.env.DEVELOPMENT) {
  const PORT = 8081;

  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
}

module.exports.handler = serverless(app);