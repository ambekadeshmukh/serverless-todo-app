// backend/functions/deleteTask.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get the task ID from the path parameters
    const taskId = event.pathParameters.id;
    
    // Delete the task from DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Key: { id: taskId },
      ReturnValues: 'ALL_OLD'
    };
    
    const result = await dynamoDB.delete(params).promise();
    
    // If the task wasn't found
    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Task not found' })
      };
    }
    
    // Return a successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'Task deleted successfully',
        deletedTask: result.Attributes
      })
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'Error deleting task',
        error: error.message 
      })
    };
  }
};