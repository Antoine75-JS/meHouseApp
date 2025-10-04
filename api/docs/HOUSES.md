# Houses Module Documentation

## 📋 Overview

The Houses module manages household entities, member relationships, and role-based permissions within the MeHouse application. It enables users to create shared living spaces, invite members, and manage household permissions through a hierarchical role system.

### Key Features
- **House Management**: Create, update, and delete houses
- **Member Management**: Add/remove members with role-based permissions
- **Role System**: Owner and Member roles with different capabilities
- **Invitation System**: Secure invite codes for joining houses
- **Display Names**: Custom names for members within each house
- **Permission Control**: Hierarchical access control for house operations

## 🗃 Database Schema

### House Table
```sql
CREATE TABLE "houses" (
  "id" TEXT PRIMARY KEY DEFAULT uuid(),
  "name" TEXT NOT NULL,           -- House name (3-20 chars, alphanumeric + spaces)
  "description" TEXT,             -- Optional house description
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### HouseMember Table (Junction Table)
```sql
CREATE TABLE "house_members" (
  "id" TEXT PRIMARY KEY DEFAULT uuid(),
  "displayName" TEXT NOT NULL,    -- Member's display name in this house
  "role" Role NOT NULL,           -- OWNER or MEMBER
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "userId" TEXT NOT NULL,         -- Foreign key to users
  "houseId" TEXT NOT NULL,        -- Foreign key to houses

  UNIQUE("userId", "houseId"),          -- User can only be member once per house
  UNIQUE("displayName", "houseId")      -- Display name unique within house
);
```

### Role Enum
```sql
CREATE TYPE "Role" AS ENUM ('OWNER', 'MEMBER');
```

### Relationships
- **House → HouseMember**: One-to-many (house has multiple members)
- **User → HouseMember**: One-to-many (user can be member of multiple houses)
- **House → Task**: One-to-many (house contains tasks)
- **House → Category**: One-to-many (house has task categories)
- **House → Invitation**: One-to-many (house can have multiple invitations)

## 🛠 Module Structure

```
src/modules/houses/
├── houses.controller.ts     # HTTP request handlers
├── houses.service.ts        # Business logic and data operations
├── houses.schema.ts         # Zod validation schemas
└── houses.routes.ts         # Express route definitions
```

## 🔐 Authorization Hierarchy

### Role Permissions

**OWNER:**
- All MEMBER permissions
- Update house details (name, description)
- Delete house
- Remove any member
- Promote/demote members
- Cannot remove themselves if last owner

**MEMBER:**
- View house details
- View member list
- Create tasks
- View and manage assigned tasks

### Middleware Chain
```
authenticate → requireHouseMember → requireOwner (if needed)
```

## 🔌 API Endpoints

### POST /api/v1/houses
Create a new house and become its owner.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "name": "Our Awesome House",
  "description": "Family home in downtown",
  "displayName": "Dad"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "house": {
      "id": "house-uuid",
      "name": "Our Awesome House",
      "description": "Family home in downtown",
      "createdAt": "2023-10-04T10:30:00Z",
      "updatedAt": "2023-10-04T10:30:00Z"
    }
  }
}
```

**Validation Rules:**
- Name: 3-20 characters, letters/numbers/spaces only
- Description: Optional, any characters
- Display Name: 1-12 characters, unique within house

---

### GET /api/v1/houses
Get all houses where the authenticated user is a member.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "houses": [
      {
        "id": "house-uuid",
        "name": "Our Awesome House",
        "description": "Family home in downtown",
        "createdAt": "2023-10-04T10:30:00Z",
        "updatedAt": "2023-10-04T10:30:00Z",
        "memberInfo": {
          "displayName": "Dad",
          "role": "OWNER",
          "joinedAt": "2023-10-04T10:30:00Z"
        }
      }
    ]
  }
}
```

---

### GET /api/v1/houses/:id
Get detailed information about a specific house.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a member of the house

**Response (200):**
```json
{
  "success": true,
  "data": {
    "house": {
      "id": "house-uuid",
      "name": "Our Awesome House",
      "description": "Family home in downtown",
      "createdAt": "2023-10-04T10:30:00Z",
      "updatedAt": "2023-10-04T10:30:00Z",
      "members": [
        {
          "id": "member-uuid",
          "displayName": "Dad",
          "role": "OWNER",
          "createdAt": "2023-10-04T10:30:00Z",
          "user": {
            "id": "user-uuid",
            "email": "dad@example.com",
            "firstName": "John",
            "lastName": "Doe"
          }
        }
      ],
      "_count": {
        "members": 3,
        "tasks": 12
      }
    }
  }
}
```

---

### PUT /api/v1/houses/:id
Update house details (name, description).

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house OWNER

**Request Body:**
```json
{
  "name": "Updated House Name",
  "description": "New description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "house": {
      "id": "house-uuid",
      "name": "Updated House Name",
      "description": "New description",
      "createdAt": "2023-10-04T10:30:00Z",
      "updatedAt": "2023-10-04T11:00:00Z"
    }
  }
}
```

---

### DELETE /api/v1/houses/:id
Delete a house and all associated data.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house OWNER

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "House deleted successfully"
  }
}
```

**Note:** This cascades and deletes all members, tasks, categories, and invitations.

---

