// NOT USING

// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const PORT = 3000;
// const SECRET_KEY = 'your-secure-secret-key-123';

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname)));

// // In-memory database
// let users = [
//   {
//     id: 1,
//     username: 'demo',
//     password: bcrypt.hashSync('demo', 10),
//     tasks: [
//       { id: 1, title: 'Sample task 1', completed: false },
//       { id: 2, title: 'Sample task 2', completed: true }
//     ]
//   }
// ];

// // Authentication middleware
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

// // Auth endpoints
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     if (!username || !password) {
//       return res.status(400).json({ message: 'Username and password required' });
//     }

//     const user = users.find(u => u.username === username);
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const validPassword = bcrypt.compareSync(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    
//     res.json({
//       token,
//       user: {
//         id: user.id,
//         username: user.username
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Login failed' });
//   }
// });

// // Task endpoints
// app.get('/api/tasks', authenticateToken, (req, res) => {
//   try {
//     const user = users.find(u => u.id === req.user.userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });
    
//     res.json(user.tasks);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching tasks' });
//   }
// });

// app.post('/api/tasks', authenticateToken, (req, res) => {
//   try {
//     const { title } = req.body;
//     if (!title) return res.status(400).json({ message: 'Title is required' });

//     const user = users.find(u => u.id === req.user.userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const newTask = {
//       id: user.tasks.length > 0 ? Math.max(...user.tasks.map(t => t.id)) + 1 : 1,
//       title,
//       completed: false
//     };

//     user.tasks.push(newTask);
//     res.status(201).json(newTask);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating task' });
//   }
// });

// // Add this endpoint with the others in server.js
// // Add these endpoints with proper route definitions
// app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
//     try {
//         const taskId = parseInt(req.params.id);
//         const userId = req.user.userId;

//         const user = users.find(u => u.id === userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const taskIndex = user.tasks.findIndex(t => t.id === taskId);
//         if (taskIndex === -1) {
//             return res.status(404).json({ message: 'Task not found' });
//         }

//         user.tasks.splice(taskIndex, 1);
//         res.json({ success: true, message: 'Task deleted' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error deleting task' });
//     }
// });

// app.patch('/api/tasks/:id', authenticateToken, (req, res) => {
//     try {
//         const taskId = parseInt(req.params.id);
//         const { title, completed } = req.body;
//         const userId = req.user.userId;

//         const user = users.find(u => u.id === userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const task = user.tasks.find(t => t.id === taskId);
//         if (!task) return res.status(404).json({ message: 'Task not found' });

//         if (title !== undefined) task.title = title;
//         if (completed !== undefined) task.completed = completed;

//         res.json(task);
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating task' });
//     }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   console.log('Pre-configured demo user:');
//   console.log('Username: demo');
//   console.log('Password: demo');
//   console.log('Initial tasks:', users[0].tasks);
// });