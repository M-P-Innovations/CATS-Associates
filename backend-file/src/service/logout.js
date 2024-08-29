const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand, ScanCommand, BatchGetItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
require('dotenv').config()
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const userTable = process.env.DYNAMODB_NAME;

exports.logout = async (req, res) => {

  const username = req.params.username.toLowerCase().trim();
  console.log("inside logout username: " + username);
  try {

    const isloggedin = false;
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

    const response = {
      user: username
    };
    res.json(response);
  }
  catch (error) {
    console.log(error);
    res.status(503).json({
      message: "Error in logout"
    });
  }
}


