const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand, ScanCommand, BatchGetItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const userTable = process.env.DYNAMODB_NAME;

exports.register = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const city = req.body.city
  const password = req.body.password;
  const dynamoUser = await getUser(username.toLowerCase().trim());

  if (!username || !name || !email || !password || !city) {
    res.status(503).json({
      message: 'All fields are required'
    });
  }
  else if (dynamoUser && dynamoUser.username) {
    res.status(503).json({
      message: 'Username already exists in our database. Please choose a different username'
    });
  }
  else {

    const encryptedPW = bcrypt.hashSync(password.trim(), 10);
    const user = {
      name: name,
      email: email,
      username: username.toLowerCase().trim(),
      password: encryptedPW,
      active: false,
      user_role: 'User',
      isloggedin: false,
      city: city
    };

    const saveUserResponse = await saveUser(user);
    if (!saveUserResponse) {
      res.status(503).json({
        message: 'Server Error. Please try again later.'
      });
    }
    else res.json(username)
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

async function saveUser(user) {
  const params = {
    TableName: userTable,
    Item: marshall(user)
  };

  try {
    await dynamodbClient.send(new PutItemCommand(params));
    return true;
  } catch (error) {
    console.error('There is an error saving user: ', error);
    return false;
  }
}
