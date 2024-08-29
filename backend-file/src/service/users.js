const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand, ScanCommand, BatchGetItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config()
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const userTable = process.env.DYNAMODB_NAME;

exports.getUser = async (req, res) => {
  const username = req.body.username
  const params = {
    TableName: userTable,
    Key: marshall({ username })
  };

  try {
    const { Item } = await dynamodbClient.send(new GetItemCommand(params));
    res.status(200).json(unmarshall(Item));
  } catch (error) {
    console.error('There is an error getting user: ', error);
    return null;
  }
}

exports.getAllUsers = async (req, res) => {
  const params = {
    TableName: userTable
  };

  try {
    const users = [];
    let data;
    do {
      data = await dynamodbClient.send(new ScanCommand(params));
      data.Items.forEach(item => {
        users.push(unmarshall(item));
      });
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (data.LastEvaluatedKey);

    res.json(users);
    // return util.buildResponse(200, users);
  } catch (error) {
    console.error('There was an error getting all users: ', error);
  }
}

exports.updateUser = async (req, res) => {
  const username = req.body.username;
  if (req.body.active != null) {
    const active = req.body.active;
    const params = {
      TableName: userTable,
      Key: marshall({ username }),
      UpdateExpression: "set active = :active",
      ExpressionAttributeValues: marshall({
        ":active": active
      }),
      ReturnValues: "UPDATED_NEW"
    };
    try {
      const data = await dynamodbClient.send(new UpdateItemCommand(params));
      res.status(200).json(unmarshall(data.Attributes));
    } catch (error) {
      console.error("There was an error updating the user: ", error);
      res.status(503).json({
        message: "Server Error. Please try again later."
      })
    }
  }
  else {
    const user_role = req.body.user_role;
    const params = {
      TableName: userTable,
      Key: marshall({ username }),
      UpdateExpression: "set user_role = :user_role",
      ExpressionAttributeValues: marshall({
        ":user_role": user_role
      }),
      ReturnValues: "UPDATED_NEW"
    };

    try {
      const data = await dynamodbClient.send(new UpdateItemCommand(params));
      res.status(200).json(unmarshall(data.Attributes));
    } catch (error) {
      console.error("There was an error updating the user: ", error);
      res.status(503).json({
        message: "Server Error. Please try again later."
      })
    }
  }
}

exports.deleteUser = async (req, res) => {
  const username = req.body.username;
  console.log("USERNAME: " + req);
  const params = {
    TableName: userTable,
    Key: marshall({ username })
  };
  console.log(params);

  try {
    await dynamodbClient.send(new DeleteItemCommand(params));
    res.status(200).json({
      message: "User deleted successfully"
    })
  } catch (error) {
    console.error("There was an error deleting the user: ", error);
    res.status(503).json({
      message: "Server Error. Please try again later."
    })
  }
};
