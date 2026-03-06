# ShareSphere Backend API

Backend API for ShareSphere social media platform with MongoDB authentication.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- User profile management
- Role-based access control (user/admin)
- NID verification support

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sharesphere
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

4. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/health` | Server health check | Public |

## API Request Examples

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "",
    "bio": "",
    "role": "user",
    "isVerified": false,
    "token": "jwt_token"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "",
    "bio": "",
    "role": "user",
    "isVerified": false,
    "nidVerified": false,
    "token": "jwt_token"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "",
    "bio": "",
    "role": "user",
    "isVerified": false,
    "nidVerified": false,
    "followers": [],
    "following": [],
    "createdAt": "2026-02-19T00:00:00.000Z",
    "updatedAt": "2026-02-19T00:00:00.000Z"
  }
}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Software developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "name": "John Updated",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer",
    "role": "user",
    "isVerified": false,
    "nidVerified": false
  }
}
```

### Change Password
```http
PUT /api/auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## User Model Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  avatar: String,
  bio: String (max 500 chars),
  role: String (user/admin),
  isVerified: Boolean,
  nidNumber: String,
  nidVerified: Boolean,
  followers: [ObjectId],
  following: [ObjectId],
  timestamps: true
}
```

## Middleware

### protect
Verifies JWT token and attaches user to request object.

### admin
Checks if user has admin role.

### verified
Checks if user account is verified.

## Error Handling

All errors are returned in the following format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/sharesphere |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment mode | development |

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   └── authMiddleware.js  # Auth middleware
├── models/
│   └── User.js           # User model
├── routes/
│   └── authRoutes.js     # Auth routes
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Dependencies
└── server.js            # Main server file
```

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- Password field excluded from queries by default
- Protected routes with authentication middleware
- Role-based access control
- Input validation

## Next Steps

- Add email verification
- Implement NID verification endpoints
- Add post management endpoints
- Implement chat functionality
- Add notification system
- File upload for avatars
- Rate limiting
- Advanced error handling
