# Property Management System

A full-stack property management system built with **Node.js**, **Express**, **PostgreSQL**, and **Angular**.

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/property-management-system.git
cd property-management-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Create a `.env` File
In the `backend/` directory, add a `.env` file:
```
PORT =
DATABASE_URL =
JWT_SECRET =
JWT_REFRESH_SECRET=
FRONTEND_URL =
NODE_ENV =

DB_HOST = 
DB_PORT = 
DB_USER = 
DB_PASSWORD = 
DB_NAME = 

SMTP_HOST =
SMTP_PORT =
SMTP_USER = 
SMTP_PASSWORD = 
FROM_EMAIL = 
FROM_NAME =
```

### 5. Run PostgreSQL & Setup the Database
Use the provided SQL scripts to set up the database schema:
```bash
node ./src/db/init-db.ts
```

### 7. Start the Backend
```bash
npm run dev
```

### 8. Frontend Setup (React)
```bash
cd ../frontend
npm install
ng serve
```

## 🧩 Database Schema Overview

**Tables:**

### `users`
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  refresh_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `properties`
```sql
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY, 
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    property_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### `floors`
```sql
CREATE TABLE IF NOT EXISTS floors (
  id SERIAL PRIMARY KEY,
  property_id INT REFERENCES properties(id) ON DELETE CASCADE,
  floor_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, floor_number)
);
```

### `units`
```sql
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  floor_id INT REFERENCES floors(id) ON DELETE CASCADE,
  unit_number INT NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(floor_id, unit_number)
);
```


## 🔌 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive JWT tokens |
| POST | `/api/v1/auth/refresh-token` | Get a new access token using refresh token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/logout` | Logout |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/properties` | Add new property |
| GET | `/api/v1/properties/:id/details` | Get detail of particular property by ID |
| GET | `/api/v1/properties/all-properties` | Get all properties|
|
### Floors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/floors` | Add a new floor |


### Units
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/units/available/:property_id` | Get available units |
| POST | `/api/v1/units` | Add unit to a floor |
| PUT | `/api/v1/units/:id/book` | Toggle unit (between book and available) |

## 🔐 Security Features
- JWT-based authentication system with access and refresh tokens
- Passwords hashed using bcrypt
- Role-based access control (Admin/Manager/User)
- Validation middleware for request data


## 🛠️ Tech Stack
- **Backend**: Node.js, Express
- **Frontend**: React, Redux (or Context API)
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Zod

## 🧑‍💻 Author
Maintained by [Atulya]