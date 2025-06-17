import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;
const API_BASE_URL = 'http://demo2.z-bit.ee';

// Enable CORS for all routes with specific configuration
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Todo API Proxy Server</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2 {
          color: #2c3e50;
          margin-top: 0;
        }
        .status {
          padding: 10px;
          background-color: #4CAF50;
          color: white;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 20px;
        }
        .endpoints {
          margin-top: 20px;
        }
        .endpoint {
          background: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #3498db;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: #2c3e50;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 5px;
          font-size: 0.9em;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        a {
          color: #3498db;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Todo API Proxy Server</h1>
        <div class="status">✓ Running on port ${PORT}</div>
        
        <p>This proxy server is working correctly. Your Todo application should now be able to connect to the API without CORS issues.</p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> Make sure your frontend is running on port 8000 for CORS to work properly.
        </div>
        
        <div class="endpoints">
          <h2>Available Endpoints:</h2>
          <div class="endpoint">
            <strong>POST /proxy/login</strong> - User authentication
            <div class="code">http://localhost:${PORT}/proxy/login</div>
            <small>Body: {"username": "demo", "password": "demo"}</small>
          </div>
          <div class="endpoint">
            <strong>POST /proxy/register</strong> - User registration
            <div class="code">http://localhost:${PORT}/proxy/register</div>
            <small>Body: {"username": "newuser", "newPassword": "password"}</small>
          </div>
          <div class="endpoint">
            <strong>GET /proxy/tasks</strong> - Get user tasks
            <div class="code">http://localhost:${PORT}/proxy/tasks</div>
            <small>Headers: Authorization: Bearer &lt;token&gt;</small>
          </div>
          <div class="endpoint">
            <strong>POST /proxy/tasks</strong> - Create new task
            <div class="code">http://localhost:${PORT}/proxy/tasks</div>
            <small>Body: {"title": "Task title", "desc": "Task description"}</small>
          </div>
          <div class="endpoint">
            <strong>PUT /proxy/tasks/:id</strong> - Update task
            <div class="code">http://localhost:${PORT}/proxy/tasks/1</div>
            <small>Body: {"title": "Updated title", "desc": "Updated description", "completed": true}</small>
          </div>
          <div class="endpoint">
            <strong>DELETE /proxy/tasks/:id</strong> - Delete task
            <div class="code">http://localhost:${PORT}/proxy/tasks/1</div>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 4px;">
          <strong>🚀 Next steps:</strong> 
          <ol>
            <li>Start your frontend server on port 8000</li>
            <li>Visit <a href="http://localhost:8000">http://localhost:8000</a></li>
            <li>Use credentials: <strong>demo</strong> / <strong>demo</strong></li>
          </ol>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Login proxy endpoint
app.post('/proxy/login', async (req, res) => {
  try {
    // Log the entire request for debugging
    console.log('=== LOGIN REQUEST DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Raw body type:', typeof req.body);
    
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      console.log('❌ Validation failed - missing username or password');
      console.log('Username:', username, 'Password:', password ? '[HIDDEN]' : 'undefined');
      return res.status(400).json({ 
        error: 'Username and password are required',
        received: {
          username: !!username,
          password: !!password,
          bodyKeys: Object.keys(req.body || {})
        }
      });
    }
    
    console.log(`✅ Login request for user: ${username}`);
    console.log('Making request to:', `${API_BASE_URL}/users/get-token`);
    
    const requestPayload = { username, password };
    console.log('Request payload:', { username, password: '[HIDDEN]' });
    
    const response = await fetch(`${API_BASE_URL}/users/get-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Todo-Proxy-Server/1.0'
      },
      body: JSON.stringify(requestPayload)
    });

    console.log(`📡 API Response status: ${response.status}`);
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      data = await response.json();
      console.log('📡 API Response data:', data);
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON response:', jsonError);
      const textResponse = await response.text();
      console.log('📡 Raw response text:', textResponse);
      return res.status(500).json({
        error: 'Invalid response from API',
        message: 'API returned non-JSON response',
        rawResponse: textResponse
      });
    }
    
    console.log(`📤 Sending response with status: ${response.status}`);
    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: 'Failed to connect to authentication service',
      details: error.message
    });
  }
});

// Registration proxy endpoint
app.post('/proxy/register', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    
    // Validate input
    if (!username || !newPassword) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    if (newPassword.length < 4) {
      return res.status(400).json({ 
        error: 'Password must be at least 4 characters long' 
      });
    }
    
    console.log(`Registration request for user: ${username}`);
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Todo-Proxy-Server/1.0'
      },
      body: JSON.stringify({ 
        username,
        newPassword 
      })
    });

    const data = await response.json();
    console.log(`Registration response: ${response.status}`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: 'Failed to connect to registration service',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Tasks proxy endpoints
app.get('/proxy/tasks', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authorization token is required' 
      });
    }
    
    console.log('Fetching tasks');
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': 'application/json',
        'User-Agent': 'Todo-Proxy-Server/1.0'
      }
    });

    const data = await response.json();
    console.log(`Tasks response: ${response.status}`, Array.isArray(data) ? `Received ${data.length} tasks` : 'Response received');
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: 'Failed to fetch tasks',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/proxy/tasks', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { title, desc } = req.body;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authorization token is required' 
      });
    }
    
    if (!title) {
      return res.status(400).json({ 
        error: 'Task title is required' 
      });
    }
    
    console.log(`Creating task: ${title}`);
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Accept': 'application/json',
        'User-Agent': 'Todo-Proxy-Server/1.0'
      },
      body: JSON.stringify({ title, desc: desc || '' })
    });

    const data = await response.json();
    console.log(`Task creation response: ${response.status}`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: 'Failed to create task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/proxy/tasks/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const taskId = req.params.id;
    const updates = req.body;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authorization token is required' 
      });
    }
    
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ 
        error: 'Valid task ID is required' 
      });
    }
    
    console.log(`Updating task ${taskId}:`, Object.keys(updates));
    
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Accept': 'application/json',
        'User-Agent': 'Todo-Proxy-Server/1.0'
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    console.log(`Task update response: ${response.status}`);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: 'Failed to update task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/proxy/tasks/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const taskId = req.params.id;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authorization token is required' 
      });
    }
    
    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ 
        error: 'Valid task ID is required' 
      });
    }
    
    console.log(`Deleting task ${taskId}`);
    
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'User-Agent': 'Todo-Proxy-Server/1.0'
      }
    });

    if (response.ok) {
      console.log(`Task ${taskId} deleted successfully`);
      res.status(204).send();
    } else {
      const data = await response.json().catch(() => ({}));
      console.log(`Task deletion response: ${response.status}`);
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: 'Failed to delete task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the proxy server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  =============================================
   Todo API Proxy Server running on port ${PORT}
  =============================================
  
  🌐 Access the proxy server at:
     http://localhost:${PORT}
  
  🖥️  Your Todo application should be served at:
     http://localhost:8000
  
  🔑 Test credentials:
     Username: demo
     Password: demo
  
  📊 Health check: http://localhost:${PORT}/health
  
  Environment: ${process.env.NODE_ENV || 'development'}
  `);
});