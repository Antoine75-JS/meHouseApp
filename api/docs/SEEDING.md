# Database Seeding Documentation

## 📋 Overview

The MeHouse API includes a comprehensive database seeding system that creates realistic test data for different environments. This system helps developers quickly set up working data for development, testing, and staging environments.

## 🎯 Environment-Based Seeding

The seeding system supports different environments with tailored datasets:

### **Development** (default)
- **Purpose**: Full-featured development environment
- **Data**: Complete sample dataset with multiple users, houses, and tasks
- **Users**: 6 test users with realistic profiles
- **Houses**: 4 different house scenarios (family, apartment, college, vacation)
- **Tasks**: Variety of tasks with different statuses, priorities, and assignments

### **Test**
- **Purpose**: Minimal dataset for automated testing
- **Data**: Minimal but complete dataset
- **Users**: 2 test users only
- **Houses**: 1 house with basic setup
- **Tasks**: Few essential tasks for testing functionality

### **Staging**
- **Purpose**: Production-like environment for final testing
- **Data**: Full dataset similar to development
- **Users**: All test users clearly marked as staging accounts
- **Houses**: Complete house scenarios
- **Tasks**: Full range of tasks and scenarios

### **Production**
- **Purpose**: Safety guard against accidental seeding
- **Data**: No seeding allowed
- **Behavior**: Displays warning and exits safely

## 🚀 Usage

### Command Line Arguments

```bash
# Development environment (default)
pnpm prisma:seed
# or explicitly
tsx prisma/seed.ts --environment development

# Test environment
tsx prisma/seed.ts --environment test

# Staging environment
tsx prisma/seed.ts --environment staging

# Production (will exit with warning)
tsx prisma/seed.ts --environment production
```

### Package.json Scripts

```bash
# Seed development data
pnpm prisma:seed

# Seed test data
pnpm prisma:seed:test

# Seed staging data
pnpm prisma:seed:staging

# Reset database and seed
pnpm prisma:reset
```

## 📊 Data Structure

### Test Users Created
All environments create users with predictable credentials for easy testing:

**Password for all users**: `password123`

| Email | Name | Used In |
|-------|------|---------|
| john.doe@example.com | John Doe | All environments |
| jane.doe@example.com | Jane Doe | All environments (dev/staging only for test) |
| mike.wilson@example.com | Mike Wilson | Dev/Staging only |
| sarah.johnson@example.com | Sarah Johnson | Dev/Staging only |
| alex.brown@example.com | Alex Brown | Dev/Staging only |
| emma.davis@example.com | Emma Davis | Dev/Staging only |

### House Scenarios

#### 1. The Doe Family Home
- **Owner**: John (Dad)
- **Members**: Jane (Mom) as co-owner, Alex as guest
- **Scenario**: Traditional family household
- **Tasks**: Family-oriented tasks like grocery shopping, household maintenance

#### 2. Downtown Apartment
- **Owner**: Mike
- **Members**: Sarah J, Emma as roommates
- **Scenario**: Young professionals sharing apartment
- **Tasks**: Shared responsibilities, bill splitting

#### 3. College House
- **Owner**: Sarah
- **Members**: Emma D, Alex B, Mike W as students
- **Scenario**: Student accommodation
- **Tasks**: Study groups, party prep, basic household tasks

#### 4. Beach House
- **Owner**: Alex
- **Members**: John, Jane as guests
- **Scenario**: Vacation property
- **Tasks**: Vacation prep, beach setup, maintenance

### Categories Created

**Common categories** (created for all houses):
- 🧹 Cleaning
- 🍳 Cooking
- 🛒 Shopping
- 🔧 Maintenance
- 💳 Bills & Admin
- 🐕 Pet Care
- 🌱 Garden

**House-specific categories**:
- **Family Home**: Kids Activities, School Prep
- **College House**: Study Group, Party Prep
- **Beach House**: Beach Setup, Vacation Prep

### Task Examples

The seeding creates realistic tasks with:
- ✅ **Completed tasks** (with completion timestamps)
- ⏰ **Pending tasks** (various priorities and due dates)
- 🚨 **Overdue tasks** (for testing alerts)
- 👥 **Multi-assignee tasks** (testing assignment system)
- 📝 **Unassigned tasks** (testing assignment workflows)

## 🏗 Seeder Architecture

### File Structure
```
prisma/
├── seed.ts                 # Main seeding script with environment logic
└── seeders/
    ├── users.seeder.ts     # Creates test user accounts
    ├── houses.seeder.ts    # Creates houses with owners
    ├── houseMembers.seeder.ts # Adds additional house members
    ├── categories.seeder.ts   # Creates task categories
    └── tasks.seeder.ts     # Creates tasks with assignments
```

### Seeding Flow
1. **Users**: Create user accounts with hashed passwords
2. **Houses**: Create houses and set up owner memberships
3. **Members**: Add additional members with roles
4. **Categories**: Create house-specific task categories
5. **Tasks**: Create tasks with assignments and realistic scenarios

### Data Integrity
- **Idempotent**: Can run multiple times safely
- **Relationship integrity**: Proper foreign key relationships
- **Unique constraints**: Handles email uniqueness, display names per house
- **Type safety**: Uses Prisma types for validation

## 🧪 Testing Integration

### In Jest Tests
```typescript
// Setup test database
beforeAll(async () => {
  await seedDatabase('test');
});

// Use seeded data
it('should get user houses', async () => {
  const response = await request(app)
    .get('/api/v1/houses')
    .set('Authorization', `Bearer ${testUserToken}`);

  expect(response.status).toBe(200);
  expect(response.body.data.houses).toHaveLength(1);
});
```

### With Postman/Insomnia
1. Seed development data
2. Use login endpoint with test credentials
3. Test all endpoints with realistic data

## 📝 Adding New Seeders

### Creating a New Seeder
1. Create new file in `prisma/seeders/`
2. Export async function following pattern:
```typescript
export const seedNewData = async (dependencies: any[]) => {
  console.log('🔄 Seeding new data...');

  // Seeding logic here

  console.log('✅ New data seeded successfully');
  return result;
};
```

3. Import and call in main `seed.ts`
4. Add environment-specific logic if needed

### Best Practices
- **Use IDs, not names** for relationships
- **Check for existing data** before creating
- **Use proper TypeScript types**
- **Add descriptive console logs**
- **Handle errors gracefully**
- **Make it idempotent**

## 🔧 Development Workflow

### Setting Up New Environment
```bash
# 1. Reset database
pnpm prisma:reset

# 2. Run migrations
pnpm prisma:migrate

# 3. Seed data
pnpm prisma:seed --environment development

# 4. Open Prisma Studio to verify
pnpm prisma:studio
```

### Quick Reset During Development
```bash
# Reset and seed in one command
pnpm prisma:reset
```

### Testing API Endpoints
1. Seed development data
2. Login with test credentials:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "john.doe@example.com", "password": "password123"}'
   ```
3. Use returned JWT for protected endpoints

## 🚨 Important Notes

### Security
- **Test data only**: Never seed real user data
- **Clear passwords**: All test accounts use `password123`
- **Environment separation**: Production seeding is disabled
- **Data cleanup**: Reset databases between test runs

### Performance
- **Batch operations**: Efficient database operations
- **Foreign key handling**: Proper relationship management
- **Index usage**: Leverages database indexes

### Maintenance
- **Keep realistic**: Update scenarios to match real usage
- **Version control**: Track seeding changes with application changes
- **Documentation**: Keep this documentation updated

---

*This seeding system provides a solid foundation for development and testing. Customize the data scenarios as your application evolves.*