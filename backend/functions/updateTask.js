// backend/functions/updateTask.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get the task ID from the path parameters
    const taskId = event.pathParameters.id;
    
    // Parse the incoming request body
    const requestBody = JSON.parse(event.body);
    
    // Create update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    // Add all properties from the request body that should be updated
    Object.keys(requestBody).forEach(key => {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = requestBody[key];
    });
    
    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    
    // Update the task in DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Key: { id: taskId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoDB.update(params).promise();
    
    // Return a successful response with the updated task
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'Error updating task',
        error: error.message 
      })
    };
  }
};
