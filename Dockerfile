# Multi-stage Dockerfile: React Mobile PWA + Spring Boot REST API in One Free Container

# Stage 1: Build React Mobile Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend with embedded static frontend
FROM maven:3.9.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src
# Copy compiled frontend into Spring Boot static web directory
COPY --from=frontend-builder /app/frontend/dist/ ./backend/src/main/resources/static/
WORKDIR /app/backend
RUN mvn package -DskipTests

# Stage 3: Lightweight Production JRE Runner (Optimized for 512MB RAM free tiers)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/smart-licensing-platform-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENV PORT=8080
# Restrain JVM heap memory to 384MB to fit comfortably in free tier limits
ENTRYPOINT ["java", "-Xmx384m", "-Xms128m", "-jar", "app.jar"]
