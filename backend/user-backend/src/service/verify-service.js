const auth = require('../utils/auth');

function verify(req, res) {
  const requestBody = req.body;

  if (!requestBody.user || !requestBody.user.username || !requestBody.token) {
    return res.status(401).json({
      verified: false,
      message: 'Incorrect request body'
    });
  }

  const user = requestBody.user;
  const token = requestBody.token;
  const verification = auth.verifyToken(user.username, token);

  if (!verification.verified) {
    return res.status(401).json(verification);
  }

  return res.status(200).json({
    verified: true,
    message: 'Success',
    user: user,
    token: token
  });
}

module.exports.verify = verify;
