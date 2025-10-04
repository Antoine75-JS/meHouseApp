# Tasks Module Documentation

## 📋 Overview

The Tasks module provides comprehensive task management functionality for households in the MeHouse application. It supports creating, assigning, tracking, and organizing household tasks with advanced features like multiple assignees, priorities, categories, and filtering.

### Key Features
- **Task CRUD Operations**: Create, read, update, and delete tasks
- **Multiple Assignees**: Assign tasks to multiple house members
- **Status Management**: Track pending and completed tasks
- **Priority System**: Low, Medium, High priority levels
- **Categories**: Organize tasks with house-specific categories
- **Due Dates**: Set optional deadlines for tasks
- **Advanced Filtering**: Filter by status, priority, assignee, category, and more
- **Pagination**: Handle large numbers of tasks efficiently
- **Permission System**: Role-based access control for task operations

## 🗃 Database Schema

### Task Table
```sql
CREATE TABLE "tasks" (
  "id" TEXT PRIMARY KEY DEFAULT uuid(),
  "title" TEXT NOT NULL,                    -- Task title (1-100 chars)
  "description" TEXT,                       -- Optional description (max 500 chars)
  "status" TaskStatus DEFAULT 'PENDING',    -- PENDING or COMPLETED
  "priority" TaskPriority DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
  "dueDate" TIMESTAMP,                      -- Optional due date
  "completedAt" TIMESTAMP,                  -- Set when status becomes COMPLETED
  "recurringPattern" JSON,                  -- Future: recurring task patterns
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),

  -- Foreign Keys
  "houseId" TEXT NOT NULL,                  -- House this task belongs to
  "categoryId" TEXT,                        -- Optional category
  "createdById" TEXT NOT NULL               -- House member who created task
);
```

### TaskAssignee Table (Junction Table)
```sql
CREATE TABLE "task_assignees" (
  "id" TEXT PRIMARY KEY DEFAULT uuid(),
  "createdAt" TIMESTAMP DEFAULT NOW(),

  -- Foreign Keys
  "taskId" TEXT NOT NULL,                   -- Task being assigned
  "houseMemberId" TEXT NOT NULL,            -- House member assigned to task

  UNIQUE("taskId", "houseMemberId")         -- One assignment per task-member pair
);
```

### Enums
```sql
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
```

### Relationships
- **Task → House**: Many-to-one (tasks belong to houses)
- **Task → Category**: Many-to-one (optional categorization)
- **Task → HouseMember**: Many-to-one (task creator)
- **Task ↔ HouseMember**: Many-to-many through TaskAssignee (multiple assignees)

## 🛠 Module Structure

```
src/modules/tasks/
├── tasks.controller.ts      # HTTP request handlers
├── tasks.service.ts         # Business logic and data operations
├── tasks.schema.ts          # Zod validation schemas
└── tasks.routes.ts          # Express route definitions
```

## 🔐 Authorization System

### Permission Levels

**Task Creation:**
- Any house member can create tasks

**Task Modification (update, status change, assignee management):**
- Task creator
- Task assignees
- House owners

**Task Deletion:**
- Task creator
- House owners (admin override)

### Access Control Flow
```
1. authenticate (verify JWT)
2. requireHouseMember (verify house membership)
3. Task-level permissions (creator/assignee/owner check)
```

## 🔌 API Endpoints

### POST /api/v1/houses/:id/tasks
Create a new task in a house.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house member

**Request Body:**
```json
{
  "title": "Clean the kitchen",
  "description": "Deep clean including appliances and floor",
  "priority": "HIGH",
  "dueDate": "2023-10-10T18:00:00Z",
  "categoryId": "category-uuid",
  "assigneeIds": ["member-uuid-1", "member-uuid-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-uuid",
      "title": "Clean the kitchen",
      "description": "Deep clean including appliances and floor",
      "status": "PENDING",
      "priority": "HIGH",
      "dueDate": "2023-10-10T18:00:00Z",
      "completedAt": null,
      "createdAt": "2023-10-04T10:30:00Z",
      "updatedAt": "2023-10-04T10:30:00Z",
      "assignees": [
        {
          "id": "assignment-uuid-1",
          "houseMember": {
            "id": "member-uuid-1",
            "displayName": "Mom",
            "user": {
              "id": "user-uuid-1",
              "firstName": "Jane",
              "lastName": "Doe"
            }
          }
        }
      ],
      "category": {
        "id": "category-uuid",
        "name": "Cleaning",
        "color": "#FF5733"
      },
      "createdBy": {
        "id": "creator-uuid",
        "displayName": "Dad",
        "user": {
          "id": "user-uuid-2",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    }
  }
}
```

