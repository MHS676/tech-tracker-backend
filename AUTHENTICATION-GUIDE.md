# 🔐 Authentication System - Complete Guide

## ✅ Features Implemented

### 1. JWT Bearer Token Authentication
- 24-hour token expiration
- Role-based access control (Admin vs Technician)
- Secure password hashing with bcrypt

### 2. Admin Capabilities
- ✅ Register and login
- ✅ Create other admins
- ✅ Create technicians
- ✅ Assign jobs to technicians
- ✅ View all jobs and admins

### 3. Technician Capabilities
- ✅ Register and login
- ✅ View assigned jobs
- ✅ Accept, start, and complete jobs
- ✅ Toggle location tracking
- ✅ View location history

---

## 🔑 Authentication Endpoints

### Public Endpoints (No Token Required)

#### 1. Admin Register
```bash
POST /api/admin/register
Content-Type: application/json

{
  "name": "Super Admin",
  "email": "superadmin@test.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "admin": {
    "id": "...",
    "name": "Super Admin",
    "email": "superadmin@test.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin"
}
```

#### 2. Admin Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "superadmin@test.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "admin": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "expiresIn": "24h"
}
```

#### 3. Technician Register
```bash
POST /api/technician/register
Content-Type: application/json

{
  "name": "New Technician",
  "email": "tech@test.com",
  "password": "tech123"
}

Response:
{
  "success": true,
  "technician": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "technician"
}
```

#### 4. Technician Login
```bash
POST /api/technician/login
Content-Type: application/json

{
  "email": "tech@test.com",
  "password": "tech123"
}

Response:
{
  "success": true,
  "technician": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "technician",
  "expiresIn": "24h"
}
```

---

## 🔒 Protected Endpoints (Require Bearer Token)

### Admin Only Endpoints

#### 1. Create Another Admin
```bash
POST /api/admin/create-admin
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Second Admin",
  "email": "admin2@test.com",
  "password": "admin123"
}
```

#### 2. Create Technician
```bash
POST /api/admin/create-technician
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Technician",
  "email": "newtech@test.com",
  "password": "tech123"
}
```

#### 3. Assign Job
```bash
POST /api/admin/assign-job
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Fix Network",
  "description": "Router issue",
  "address": "123 Main St",
  "adminId": "<admin_id>",
  "techId": "<tech_id>"
}
```

### Technician Only Endpoints

#### 1. Accept Job
```bash
PUT /api/jobs/:id/accept
Authorization: Bearer <tech_token>
```

#### 2. Start Job (Enable Tracking)
```bash
PUT /api/jobs/:id/start
Authorization: Bearer <tech_token>
Content-Type: application/json

{
  "techId": "<tech_id>"
}
```

#### 3. Complete Job (Disable Tracking)
```bash
PUT /api/jobs/:id/complete
Authorization: Bearer <tech_token>
Content-Type: application/json

{
  "techId": "<tech_id>"
}
```

#### 4. Toggle Tracking
```bash
PUT /api/technician/:id/toggle-tracking
Authorization: Bearer <tech_token>
Content-Type: application/json

