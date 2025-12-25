// Simple healthcheck to keep Railway happy
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Healthcheck server running on port ${PORT}`);
});

export default server;
