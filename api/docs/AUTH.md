# Authentication Module Documentation

## 📋 Overview

The Authentication module handles user registration, login, and JWT-based authentication for the MeHouse API. It provides secure user account management and session handling using industry-standard practices.

### Key Features
- **User Registration**: Create new user accounts with validation
- **User Authentication**: Login with email/password
- **JWT Tokens**: Stateless authentication with JSON Web Tokens
- **Password Security**: bcrypt hashing with salt
- **Profile Management**: Basic user profile information
- **Input Validation**: Comprehensive request validation with Zod

## 🗃 Database Schema

### User Table
```sql
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,  -- bcrypt hashed
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "avatar" TEXT,             -- Optional profile picture URL
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Relationships
- **User → HouseMember**: One user can be member of multiple houses
- **User → Invitation**: Users can use invitations to join houses

## 🛠 Module Structure

```
src/modules/auth/
├── auth.controller.ts      # HTTP request handlers
├── auth.service.ts         # Business logic and data operations
├── auth.schemas.ts         # Zod validation schemas
└── auth.routes.ts          # Express route definitions
```

## 🔌 API Endpoints

### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "createdAt": "2023-10-04T10:30:00Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Validation Rules:**
- Email: Required, valid format, automatically lowercased
- Password: Minimum 8 characters
- First/Last Name: Required, trimmed whitespace

**Error Cases:**
- `422` - Validation errors (invalid email, short password, etc.)
- `409` - Email already exists

---

### POST /api/v1/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null
    },
    "token": "jwt-token-here"
  }
}
```

**Error Cases:**
- `401` - Invalid email or password
- `422` - Validation errors

---

### GET /api/v1/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "createdAt": "2023-10-04T10:30:00Z"
    }
  }
}
```

**Error Cases:**
- `401` - Missing or invalid token
- `404` - User not found

## 🔒 Security Implementation

### Password Hashing
```typescript
import bcrypt from 'bcryptjs';

// During registration
const hashedPassword = await bcrypt.hash(password, 12);

// During login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1696410600,
  "exp": 1697015400
}
```

**Token Configuration:**
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable)
- **Secret**: Environment variable `JWT_SECRET`

### Middleware Authentication
```typescript
// Usage in routes
router.get('/protected', authenticate, controller);

// Middleware adds user to request
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
```

## 📝 Code Examples

### Using the Auth Service
```typescript
import { AuthService } from './auth.service';

// Register new user
const result = await AuthService.registerUser({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Login user
const loginResult = await AuthService.loginUser({
  email: 'user@example.com',
  password: 'password123'
});
```

### Using Auth Middleware
```typescript
import { authenticate } from '../../shared/middleware/auth.middleware';

// Protect routes
router.get('/profile', authenticate, (req: AuthRequest, res) => {
  const userId = req.user!.id; // Type-safe user access
  // Handle authenticated request
});
```

### Custom Validation
```typescript
import { registerSchema } from './auth.schemas';

// Validate data
try {
  const validData = registerSchema.parse(userData);
} catch (error) {
  // Handle validation errors
}
```

## 🧪 Testing Examples

### Manual Testing with curl

**Register User:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Postman Collection
Create requests for:
1. Register user
2. Login user (save token to environment)
3. Get profile (use saved token)

## 🔧 Configuration

### Environment Variables
```env
# JWT Configuration
JWT_SECRET="your-super-secret-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Database (for Prisma)
DATABASE_URL="postgresql://user:pass@localhost:5432/database"
```

### JWT Secret Requirements
- Minimum 32 characters
- Use cryptographically secure random string
- Keep secret in production
- Rotate periodically

## 🚨 Error Handling

### Custom Error Types
```typescript
// Authentication errors
throw new UnauthorizedError('Invalid credentials');

// Validation errors
throw new UnprocessableEntityError('Invalid email format');

// Duplicate email
throw new ConflictError('Email already exists');
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "UNAUTHORIZED",
    "statusCode": 401
  }
}
```

## 🔍 Common Patterns

### Service Layer Pattern
```typescript
export class AuthService {
  static async registerUser(data: RegisterInput) {
    // 1. Validate input (handled by controller)
    // 2. Check if user exists
    // 3. Hash password
    // 4. Create user in database
    // 5. Generate JWT token
    // 6. Return user + token
  }
}
```

### Controller Pattern
```typescript
export const register = async (req: Request, res: Response) => {
  // 1. Validate request body
  // 2. Call service method
  // 3. Return formatted response
  // 4. Error handling via middleware
};
```

### Middleware Pattern
```typescript
export const authenticate = async (req, res, next) => {
  // 1. Extract token from header
  // 2. Verify and decode JWT
  // 3. Fetch user from database
  // 4. Attach user to request
  // 5. Call next() or throw error
};
```

## 🛠 Development Guidelines

### Adding New Auth Features

1. **Add validation schema** in `auth.schemas.ts`
2. **Implement business logic** in `auth.service.ts`
3. **Create controller method** in `auth.controller.ts`
4. **Add route** in `auth.routes.ts`
5. **Update this documentation**

### Security Best Practices

1. **Always hash passwords** - Never store plain text
2. **Validate all inputs** - Use Zod schemas
3. **Use HTTPS in production** - Protect token transmission
4. **Set appropriate CORS** - Limit API access
5. **Rate limiting** - Prevent brute force attacks
6. **Log authentication events** - Monitor for suspicious activity

### Code Quality

- **Type safety**: Use TypeScript interfaces
- **Error handling**: Throw appropriate error types
- **Input validation**: Validate with Zod schemas
- **Consistent responses**: Follow API response format
- **Documentation**: Keep JSDoc comments updated

## 🐛 Debugging

### Common Issues

**"Invalid token" errors:**
- Check token format: `Bearer <token>`
- Verify JWT_SECRET matches
- Check token expiration
- Ensure user still exists

**"User not found" errors:**
- Verify user ID in token payload
- Check database connection
- Confirm user wasn't deleted

**Validation errors:**
- Review Zod schema requirements
- Check request body format
- Verify required fields

### Debug Commands
```bash
# View database users
pnpm prisma:studio

# Debug JWT tokens (online tool)
# https://jwt.io

# Test API endpoints
# Use Postman or curl examples above
```

## 📚 Related Documentation

- **[Houses Module](./HOUSES.md)** - House membership after authentication
- **[Tasks Module](./TASKS.md)** - Task access requires authentication
- **[Main Project](../PROJECT.md)** - Overall architecture and setup

---

*This documentation covers the authentication module implementation. For questions or improvements, please contact the development team.*