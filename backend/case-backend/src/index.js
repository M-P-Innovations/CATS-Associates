const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Routes
const healthRoute = require('./routes/health-route');
const caseRegisterRoute = require('./routes/case-register-route');
const caseRoute = require('./routes/case-route');
const dashboardRoute = require('./routes/dashboard-route');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.use('/health', healthRoute);
app.use('/case-register', caseRegisterRoute);
app.use('/case', caseRoute);
app.use('/dashboard', dashboardRoute);

// Local Development
if (process.env.DEVELOPMENT) {
  const PORT = 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
}

// Export for Lambda with binary support
module.exports.handler = serverless(app, {
  binary: ['application/zip'],  // Specify binary content types
});
