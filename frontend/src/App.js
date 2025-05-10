// src/App.js
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Checkbox,
  Paper,
  AppBar,
  Toolbar,
  Box,
  CircularProgress
} from '@material-ui/core';
import { Delete, Add } from '@material-ui/icons';
import { getTasks, createTask, updateTask, deleteTask } from './services/taskService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      setLoading(true);
      const response = await createTask({ title: newTask, completed: false });
      setTasks([...tasks, response.data]);
      setNewTask('');
      setError(null);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const updatedTask = { completed: !completed };
      await updateTask(id, updatedTask);
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="App">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6">Serverless Todo App</Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Paper elevation={3} style={{ padding: '2rem' }}>
          <Typography variant="h4" gutterBottom>
            My Tasks
          </Typography>

          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={handleAddTask} style={{ display: 'flex', marginBottom: '2rem' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              disabled={loading || !newTask.trim()}
              style={{ marginLeft: '1rem' }}
            >
              Add
            </Button>
          </form>

          {loading && tasks.length === 0 ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {tasks.map(task => (
                <ListItem key={task.id} divider>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                    color="primary"
                  />
                  <ListItemText
                    primary={task.title}
                    style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {tasks.length === 0 && !loading && (
                <Typography align="center" color="textSecondary" style={{ padding: '2rem' }}>
                  No tasks yet. Add one above!
                </Typography>
              )}
            </List>
          )}
        </Paper>
      </Container>
    </div>
  );
}

export default App;