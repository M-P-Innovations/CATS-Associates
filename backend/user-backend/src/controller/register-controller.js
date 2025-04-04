const bcrypt = require('bcryptjs');
const userService = require('../service/users-service');

exports.register = async (req, res) => {
  const { name, email, city, password, logoValue , mobile_number} = req.body
  const username = req.body.username.toLowerCase().trim();

  // Check if required fields are missing
  if (!username || !name || !email || !password || !city || !mobile_number) {
    return res.status(503).json({
      message: 'All fields are required'
    });
  }

  try {
    // Check if the user already exists in DynamoDB
    const dynamoUser = await userService.getUser(username);

    if (dynamoUser && dynamoUser.username) {
      return res.status(503).json({
        message: 'Username already exists in our database. Please choose a different username'
      });
    }

    else {
      // Encrypt the password and save the user
      const encryptedPW = bcrypt.hashSync(password.trim(), 10);
      const user = {
        name: name,
        email: email,
        username: username.toLowerCase().trim(),
        password: encryptedPW,
        mobile_number: mobile_number,
        active: false,
        user_role: 'FOS',
        city: city,
        logoValue: logoValue
      };
      const saveUserResponse = await userService.createUser(user);

      if (!saveUserResponse) {
        return res.status(503).json({
          message: 'Server Error. Please try again later.'
        });
      }

      res.json(username);
    }

  } catch (error) {
    console.error('There was an error during registration: ', error);
    res.status(503).json({
      message: 'Server Error. Please try again later.'
    });
  }
};
