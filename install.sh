#!/bin/bash

echo "🌌 Installing Agents Liminals Dependencies..."

# Backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend
npm install

echo "✅ Installation complete!"
echo ""
echo "To run the application:"
echo "Backend: npm run dev (from root directory)"
echo "Frontend: npm run dev (from frontend directory)"
echo ""
echo "Backend will run on http://localhost:3001"
echo "Frontend will run on http://localhost:3000"