**Validation Rules:**
- Title: 1-100 characters, required
- Description: Optional, max 500 characters
- Priority: LOW, MEDIUM, HIGH (default: MEDIUM)
- Due date: Must be in the future (if provided)
- AssigneeIds: Max 10 members, must be house members
- CategoryId: Must belong to the same house (if provided)

---

### GET /api/v1/houses/:id/tasks
Get tasks in a house with filtering and pagination.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house member

**Query Parameters:**
```
?status=PENDING                    # Filter by status
&priority=HIGH                     # Filter by priority
&assignedToMe=true                 # Show only tasks assigned to me
&createdByMe=true                  # Show only tasks I created
&categoryId=category-uuid          # Filter by category
&overdue=true                      # Show only overdue tasks
&page=1                           # Page number (default: 1)
&limit=20                         # Items per page (default: 20, max: 100)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Clean the kitchen",
        "status": "PENDING",
        "priority": "HIGH",
        "dueDate": "2023-10-10T18:00:00Z",
        "assignees": [...],
        "category": {...},
        "createdBy": {...}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Filtering Options:**
- **status**: PENDING or COMPLETED
- **priority**: LOW, MEDIUM, HIGH
- **assignedToMe**: Boolean, shows tasks assigned to current user
- **createdByMe**: Boolean, shows tasks created by current user
- **categoryId**: UUID, filter by specific category
- **overdue**: Boolean, shows pending tasks past due date

---

### GET /api/v1/houses/:id/tasks/:taskId
Get a specific task by ID.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be a house member

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-uuid",
      "title": "Clean the kitchen",
      "description": "Deep clean including appliances and floor",
      "status": "PENDING",
      "priority": "HIGH",
      "dueDate": "2023-10-10T18:00:00Z",
      "completedAt": null,
      "recurringPattern": null,
      "createdAt": "2023-10-04T10:30:00Z",
      "updatedAt": "2023-10-04T10:30:00Z",
      "assignees": [...],
      "category": {...},
      "createdBy": {...}
    }
  }
}
```

---

### PUT /api/v1/houses/:id/tasks/:taskId
Update task details (title, description, priority, due date, category).

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be task creator, assignee, or house owner

**Request Body:**
```json
{
  "title": "Deep clean the kitchen",
  "description": "Updated description",
  "priority": "MEDIUM",
  "dueDate": "2023-10-12T18:00:00Z",
  "categoryId": "new-category-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      // Updated task object
    }
  }
}
```

**Note:** All fields are optional. Only provided fields will be updated.

---

### PUT /api/v1/houses/:id/tasks/:taskId/status
Update task status (mark as completed or pending).

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be task creator, assignee, or house owner

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-uuid",
      "status": "COMPLETED",
      "completedAt": "2023-10-04T15:30:00Z",
      // ... rest of task object
    }
  }
}
```

**Behavior:**
- Setting status to "COMPLETED" automatically sets `completedAt` to current timestamp
- Setting status to "PENDING" clears the `completedAt` field

---

### PUT /api/v1/houses/:id/tasks/:taskId/assignees
Update task assignees (replace all current assignees).

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be task creator, assignee, or house owner

**Request Body:**
```json
{
  "assigneeIds": ["member-uuid-1", "member-uuid-3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task-uuid",
      "assignees": [
        // New assignee list
      ]
    }
  }
}
```

**Behavior:**
- Removes all existing assignees
- Adds new assignees from the provided list
- Empty array removes all assignees
- Maximum 10 assignees per task

---

### DELETE /api/v1/houses/:id/tasks/:taskId
Delete a task permanently.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Authorization:** Must be task creator or house owner

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

**Note:** This also deletes all task assignments (cascade delete).

## 🔧 Business Logic

### Task Assignment System
- **Multiple Assignees**: Tasks can have 0-10 assignees
- **Permission Model**: Assignees can modify tasks they're assigned to
- **Assignment Tracking**: Track when assignments were made
- **Flexible Assignment**: Can assign/unassign members at any time

### Status Management
- **Automatic Timestamps**: `completedAt` is automatically managed
- **Status Transitions**: Can move between PENDING ↔ COMPLETED freely
- **Completion Tracking**: Track when tasks were completed

### Permission System
```typescript
// Who can modify a task?
function canModifyTask(task, currentMember) {
  return (
    task.createdById === currentMember.id ||           // Creator
    task.assignees.some(a => a.houseMemberId === currentMember.id) || // Assignee
    currentMember.role === 'OWNER'                     // House owner
  );
}

