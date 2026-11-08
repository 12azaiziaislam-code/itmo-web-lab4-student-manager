# ITMO University - Web Programming Lab №4: Student Management System (Vue 3 + Pinia + RxJS + Spring Boot 3)

## Overview
This repository contains the foundational baseline and implementation for **ITMO University Web Programming Course - Laboratory Work №4**. 

The project is an enterprise-grade **Student Management System** developed with a decoupled microservice-ready architecture featuring a reactive Single Page Application (SPA) frontend and a secure RESTful backend.

---

## Architecture & Technology Stack

### Backend
- **Framework:** Spring Boot 3 (Java 17+)
- **Data Access:** jOOQ (Type-safe SQL query generation and execution)
- **Database:** PostgreSQL 17
- **Database Migrations:** Flyway
- **Security:** Spring Security 6 + JWT (Stateless token-based authentication with Access and Refresh tokens)
- **Validation:** Jakarta Validation (`@Valid`, constraints)
- **API Documentation:** SpringDoc OpenAPI 3 / Swagger UI

### Frontend (To be scaffolded in Lab 4)
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **State Management:** Pinia
- **Reactive Stream Handling:** RxJS
- **Bundler & Tooling:** Vite + TypeScript / Modern JavaScript

---

## Project Structure

```text
.
├── backend/                               # Spring Boot 3 backend service
│   ├── Dockerfile                         # Backend container build specification
│   ├── pom.xml                            # Maven dependencies & build configuration
│   └── src/
│       └── main/
│           ├── java/ru/itmo/studentmanager/
│           │   ├── config/                # Security & OpenAPI configuration
│           │   ├── controller/            # REST Controllers (Auth, Student)
│           │   ├── dto/                   # Data Transfer Objects
│           │   ├── exception/             # Global error handling & custom exceptions
│           │   ├── model/                 # Domain Records & Entities (Student, User, RefreshToken)
│           │   ├── repository/            # jOOQ Database Access Layer
│           │   ├── security/              # JWT provider, filter, and user details service
│           │   └── service/               # Business logic services
│           └── resources/
│               ├── application.yml        # Application runtime properties
│               └── db/migration/          # Flyway SQL migrations
├── docker-compose.yml                     # Multi-container orchestration (PostgreSQL + Backend)
├── .env.example                           # Template for required environment variables
├── .gitignore                             # Comprehensive Git ignore rules
├── StudentManager.postman_collection.json # Ready-to-import Postman API test collection
└── README.md                              # Project documentation
```

---

## Quick Start

### 1. Environment Setup
Copy `.env.example` to create your local `.env` configuration:
```bash
cp .env.example .env
```

Default configuration variables:
- `DB_URL`: `jdbc:postgresql://localhost:5432/student_db`
- `DB_USERNAME`: `postgres`
- `DB_PASSWORD`: `postgres`
- `JWT_SECRET`: 256-bit secure key
- `JWT_ACCESS_EXPIRATION_MS`: `900000` (15 minutes)
- `JWT_REFRESH_EXPIRATION_MS`: `604800000` (7 days)

### 2. Running with Docker Compose
Start PostgreSQL, Backend, and Frontend services with a single command:
```bash
docker compose up --build -d
```
- **Frontend SPA:** `http://localhost:8081`
- **Backend API & Swagger UI:** `http://localhost:8080/swagger-ui.html`

To stop containers:
```bash
docker compose down
```

### 3. Running Locally for Development

**Backend:**
Ensure PostgreSQL is running on port `5432`, then:
```bash
cd backend
mvn clean spring-boot:run
```

**Frontend:**
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Accessible at `http://localhost:3000` (API calls are proxied to `http://localhost:8080`).

---

## API Documentation & Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user account (`USER` or `ADMIN`)
- `POST /api/auth/login` - Authenticate and retrieve Access + Refresh tokens
- `POST /api/auth/refresh` - Rotate and issue new Access token using Refresh token

### Students (`/api/students`)
- `GET /api/students` - Retrieve filtered students (supports query parameters: `fullName`, `group`, `dormitoryNumber`, `room`, `isuId`, `sortBy`, `order`, `limit`, `offset`)
- `POST /api/students/search` - Search students with JSON query body
- `GET /api/students/{isuId}` - Retrieve student dossier by ISU ID
- `POST /api/students` - Create a new student (requires `ADMIN` role)
- `PUT /api/students/{isuId}` / `PATCH /api/students/{isuId}` - Update existing student record (requires `ADMIN` role)
- `DELETE /api/students/{isuId}` - Remove student record (requires `ADMIN` role)

---

## Default Accounts
- **Admin:** `admin` / `admin123` (`ADMIN` role)
- **User:** `student_user` / `user123` (`USER` role)

