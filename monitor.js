const https = require('https');
const http = require('http');

const config = {
  url: process.env.APP_URL || 'https://healthtrackhub.com',
  interval: process.env.CHECK_INTERVAL || 300000, // 5 minutes
  timeout: process.env.TIMEOUT || 5000, // 5 seconds
  retries: process.env.MAX_RETRIES || 3
};

let consecutiveFailures = 0;

function checkHealth() {
  const protocol = config.url.startsWith('https') ? https : http;
  
  const req = protocol.get(`${config.url}/health`, {
    timeout: config.timeout
  }, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        if (res.statusCode === 200 && health.status === 'healthy') {
          console.log(`✅ Health check passed at ${new Date().toISOString()}`);
          consecutiveFailures = 0;
        } else {
          handleFailure('Invalid health check response');
        }
      } catch (error) {
        handleFailure('Failed to parse health check response');
      }
    });
  });
  
  req.on('error', (error) => {
    handleFailure(`Health check failed: ${error.message}`);
  });
  
  req.on('timeout', () => {
    req.destroy();
    handleFailure('Health check timed out');
  });
}

function handleFailure(error) {
  consecutiveFailures++;
  console.error(`❌ ${error}`);
  console.error(`Consecutive failures: ${consecutiveFailures}`);
  
  if (consecutiveFailures >= config.retries) {
    console.error('🚨 Maximum retries reached. Application may be down!');
    // Here you could add notification logic (email, SMS, etc.)
    process.exit(1);
  }
}

// Start monitoring
console.log(`🔍 Starting health monitoring for ${config.url}`);
console.log(`⏱️ Check interval: ${config.interval / 1000} seconds`);
console.log(`⌛ Timeout: ${config.timeout / 1000} seconds`);
console.log(`🔄 Max retries: ${config.retries}`);

checkHealth();
setInterval(checkHealth, config.interval); 