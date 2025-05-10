// backend/functions/createTask.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the incoming request body
    const requestBody = JSON.parse(event.body);
    
    // Validate request
    if (!requestBody.title) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Task title is required' })
      };
    }
    
    // Create a new task with unique ID
    const task = {
      id: uuidv4(),
      title: requestBody.title,
      completed: requestBody.completed || false,
      createdAt: new Date().toISOString()
    };
    
    // Store the task in DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Item: task
    };
    
    await dynamoDB.put(params).promise();
    
    // Return a successful response with the created task
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(task)
    };
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'Error creating task',
        error: error.message 
      })
    };
  }
};