{
  "isTracking": true
}
```

### Any Authenticated User

#### Get All Jobs
```bash
GET /api/jobs
Authorization: Bearer <any_token>
```

#### Get Job by ID
```bash
GET /api/jobs/:id
Authorization: Bearer <any_token>
```

#### Get Location History
```bash
GET /api/technician/:id/location-history
Authorization: Bearer <any_token>
```

---

## 🧪 Testing in Postman

### Setup (One Time)

1. **Import Collection:**
   - Import `Tech-Tracker-API-Auth.postman_collection.json`

2. **Collection Authorization:**
   - The collection is pre-configured to use Bearer Token
   - Token automatically comes from `{{auth_token}}` variable

### Workflow

#### Step 1: Admin Login
```
1. Open "🔐 Authentication" → "Admin Login"
2. Click "Send"
3. Token is automatically saved to auth_token variable
```

#### Step 2: Create Technician (as Admin)
```
1. Open "👨‍💼 Admin Protected" → "Create Technician (Admin Only)"
2. Click "Send" (uses admin token automatically)
3. New technician created!
```

#### Step 3: Technician Login
```
1. Open "🔐 Authentication" → "Technician Login"
2. Update email to the new technician
3. Click "Send"
4. Token is automatically saved (overwrites auth_token)
```

#### Step 4: Test Technician Endpoints
```
1. Open "👷 Technician Protected" → "Accept Job"
2. Click "Send" (uses tech token automatically)
```

### Token Management

The collection has **auto-save scripts** that handle tokens:

- **Admin Login** → Saves to `admin_token` and `auth_token`
- **Tech Login** → Saves to `tech_token` and `auth_token`
- **Current Token** → Always in `auth_token`

To switch between roles:
- Run "Admin Login" to use admin token
- Run "Technician Login" to use tech token

---

## 🎯 Current Test Accounts

### Admin Account
```
Email: superadmin@test.com
Password: admin123
ID: d87c5789-8d58-4a31-b9b3-b20d82ab267b
Token: (get via login)
```

### Technician Account
```
Email: newtech@test.com
Password: tech123
ID: e3d9e9db-7d44-4321-b9ff-12a10805eb87
Token: (get via login)
```

---

## 🔐 Security Features

### Password Security
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Passwords never returned in responses
- ✅ Cannot retrieve plain text passwords

### Token Security
- ✅ JWT with HS256 algorithm
- ✅ 24-hour expiration
- ✅ Contains: user ID, email, role
- ✅ Secret key in environment variable

### Access Control
- ✅ Admin-only routes protected with `isAdmin` middleware
- ✅ Technician-only routes protected with `isTechnician` middleware
- ✅ 401 for missing/invalid tokens
- ✅ 403 for wrong role

---

## 🛡️ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

### 401 Invalid Token
```json
{
  "success": false,
  "error": "Invalid or expired token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Admin only."
}
```

### 400 Duplicate User
```json
{
  "success": false,
  "error": "Admin already exists"
}
```

### 401 Wrong Credentials
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 🔄 Complete Workflow Example

### 1. Admin Workflow
```bash
# 1. Admin registers
POST /api/admin/register
→ Get admin_token

# 2. Admin creates another admin
POST /api/admin/create-admin
Headers: Authorization: Bearer {admin_token}

# 3. Admin creates technician
POST /api/admin/create-technician
Headers: Authorization: Bearer {admin_token}

# 4. Admin assigns job
POST /api/admin/assign-job
Headers: Authorization: Bearer {admin_token}
```

### 2. Technician Workflow
```bash
# 1. Technician logs in
POST /api/technician/login
→ Get tech_token

# 2. Technician accepts job
PUT /api/jobs/:id/accept
Headers: Authorization: Bearer {tech_token}

# 3. Technician starts job
PUT /api/jobs/:id/start
Headers: Authorization: Bearer {tech_token}

# 4. Socket.IO sends location updates
# (Socket.IO doesn't use HTTP headers, uses socket auth)

# 5. Technician completes job
PUT /api/jobs/:id/complete
Headers: Authorization: Bearer {tech_token}
```

---

## 📝 Environment Variables

Add to your `.env` file:
```
JWT_SECRET=tech-tracker-super-secret-key-2026
```

⚠️ **Important:** Change this in production!

---

## 🎉 Summary

### What's New:
- ✅ JWT authentication with Bearer tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Admin can create admins and technicians
- ✅ Secure login for both roles
- ✅ Protected routes with middleware
- ✅ Auto-saving tokens in Postman

### Usage:
1. **Import new Postman collection:** `Tech-Tracker-API-Auth.postman_collection.json`
2. **Login as Admin or Technician**
3. **Token automatically used for all requests**
4. **Switch roles by running login again**

**All endpoints now secured with JWT authentication!** 🔐
