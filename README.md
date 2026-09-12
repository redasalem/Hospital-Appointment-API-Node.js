<p align="center">
  <h1 align="center">🏥 Hospital Appointment API</h1>
  <p align="center">
    A comprehensive RESTful API for managing hospital appointments, built with Node.js, Express, and MongoDB.
    <br />
    <strong>Team 5 · HAA Project</strong>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-v9-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [API Endpoints](#-api-endpoints)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Team Members](#-team-members)

---

## 📖 Project Description

The **Hospital Appointment API** is a backend system designed to streamline the process of scheduling, managing, and tracking hospital appointments. It provides secure endpoints for:

- 🔐 Patient registration & authentication with role-based access control
- 👨‍⚕️ Doctor profile management with specialization & working hours
- 📅 Appointment booking with double-booking prevention
- 🤖 AI-powered symptom summarization using Google Gemini

---

## ✨ Features

> **Status:** Features are being implemented incrementally across the team.

| Feature | Status | Assignee |
| ------- | ------ | -------- |
| JWT Authentication & Authorization | ✅ Done | Karim Khaled Ismail |
| Doctor Profile Management (CRUD) | ✅ Done | Reda Salem |
| Appointment Lifecycle Management | ✅ Done | Mousa Ahmed |
| Gemini AI Symptom Summarization | ✅ Done | Heba Abd El Kreem |
| Swagger API Documentation | ✅ Done | — |
| Role-Based Access Control (admin, doctor, patient) | ✅ Done | Karim Khaled Ismail |
| Input Validation & Error Handling | ✅ Done | All |

---

## 🔗 API Endpoints

### 🔐 Authentication (`HAA-3`)

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/auth/register` | Register a patient |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/auth/me` | Get the current user |

### 👨‍⚕️ Doctor Management (`HAA-4`)

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/doctors` | Create a doctor |
| `GET` | `/api/doctors` | List doctors |
| `GET` | `/api/doctors/:id` | Get a doctor |
| `PATCH` | `/api/doctors/:id` | Update a doctor |
| `DELETE` | `/api/doctors/:id` | Delete a doctor |

### 📅 Appointment Management (`HAA-5`)

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/appointments` | Book an appointment |
| `GET` | `/api/appointments` | List all appointments (Admin only) |
| `GET` | `/api/appointments/my` | Get current user's appointments |
| `GET` | `/api/appointments/:id` | Get a permitted appointment (Admin may view any) |
| `PATCH` | `/api/appointments/:id/status` | Update appointment status |
| `POST` | `/api/appointments/:id/cancel` | Cancel an eligible appointment |

### 🤖 Gemini AI Feature (`HAA-6`)

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/ai/summarize-symptoms` | Summarize supplied symptoms without diagnosis |

---

## 🛠 Tech Stack

| Category | Technology | Version |
| -------- | ---------- | ------- |
| **Runtime** | Node.js | 20+ |
| **Framework** | Express.js | 5.2.x |
| **Database** | MongoDB (Mongoose ODM) | 9.9.x |
| **Authentication** | JSON Web Tokens (JWT) | 9.0.x |
| **Password Hashing** | bcrypt.js | 3.0.x |
| **API Docs** | Swagger (swagger-jsdoc + swagger-ui-express) | 6.3.x / 5.0.x |
| **AI Integration** | Google Gemini API | *Approach TBD* |
| **Dev Tools** | Nodemon | 3.1.x |

---

## 📁 Project Structure

```
hospital-appointment/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── swagger.js         # Swagger/OpenAPI setup
│   ├── models/                # Mongoose schemas
│   ├── controllers/           # Route handlers
│   ├── routes/                # Express route definitions
│   ├── middlewares/           # Auth, error handling, validation
│   ├── services/              # Business logic layer
│   ├── validators/            # Input validation rules
│   ├── utils/                 # Helper functions
│   └── app.js                 # Express app configuration
├── server.js                  # Entry point
├── docs/
│   └── swagger.yaml           # OpenAPI specification
├── postman/
│   └── HospitalAppointmentAPI.postman_collection.json
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **MongoDB** (local or cloud via [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v10+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-appointment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and fill in the required values (see below).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production**
   ```bash
   npm start
   ```

The server will start at `http://localhost:<PORT>` (default: `5000`).

---

## 🔑 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Application environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/hospital-db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration duration | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CLIENT_URL` | Frontend client URL (for CORS) | `http://localhost:3000` |
| `ADMIN_NAME` | Initial-admin display name (seed command) | `Initial Admin` |
| `ADMIN_EMAIL` | Initial-admin email (seed command) | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial-admin password (seed command) | `strong-password` |

Public registration supports `patient` and `doctor` roles only. Run `npm run seed:admin`
with the three `ADMIN_*` variables to create or update the initial administrator. An
administrator links each Doctor account to its doctor profile by supplying the `user`
field when creating or updating that profile. Logging out revokes the current JWT.

---

## 📚 API Documentation

> Interactive API documentation will be fully available once all endpoints are implemented.

**Swagger UI** is accessible at:
```
http://localhost:5000/api-docs
```

**Health Check** endpoint (available now):
```http
GET /health
Response: { "status": "ok" }
```

---

## 👥 Team Members

| Name | Role | Jira Task |
| ---- | ---- | --------- |
| **Mousa Ahmed** | Project Lead · Appointment Management | `HAA-5` |
| **Karim Khaled Ismail** | Authentication & Authorization | `HAA-3` |
| **Reda Salem** | Doctor Management | `HAA-4` |
| **Heba Abd El Kreem** | Gemini AI Integration | `HAA-6` |

---

<p align="center">
  Made with ❤️ by <strong>Team 5</strong>
</p>
