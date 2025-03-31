/**
 * Simple health check script for Docker
 * This checks if the app is responding on the expected port
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/tasks',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  // 2xx and 3xx status codes are considered healthy
  if (res.statusCode >= 200 && res.statusCode < 400) {
    console.log(`Health check passed: ${res.statusCode}`);
    process.exit(0);
  } else {
    console.error(`Health check failed: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();