// Who can delete a task?
function canDeleteTask(task, currentMember) {
  return (
    task.createdById === currentMember.id ||           // Creator
    currentMember.role === 'OWNER'                     // House owner
  );
}
```

### Filtering System
- **Server-side Filtering**: All filtering done at database level
- **Efficient Queries**: Uses database indexes for performance
- **Pagination**: Prevents memory issues with large task lists
- **Multiple Filters**: Can combine multiple filter criteria

## 📝 Code Examples

### Using the Tasks Service
```typescript
import { TaskService } from './tasks.service';

// Create task with multiple assignees
const task = await TaskService.createTask(
  houseId,
  creatorMemberId,
  {
    title: "Clean kitchen",
    assigneeIds: ["member1", "member2"],
    priority: "HIGH",
    dueDate: "2023-10-10T18:00:00Z"
  }
);

// Get filtered tasks
const result = await TaskService.getHouseTasks(
  houseId,
  currentUserId,
  {
    status: "PENDING",
    assignedToMe: true,
    page: 1,
    limit: 20
  }
);

// Update task status
await TaskService.updateTaskStatus(
  taskId,
  houseId,
  currentMemberId,
  { status: "COMPLETED" }
);
```

### Using Task Controllers
```typescript
// All task routes require house membership
router.post('/:id/tasks', authenticate, requireHouseMember, TaskController.createTask);

// Task modification requires additional permission check (done in service)
router.put('/:id/tasks/:taskId', authenticate, requireHouseMember, TaskController.updateTask);
```

### Client-side Usage
```typescript
// Create task
const response = await fetch('/api/v1/houses/house-id/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New task',
    assigneeIds: ['member1', 'member2']
  })
});

// Get assigned tasks
const tasks = await fetch('/api/v1/houses/house-id/tasks?assignedToMe=true');
```

## 🧪 Testing Examples

### Manual Testing with curl

**Create Task:**
```bash
curl -X POST http://localhost:3000/api/v1/houses/HOUSE_ID/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "A test task",
    "priority": "HIGH",
    "assigneeIds": ["MEMBER_ID_1", "MEMBER_ID_2"]
  }'
```

**Get Tasks with Filters:**
```bash
curl -X GET "http://localhost:3000/api/v1/houses/HOUSE_ID/tasks?status=PENDING&assignedToMe=true&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Mark Task Complete:**
```bash
curl -X PUT http://localhost:3000/api/v1/houses/HOUSE_ID/tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

**Update Assignees:**
```bash
curl -X PUT http://localhost:3000/api/v1/houses/HOUSE_ID/tasks/TASK_ID/assignees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assigneeIds": ["NEW_MEMBER_ID"]}'
```

### Testing Scenarios

1. **Permission Testing:**
   - Create task as member A
   - Try to modify as member B (should fail)
   - Assign task to member B
   - Try to modify as member B (should succeed)

2. **Assignment Testing:**
   - Create task with multiple assignees
   - Update assignees list
   - Remove all assignees
   - Try to assign non-existent member (should fail)

3. **Status Testing:**
   - Create task (status = PENDING, completedAt = null)
   - Mark complete (status = COMPLETED, completedAt = now)
   - Mark pending again (status = PENDING, completedAt = null)

4. **Filter Testing:**
   - Create tasks with different statuses, priorities, assignees
   - Test each filter option individually
   - Test filter combinations
   - Test pagination with large datasets

## 🚨 Error Handling

### Common Error Cases

**Forbidden (403):**
- Non-member trying to access house tasks
- Member trying to modify task they don't have permission for
- Non-creator/non-owner trying to delete task

**Not Found (404):**
- Task doesn't exist
- Task exists but not in the specified house

**Unprocessable Entity (422):**
- Invalid assignee IDs (not house members)
- Category doesn't belong to house
- Due date in the past
- Validation errors (title too long, etc.)

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Some assignees are not members of this house",
    "code": "UNPROCESSABLE_ENTITY",
    "statusCode": 422
  }
}
```

### Error Handling Patterns
```typescript
// Service layer error handling
if (!category || category.houseId !== houseId) {
  throw new UnprocessableEntityError(
    "Category does not belong to this house"
  );
}

// Permission checking
const canUpdate = await this.canUserModifyTask(task, currentMemberId);
if (!canUpdate) {
  throw new ForbiddenError(
    "Only task creator, assignees, or house owner can update this task"
  );
}
```

