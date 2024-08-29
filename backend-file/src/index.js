const serverless = require("serverless-http");
const express = require("express");
const app = express();
const cors = require("cors");

//Import Routes
const healthRoute = require('./routes/health');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const usersRoute = require('./routes/users');
const logoutRoute = require('./routes/logout')


app.use(express.json());
app.use(cors());


// Routes
app.use('/health', healthRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/users', usersRoute);
app.use('/logout', logoutRoute);


/* To run and test locally

if (process.env.DEVELOPMENT) {
  const PORT = 8080;

  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
}
*/

module.exports.handler = serverless(app);