#!/bin/bash

# Health & Fitness Advisor Deployment Script

echo "🚀 Starting deployment process..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found. Please create one before deploying."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize database
echo "🗄️ Initializing database..."
npm run init-db

# Check if database initialization was successful
if [ $? -ne 0 ]; then
  echo "❌ Error: Database initialization failed."
  exit 1
fi

# Start the server
echo "🌐 Starting server..."

# Check if PM2 is installed (for production)
if command -v pm2 &> /dev/null; then
  echo "✅ Using PM2 to start the server..."
  pm2 start server.js --name "health-fitness-advisor"
else
  echo "ℹ️ PM2 not found. Starting server with Node directly..."
  if [ "$NODE_ENV" = "production" ]; then
    echo "⚠️ Warning: Running in production mode without PM2 is not recommended."
  fi
  node server.js
fi

echo "✅ Deployment completed successfully!"
echo "🌍 The application is now running." 