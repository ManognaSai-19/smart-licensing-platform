@echo off
echo ===================================================
echo   Smart Digital Licensing Platform - Production Deploy
echo ===================================================

echo [1/3] Building Frontend Mobile Web Application...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Frontend build failed.
    exit /b %ERRORLEVEL%
)
cd ..

echo [2/3] Checking Spring Boot Backend...
cd backend
if not exist "target\smart-licensing-platform-0.1.0-SNAPSHOT.jar" (
    echo Building backend JAR...
    call .\mvnw.cmd package -DskipTests
)
cd ..

echo [3/3] Deployment Ready!
echo To run backend:
echo   cd backend ^&^& java -jar target\smart-licensing-platform-0.1.0-SNAPSHOT.jar
echo To run frontend preview server:
echo   cd frontend ^&^& npm run preview -- --host 0.0.0.0 --port 5173
echo.
echo Mobile access on local Wi-Fi: http://10.212.150.210:5173
echo ===================================================
pause
