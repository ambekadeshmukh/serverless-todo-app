// backend/tests/getTasks.test.js
const AWS = require('aws-sdk-mock');
const { handler } = require('../functions/getTasks');

describe('getTasks Lambda function', () => {
  beforeAll(() => {
    // Mock environment variables
    process.env.TASKS_TABLE = 'tasks-table-test';
  });

  afterEach(() => {
    // Reset all mocks
    AWS.restore();
  });

  test('should return all tasks', async () => {
    // Mock DynamoDB scan operation
    const mockItems = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true }
    ];

    AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
      expect(params.TableName).toEqual('tasks-table-test');
      callback(null, { Items: mockItems });
    });

    // Create mock event
    const event = {
      httpMethod: 'GET',
      path: '/tasks',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Call the handler function
    const response = await handler(event);

    // Verify the response
    expect(response.statusCode).toEqual(200);
    expect(response.headers['Content-Type']).toEqual('application/json');
    expect(response.headers['Access-Control-Allow-Origin']).toEqual('*');
    
    // Verify the body contains our mock items
    const body = JSON.parse(response.body);
    expect(body).toEqual(mockItems);
  });

  test('should handle errors', async () => {
    // Mock DynamoDB scan operation to throw an error
    AWS.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
      callback(new Error('DynamoDB error'));
    });

    // Create mock event
    const event = {
      httpMethod: 'GET',
      path: '/tasks',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Call the handler function
    const response = await handler(event);

    // Verify the response
    expect(response.statusCode).toEqual(500);
    expect(response.headers['Content-Type']).toEqual('application/json');
    
    // Verify the error message
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Error fetching tasks');
    expect(body.error).toEqual('DynamoDB error');
  });
});
