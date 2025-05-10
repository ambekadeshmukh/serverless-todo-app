// src/services/taskService.js
import axios from 'axios';

// API Gateway endpoint - this will be set from environment variables or backend build process
const API_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod';

// Get all tasks
export const getTasks = () => {
  return axios.get(`${API_URL}/tasks`);
};

// Create a new task
export const createTask = (task) => {
  return axios.post(`${API_URL}/tasks`, task);
};

// Update a task
export const updateTask = (id, updates) => {
  return axios.put(`${API_URL}/tasks/${id}`, updates);
};

// Delete a task
export const deleteTask = (id) => {
  return axios.delete(`${API_URL}/tasks/${id}`);
};