### GET /api/v1/houses/:id/members
Get all members of a house.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a member of the house

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "member-uuid",
        "displayName": "Dad",
        "role": "OWNER",
        "createdAt": "2023-10-04T10:30:00Z",
        "user": {
          "id": "user-uuid",
          "email": "dad@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

---

### DELETE /api/v1/houses/:id/members/:userId
Remove a member from the house.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house OWNER

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully"
  }
}
```

**Business Rules:**
- Cannot remove the last OWNER
- Tasks assigned to removed member become unassigned

---

### PUT /api/v1/houses/:id/members/:userId/role
Update a member's role (promote/demote).

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house OWNER

**Request Body:**
```json
{
  "role": "OWNER"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "member-uuid",
      "displayName": "Mom",
      "role": "OWNER",
      "createdAt": "2023-10-04T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "email": "mom@example.com",
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  }
}
```

**Business Rules:**
- Cannot demote the last OWNER
- Can promote MEMBER to OWNER
- Can demote OWNER to MEMBER (if not last owner)

## 🔧 Business Logic

### House Creation Flow
1. Validate house name and description
2. Create house record in database
3. Create house member record with OWNER role
4. Return house data

### Member Management
- **Display Names**: Must be unique within each house
- **Role Hierarchy**: OWNER > MEMBER
- **Last Owner Protection**: Cannot remove or demote the last owner
- **Membership Uniqueness**: User can only be member once per house

### Validation Rules
```typescript
// House name: 3-20 chars, alphanumeric + spaces
const houseNameRegex = /^[a-zA-Z0-9\s]+$/;

// Display name: max 12 chars, any characters
const displayNameMax = 12;

// Description: optional, any characters, reasonable length
```

## 📝 Code Examples

### Using the Houses Service
```typescript
import { HouseService } from './houses.service';

// Create house
const house = await HouseService.createHouse(
  userId,
  { name: "My House", description: "Home sweet home" },
  "My Display Name"
);

// Get user's houses
const houses = await HouseService.getUserHouses(userId);

// Update member role
await HouseService.updateMemberRole(houseId, targetUserId, "OWNER");
```

### Using House Middleware
```typescript
import { requireHouseMember, requireOwner } from '../../shared/middleware/houses.middleware';

// Member-only endpoint
router.get('/:id/tasks', authenticate, requireHouseMember, controller);

// Owner-only endpoint
router.delete('/:id', authenticate, requireHouseMember, requireOwner, controller);
```

### Accessing House Member Info
```typescript
// In controller after requireHouseMember middleware
export const someController = (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;           // From authenticate middleware
  const houseMember = req.houseMember!;   // From requireHouseMember middleware

  console.log('Member role:', houseMember.role);
  console.log('Display name:', houseMember.displayName);

  // Handle request...
};
```

## 🧪 Testing Examples

### Manual Testing with curl

**Create House:**
```bash
curl -X POST http://localhost:3000/api/v1/houses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test House",
    "description": "A test house",
    "displayName": "Owner"
  }'
```

**Get User Houses:**
```bash
curl -X GET http://localhost:3000/api/v1/houses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update House:**
```bash
curl -X PUT http://localhost:3000/api/v1/houses/HOUSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated House Name"
  }'
```

### Testing Role Permissions
1. Create house as user A (becomes OWNER)
2. Invite user B (becomes MEMBER)
3. Test that user B cannot update house details
4. Test that user A can promote user B to OWNER
5. Test that neither can be removed if they're the last OWNER

## 🚨 Error Handling

### Common Error Cases

**Forbidden (403):**
- Non-member trying to access house
- Member trying to perform owner-only action
- Trying to remove last owner

**Not Found (404):**
- House doesn't exist
- User is not a member of the house
- Target member doesn't exist

**Unprocessable Entity (422):**
- Invalid house name format
- Display name already taken in house
- Trying to demote last owner

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Cannot remove the last owner of the house",
    "code": "UNPROCESSABLE_ENTITY",
    "statusCode": 422
  }
}
```

## 🔍 Security Considerations

### Authorization Checks
- Every house endpoint requires authentication
- Member endpoints verify house membership
- Owner endpoints verify owner role
- User can only access houses they belong to

### Data Protection
- House member info only visible to house members
- User email/personal info only in member lists
- Soft constraints prevent orphaned houses

### Business Rule Enforcement
- Last owner protection at service level
- Display name uniqueness within house
- Cascade deletion for data consistency

## 🛠 Development Guidelines

### Adding New House Features

1. **Update schema** if new validation needed
2. **Add service method** with business logic
3. **Create controller method** for HTTP handling
4. **Add route** with appropriate middleware
5. **Update this documentation**

### Common Patterns

**Service Method Structure:**
```typescript
static async someMethod(houseId: string, userId: string, data: InputType) {
  // 1. Validate house exists and user is member
  // 2. Check permissions (if needed)
  // 3. Perform business logic
  // 4. Update database
  // 5. Return result
}
```

**Controller Structure:**
```typescript
static async someController(req: AuthRequest, res: Response) {
  // 1. Parse and validate parameters
  // 2. Call service method
  // 3. Return formatted response
  // Middleware handles: auth, house membership, errors
}
```

### Best Practices
- Always check house membership before operations
- Validate user permissions at service level
- Use transactions for multi-table operations
- Return consistent response formats
- Handle edge cases (last owner, etc.)

## 🐛 Common Issues

### "User is not a member of this house"
- Check that user was properly added to house
- Verify house ID in request is correct
- Confirm user wasn't removed from house

### "Display name already taken"
- Display names must be unique within each house
- Check existing members before adding new ones
- Use different display name

### "Cannot remove the last owner"
- Promote another member to owner first
- Or delete the entire house instead

### Database Constraint Violations
- Check unique constraints on userId+houseId
- Verify foreign key relationships exist
- Ensure proper transaction handling

## 📚 Related Documentation

- **[Authentication Module](./AUTH.md)** - Required for all house operations
- **[Tasks Module](./TASKS.md)** - Tasks belong to houses and require membership
- **[Main Project](../PROJECT.md)** - Overall architecture and database design

---

*This documentation covers the houses module implementation. For questions or improvements, please contact the development team.*