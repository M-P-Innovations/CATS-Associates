const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand, ScanCommand, BatchGetItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });
const userTable = process.env.DYNAMODB_NAME;

var getUsersFilterFields = "city, active, #name, logoValue, username, email, user_role, mobile_number"

const getUser = async (username, login) => {
  if (login) {
    if (!getUsersFilterFields.includes("password")) {
      getUsersFilterFields += ", password"
    }
  }

  const params = {
    TableName: userTable,
    Key: marshall({ username }),
    ProjectionExpression: getUsersFilterFields, // Use #name as a placeholder
    ExpressionAttributeNames: {
      "#name": "name" // Map #name to the reserved keyword 'name'
    }
  };

  try {
    const { Item } = await dynamodbClient.send(new GetItemCommand(params));
    if (!Item) {
      return null; // Return null if no user is found
    }

    return unmarshall(Item);
  } catch (error) {
    console.error('There is an error getting user: ', error);
    throw new Error(error);
  }
};


const getAllUsers = async () => {
  const params = {
    TableName: userTable,
    ProjectionExpression: getUsersFilterFields, // Exclude 'password' field
    ExpressionAttributeNames: {
      "#name": "name" // Map #name to the reserved keyword 'name'
    }
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

    return users;
  } catch (error) {
    console.error('There was an error getting all users: ', error);
    throw new Error(error);
  }
};

const createUser = async (user) => {
  const params = {
    TableName: userTable,
    Item: marshall(user)
  };

  try {
    await dynamodbClient.send(new PutItemCommand(params));
    return true;
  } catch (error) {
    console.error('There is an error saving user: ', error);
    throw new Error(error);
  }
};

const updateUser = async (username, updates) => {
  const { active, user_role, reset_pass, profile } = updates;
  const expressionAttributeValues = {};

  const updateParams = {
    TableName: userTable,
    Key: marshall({ username }),
    UpdateExpression: "set",
    ExpressionAttributeValues: {}
  };

  if (active !== undefined) {
    updateParams.UpdateExpression += " active = :active";
    expressionAttributeValues[":active"] = active;
  }

  if (user_role) {
    updateParams.UpdateExpression += " user_role = :user_role";
    expressionAttributeValues[":user_role"] = user_role;
  }

  if (reset_pass) {
    const encryptedPW = bcrypt.hashSync(reset_pass.trim(), 10);
    updateParams.UpdateExpression += " password = :password";
    expressionAttributeValues[":password"] = encryptedPW;
  }

  if (profile) {
    // console.log("profile",profile);
    updateParams.UpdateExpression += " city = :city, email = :email, mobile_number = :mobile_number, #name = :name";
    expressionAttributeValues[":city"] = profile.city;
    expressionAttributeValues[":email"] = profile.email;
    expressionAttributeValues[":mobile_number"] = profile.mobile_number;
    expressionAttributeValues[":name"] = profile.name;
    updateParams.ExpressionAttributeNames = { "#name": "name" }; // Map #name to the reserved keyword 'name'
  }

  updateParams.ExpressionAttributeValues = marshall(expressionAttributeValues);
  updateParams.ReturnValues = "UPDATED_NEW";

  try {
    const data = await dynamodbClient.send(new UpdateItemCommand(updateParams));
    if (reset_pass) { return "Password Reset Successful"; }
    return unmarshall(data.Attributes);
  } catch (error) {
    console.error("There was an error updating the user: ", error);
    throw new Error(error);
  }
};

const deleteUser = async (username) => {
  const params = {
    TableName: userTable,
    Key: marshall({ username })
  };

  try {
    await dynamodbClient.send(new DeleteItemCommand(params));
    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error("There was an error deleting the user: ", error);
    throw new Error(error);
  }
};

const passwordReset = async (username, password) => {
  const params = {
    TableName: userTable,
    Key: marshall({ username }),
    UpdateExpression: "set password = :password",
    ExpressionAttributeValues: marshall({
      ":password": password
    }),
    ReturnValues: "UPDATED_NEW"
  };

  try {
    const data = await dynamodbClient.send(new UpdateItemCommand(params));
    return unmarshall(data.Attributes);
  } catch (error) {
    console.error("There was an error updating the user: ", error);
    throw new Error(error);
  }
};

module.exports = {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  passwordReset,
  createUser
};
