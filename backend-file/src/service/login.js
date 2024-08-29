const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand, ScanCommand, BatchGetItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth.js');
require('dotenv').config()
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const userTable = process.env.DYNAMODB_NAME;

exports.login = async (req, res) => {
  const user = req.body;
  const username = req.body.username.toLowerCase().trim();
  const password = req.body.password;
  const dynamoUser = await getUser(username);
  try {
    if (!user || !username || !password) {
      res.status(503).json({
        message: 'Username and Password are required'
      });
    }
    else if (!dynamoUser || !dynamoUser.username) {
      res.status(503).json({
        message: 'User does not exist'
      });
    }
    else if (!dynamoUser.active) {
      res.status(503).json({
        message: 'User is inactive. Please reachout to admin.'
      });
    }
    else if (!bcrypt.compareSync(password, dynamoUser.password)) {
      res.status(503).json({
        message: 'Incorrect Password'
      });
    }
    else {

      const isloggedin = true;
      const params = {
        TableName: userTable,
        Key: marshall({ username }),
        UpdateExpression: "set isloggedin = :isloggedin",
        ExpressionAttributeValues: marshall({
          ":isloggedin": isloggedin
        }),
        ReturnValues: "UPDATED_NEW"
      };
      const data = await dynamodbClient.send(new UpdateItemCommand(params));
      const userInfo = {
        username: dynamoUser.username,
        user_role: dynamoUser.user_role,
        city: dynamoUser.city,
        email: dynamoUser.email
      };

      const token = auth.generateToken(userInfo);
      const response = {
        user: userInfo,
        token: token
      };
      res.json(response);
    }
  }
  catch (error) {
    console.log(error);
    res.status(503).json({
      message: "Error in loging"
    });
  }
}

async function getUser(username) {
  const params = {
    TableName: userTable,
    Key: marshall({ username: username })
  };

  try {
    const { Item } = await dynamodbClient.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : null;
  } catch (error) {
    console.error('There is an error getting user: ', error);
    return null;
  }
}