## 🔍 Performance Considerations

### Database Optimization
- **Indexes**: Added on commonly queried fields (houseId, status, dueDate)
- **Pagination**: Prevents loading all tasks at once
- **Efficient Joins**: Optimized include statements for related data
- **Query Optimization**: Filtering done at database level

### API Performance
- **Batch Operations**: Single request to update multiple assignees
- **Selective Loading**: Only load necessary data for list views
- **Consistent Response Times**: Pagination prevents variable response sizes

### Client Optimization
- **Filter State**: Maintain filter state in client for better UX
- **Optimistic Updates**: Update UI before server confirmation
- **Cache Management**: Cache task lists and invalidate on changes

## 🛠 Development Guidelines

### Adding New Task Features

1. **Update validation schema** in `tasks.schema.ts`
2. **Add service method** with business logic and permission checks
3. **Create controller method** for HTTP handling
4. **Add route** with appropriate middleware
5. **Update this documentation**
6. **Add database migration** if schema changes needed

### Code Patterns

**Service Method Pattern:**
```typescript
static async methodName(
  taskId: string,
  houseId: string,
  currentMemberId: string,
  data: InputType
) {
  // 1. Get task and verify it exists in house
  const task = await this.getTaskById(taskId, houseId);

  // 2. Check permissions
  const canModify = await this.canUserModifyTask(task, currentMemberId);
  if (!canModify) {
    throw new ForbiddenError("Permission denied");
  }

  // 3. Validate business rules
  // 4. Perform database operations
  // 5. Return updated task
}
```

**Controller Pattern:**
```typescript
static async methodName(req: AuthRequest, res: Response): Promise<void> {
  // 1. Parse and validate parameters
  const { id: houseId } = houseIdParamSchema.parse(req.params);
  const { taskId } = taskIdParamSchema.parse(req.params);
  const data = someSchema.parse(req.body);
  const currentMemberId = req.houseMember!.id;

  // 2. Call service method
  const result = await TaskService.methodName(taskId, houseId, currentMemberId, data);

  // 3. Return response
  res.json({
    success: true,
    data: { task: result }
  });
}
```

### Best Practices
- Always validate permissions at service level
- Use transactions for multi-table operations
- Include related data efficiently (avoid N+1 queries)
- Handle edge cases (empty assignee lists, etc.)
- Maintain audit trail (createdAt, updatedAt, completedAt)

## 🐛 Common Issues

### "Some assignees are not members of this house"
- Verify all assignee IDs are valid house members
- Check that members haven't been removed from house
- Ensure house membership is current

### Permission Denied Errors
- Check if user is task creator, assignee, or house owner
- Verify house membership is active
- Confirm task belongs to the specified house

### Task Not Found
- Verify task ID is correct
- Check that task belongs to the specified house
- Ensure task wasn't deleted

### Database Constraint Violations
- Check foreign key relationships (houseId, categoryId)
- Verify unique constraints in TaskAssignee table
- Ensure proper transaction handling

## 📚 Integration Examples

### Mobile App Integration
```typescript
// React Native / Expo example
const createTask = async (houseId, taskData) => {
  const response = await fetch(`${API_BASE}/houses/${houseId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

// Usage with state management
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(false);

const loadTasks = useCallback(async (filters) => {
  setLoading(true);
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/houses/${houseId}/tasks?${query}`);
    const data = await response.json();
    setTasks(data.data.tasks);
  } finally {
    setLoading(false);
  }
}, [houseId]);
```

### Frontend Framework Integration
```typescript
// React Query example
const useHouseTasks = (houseId, filters) => {
  return useQuery({
    queryKey: ['tasks', houseId, filters],
    queryFn: () => fetchTasks(houseId, filters),
    staleTime: 30000, // 30 seconds
  });
};

const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ houseId, taskId, status }) =>
      updateTaskStatus(houseId, taskId, status),
    onSuccess: (data, { houseId }) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries(['tasks', houseId]);
    },
  });
};
```

## 📚 Related Documentation

- **[Authentication Module](./AUTH.md)** - Required for all task operations
- **[Houses Module](./HOUSES.md)** - Tasks belong to houses, requires membership
- **[Main Project](../PROJECT.md)** - Overall architecture and database design

---

*This documentation covers the tasks module implementation. For questions or improvements, please contact the development team.*