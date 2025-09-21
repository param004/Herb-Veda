import http from 'http';

const data = JSON.stringify({
  name: 'Contact Tester',
  email: 'tester@example.com',
  subject: 'Hello from test',
  message: 'This is a test message from the local script.'
});

const options = {
  hostname: 'localhost',
  port: 5050,
  path: '/api/contact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(data);
req.end();
