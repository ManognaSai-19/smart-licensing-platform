#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  Smart Digital Licensing Platform - Production Deploy"
echo "==================================================="

echo "[1/3] Building Frontend Mobile Web Application..."
cd frontend
npm run build
cd ..

echo "[2/3] Checking Spring Boot Backend..."
cd backend
if [ ! -f "target/smart-licensing-platform-0.1.0-SNAPSHOT.jar" ]; then
    echo "Building backend JAR..."
    ./mvnw package -DskipTests
fi
cd ..

echo "[3/3] Deployment Ready!"
echo "To start full stack with Docker Compose:"
echo "  docker compose up --build -d"
echo ""
echo "To start natively:"
echo "  Backend:  cd backend && java -jar target/smart-licensing-platform-0.1.0-SNAPSHOT.jar"
echo "  Frontend: cd frontend && npm run preview -- --host 0.0.0.0 --port 5173"
echo "==================================================="
