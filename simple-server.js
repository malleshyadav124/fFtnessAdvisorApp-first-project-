const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Serve login page for root path
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'html', 'login.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading login page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // Serve register page
  if (req.url === '/register.html') {
    fs.readFile(path.join(__dirname, 'public', 'html', 'register.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading registration page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // Serve dashboard page
  if (req.url === '/dashboard.html') {
    fs.readFile(path.join(__dirname, 'public', 'html', 'dashboard.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading dashboard page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Serve CSS files
  if (req.url.startsWith('/css/')) {
    const cssPath = path.join(__dirname, 'public', req.url);
    fs.readFile(cssPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('CSS file not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
    return;
  }
  
  // Serve JS files
  if (req.url.startsWith('/js/')) {
    const jsPath = path.join(__dirname, 'public', req.url);
    fs.readFile(jsPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('JS file not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }
  
  // Handle login API
  if (req.url === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login attempt:', data);
        
        // For testing purposes, accept any login
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: 1,
            name: 'Test User',
            gmail: data.gmail,
            age: 25
          }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
    return;
  }

  // Handle registration API
  if (req.url === '/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Registration attempt:', data);
        
        // For testing purposes, accept any registration
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: {
            id: 1,
            name: data.name,
            gmail: data.gmail,
            age: data.age
          }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
      }
    });
    return;
  }
  
  // Default response for unknown routes
  res.writeHead(404);
  res.end('Not found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
}); 