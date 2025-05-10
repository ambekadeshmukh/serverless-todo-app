// backend/functions/getTasks.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get all tasks from DynamoDB
    const params = {
      TableName: TABLE_NAME
    };
    
    const result = await dynamoDB.scan(params).promise();
    
    // Return a successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For CORS support
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'Error fetching tasks',
        error: error.message 
      })
    };
  }
};