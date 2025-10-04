# MeHouse API - Project Documentation

## 🏠 Project Overview

MeHouse is a full-stack house management application that helps household members organize tasks, manage responsibilities, and coordinate activities. The project consists of a Node.js/TypeScript backend API and a React Native mobile application.

### Purpose
- **Task Management**: Create, assign, and track household tasks
- **Member Management**: Manage house members with role-based permissions
- **Organization**: Categorize tasks and set priorities
- **Collaboration**: Multi-member task assignments and status tracking

## 🛠 Technology Stack

### Backend (API)
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5.1
- **Database**: PostgreSQL
- **ORM**: Prisma 6.16+
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod 4.1+
- **Password Hashing**: bcryptjs
- **Package Manager**: pnpm

### Development Tools
- **Hot Reload**: tsx
- **Linting**: ESLint with TypeScript, security, and Prettier configs
- **Type Checking**: TypeScript strict mode
- **Database Tools**: Prisma Studio, migrations

## 🏗 Architecture Overview

### Project Structure
```
/api
├── src/
│   ├── modules/              # Feature modules (domain-driven design)
│   │   ├── auth/            # Authentication & authorization
│   │   ├── houses/          # House management
│   │   └── tasks/           # Task management
│   ├── shared/              # Shared utilities and middleware
│   │   ├── errors/          # Error handling classes
│   │   ├── middleware/      # Express middleware
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper utilities
│   ├── config/              # Configuration files
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migration files
├── package.json
└── tsconfig.json
```

### Design Patterns
- **Domain-Driven Design**: Each module represents a business domain
- **Service-Controller Pattern**: Business logic in services, HTTP handling in controllers
- **Middleware Pattern**: Authentication, authorization, and validation middleware
- **Error-First Pattern**: Consistent error handling throughout the application

### Database Design
- **Relational Model**: PostgreSQL with properly normalized tables
- **Many-to-Many Relationships**: Flexible task assignments and house memberships
- **Role-Based Access**: Owner/Member roles with hierarchical permissions
- **Soft Constraints**: Business rules enforced at application level

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 12 or higher
- pnpm package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

4. **Database setup**
   ```bash
   # Run migrations
   pnpm prisma:migrate

   # Generate Prisma client
   pnpm prisma:generate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/me_house"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
```

## 📚 API Structure

### Base URL
```
http://localhost:3000/api/v1
```

### Standard Response Format
```json
{
  "success": true,
  "data": {
    // Response payload
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

## 🗃 Database Overview

### Core Entities

#### User
- Personal user account information
- Authentication credentials
- Profile data (firstName, lastName, avatar)

#### House
- Shared living space/household
- Has multiple members with roles
- Contains tasks and categories

#### HouseMember
- Junction table for User-House relationship
- Role-based permissions (OWNER, MEMBER)
- Display name unique within house

#### Task
- Household tasks and to-dos
- Support for multiple assignees
- Status tracking, priorities, due dates
- Optional categorization

#### TaskAssignee
- Many-to-many relationship between tasks and house members
- Tracks when assignments were made

#### Category
- Task organization and grouping
- House-specific categories
- Optional color coding

#### Invitation
- House invitation system
- Time-limited invitation codes
- Track invitation usage

### Relationships Diagram
```
User 1:N HouseMember N:1 House
HouseMember 1:N TaskAssignee N:1 Task
House 1:N Task
House 1:N Category
Category 1:N Task
House 1:N Invitation
HouseMember 1:N Invitation (created)
User 1:N Invitation (used)
```

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers/logs in with email/password
2. Server validates credentials and returns JWT token
3. Client includes token in Authorization header for protected routes
4. Server validates token and attaches user info to request

### Authorization Levels
- **Public**: Health check, auth endpoints
- **Authenticated**: Requires valid JWT token
- **House Member**: Must be member of the house being accessed
- **House Owner**: Must be owner of the house for admin operations

### Middleware Chain
```
Request → authenticate → requireHouseMember → requireOwner → Controller
```

## 🧪 Development Workflow

### Available Scripts
```bash
# Development
pnpm dev                    # Start with hot reload
pnpm build                  # Build TypeScript
pnpm start                  # Run production build

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open database GUI

# Code Quality
pnpm lint                   # Run ESLint
pnpm format                 # Format with Prettier
```

### Code Standards
- **TypeScript**: Strict mode enabled, no implicit any
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **File Organization**: Group by feature, not by file type
- **Error Handling**: Use custom error classes, consistent error responses
- **Validation**: Validate all inputs with Zod schemas

### Git Workflow
1. Create feature branch from main
2. Make changes with descriptive commits
3. Ensure all tests pass and code builds
4. Create pull request for code review
5. Merge to main after approval

## 📖 Module Documentation

Each module has detailed documentation:

- **[Authentication Module](./docs/AUTH.md)** - User registration, login, JWT handling
- **[Houses Module](./docs/HOUSES.md)** - House management, members, roles
- **[Tasks Module](./docs/TASKS.md)** - Task CRUD, assignments, filtering

## 🐛 Error Handling

### Custom Error Classes
- `AppError`: Base error class with status codes
- `NotFoundError`: 404 errors
- `UnprocessableEntityError`: 422 validation errors
- `ForbiddenError`: 403 authorization errors

### Error Middleware
Global error handler catches all errors and formats consistent responses.

## 🔍 Debugging

### Logging
- Development: Console logging with request details
- Production: Structured logging (configure as needed)

### Database Debugging
```bash
# Open Prisma Studio for visual database exploration
pnpm prisma:studio

# View generated SQL queries
DEBUG=prisma:query pnpm dev
```

## 🚀 Deployment

### Build Process
```bash
pnpm build
```

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set secure JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging

## 📝 Contributing

### Before Starting Development
1. Read this documentation thoroughly
2. Set up local development environment
3. Review the module documentation for your feature area
4. Understand the database schema and relationships
5. Follow the established patterns and conventions

### Code Review Guidelines
- Ensure TypeScript compilation without errors
- Follow established patterns and naming conventions
- Include proper error handling and validation
- Test API endpoints manually or with Postman
- Document any new environment variables or setup steps

## 🆘 Common Issues

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists and user has permissions

### TypeScript Errors
- Run `pnpm prisma:generate` after schema changes
- Check import paths use `@/` alias correctly
- Verify all types are properly exported/imported

### Authentication Issues
- Verify JWT_SECRET is set
- Check token format in Authorization header
- Ensure user exists and is active

---

*This documentation is maintained by the development team. Please keep it updated as the project evolves.*