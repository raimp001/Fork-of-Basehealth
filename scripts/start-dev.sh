#!/bin/bash

# Start the signaling server in the background
echo "Starting signaling server..."
node server/signaling-server.ts &
SIGNALING_PID=$!

# Start the Next.js development server
echo "Starting Next.js development server..."
npm run dev

# When Next.js server is stopped, also stop the signaling server
kill $SIGNALING_PID 