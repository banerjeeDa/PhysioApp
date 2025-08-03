#!/bin/bash

# PhysioCheck Server Startup Script
# This script helps configure and start the PhysioCheck server with proper port forwarding

echo "🚀 Starting PhysioCheck Assessment Server..."

# Set default environment variables
export PORT=${PORT:-3001}
export HOST=${HOST:-0.0.0.0}
export NODE_ENV=${NODE_ENV:-development}

echo "📋 Configuration:"
echo "   Port: $PORT"
echo "   Host: $HOST"
echo "   Environment: $NODE_ENV"

# Check if the application is built
if [ ! -d "dist" ]; then
    echo "🔨 Building application..."
    npm run build
fi

# Start the server
echo "🌐 Starting server..."
echo "   Local access: http://localhost:$PORT"
echo "   Network access: http://$HOST:$PORT"
echo "   Admin dashboard: http://$HOST:$PORT/admin"
echo ""

# Start the server
npm start 