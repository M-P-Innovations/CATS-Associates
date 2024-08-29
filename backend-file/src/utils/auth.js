const jwt = require('jsonwebtoken');

function generateToken(userInfo) {
    if (!userInfo) {
        return null;
    }

    return jwt.sign(userInfo, 'Mysecret', {
        expiresIn: '1h'
    });
}

function verifyToken(username, token) {
    return jwt.verify(token, 'Mysecret', (error, response) => {
        if (error) {
            return {
                verified: false,
                message: 'invalid token'
            };
        }

        if (response.username !== username) {
            return {
                verified: false,
                message: 'invalid user'
            };
        }

        return {
            verified: true,
            message: 'verified'
        };
    });
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;