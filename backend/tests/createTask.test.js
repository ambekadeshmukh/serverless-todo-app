// backend/tests/createTask.test.js
const AWS = require('aws-sdk-mock');
const { handler } = require('../functions/createTask');
const { v4: uuidv4 } = require('uuid');

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('createTask Lambda function', () => {
  beforeAll(() => {
    // Mock environment variables
    process.env.TASKS_TABLE = 'tasks-table-test';
    
    // Mock uuid to return a fixed value for testing
    uuidv4.mockReturnValue('mocked-uuid');
  });

  afterEach(() => {
    // Reset all mocks
    AWS.restore();
    jest.clearAllMocks();
  });

  test('should create a new task', async () => {
    // Mock DynamoDB put operation
    AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      expect(params.TableName).toEqual('tasks-table-test');
      expect(params.Item.id).toEqual('mocked-uuid');
      expect(params.Item.title).toEqual('Test Task');
      expect(params.Item.completed).toEqual(false);
      callback(null, {});
    });

    // Create mock event
    const event = {
      httpMethod: 'POST',
      path: '/tasks',
      body: JSON.stringify({
        title: 'Test Task',
        completed: false
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Call the handler function
    const response = await handler(event);

    // Verify the response
    expect(response.statusCode).toEqual(201);
    expect(response.headers['Content-Type']).toEqual('application/json');
    
    // Verify the body contains the created task
    const body = JSON.parse(response.body);
    expect(body.id).toEqual('mocked-uuid');
    expect(body.title).toEqual('Test Task');
    expect(body.completed).toEqual(false);
    expect(body.createdAt).toBeDefined();
  });

  test('should return 400 if title is missing', async () => {
    // Create mock event with missing title
    const event = {
      httpMethod: 'POST',
      path: '/tasks',
      body: JSON.stringify({
        completed: false
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Call the handler function
    const response = await handler(event);

    // Verify the response
    expect(response.statusCode).toEqual(400);
    expect(response.headers['Content-Type']).toEqual('application/json');
    
    // Verify the error message
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Task title is required');
  });

  test('should handle errors', async () => {
    // Mock DynamoDB put operation to throw an error
    AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(new Error('DynamoDB error'));
    });

    // Create mock event
    const event = {
      httpMethod: 'POST',
      path: '/tasks',
      body: JSON.stringify({
        title: 'Test Task',
        completed: false
      }),
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
    expect(body.message).toEqual('Error creating task');
    expect(body.error).toEqual('DynamoDB error');
  });
});