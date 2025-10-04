import { parseArgs } from 'util';
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeders/users.seeder';
import { seedHouses } from './seeders/houses.seeder';
import { seedHouseMembers } from './seeders/houseMembers.seeder';
import { seedCategories } from './seeders/categories.seeder';
import { seedTasks } from './seeders/tasks.seeder';
import {
  SeededUser,
  SeededHouse,
  SeededHouseWithMembers,
  SeededHouseWithCategories,
  SeededTask,
} from './seeders/types';

const prisma = new PrismaClient();

const options = {
  environment: { type: 'string' as const },
};

async function main() {
  const {
    values: { environment = 'development' },
  } = parseArgs({ options });

  // Validate environment
  const validEnvironments = ['development', 'test', 'staging', 'production'];
  if (!validEnvironments.includes(environment)) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`Valid environments: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  console.log(`🌱 Starting database seeding for ${environment.toUpperCase()} environment...\n`);

  try {
    let users: SeededUser[] = [];
    let houses: SeededHouse[] = [];
    let housesWithMembers: SeededHouseWithMembers[] = [];
    let categoriesByHouse: SeededHouseWithCategories[] = [];
    let tasks: SeededTask[] = [];

    switch (environment) {
      case 'development':
        console.log('🔧 Loading DEVELOPMENT data (full sample dataset)...\n');

        // Full dataset for development
        console.log('Step 1/5: Seeding users...');
        users = await seedUsers();
        console.log(`Created ${users.length} users\n`);

        console.log('Step 2/5: Seeding houses...');
        houses = await seedHouses(users);
        console.log(`Created ${houses.length} houses\n`);

        console.log('Step 3/5: Seeding house members...');
        housesWithMembers = await seedHouseMembers(users, houses);
        console.log(`Added additional members to houses\n`);

        console.log('Step 4/5: Seeding categories...');
        categoriesByHouse = await seedCategories(housesWithMembers);
        console.log(`Created categories for all houses\n`);

        console.log('Step 5/5: Seeding tasks...');
        tasks = await seedTasks(categoriesByHouse);
        console.log(`Created ${tasks.length} tasks\n`);
        break;

      case 'test':
        console.log('🧪 Loading TEST data (minimal dataset for testing)...\n');

        // Minimal dataset for testing - only 2 users, 1 house, basic tasks
        console.log('Step 1/3: Seeding test users...');
        users = await seedUsers();
        // Keep only first 2 users for testing
        users = users.slice(0, 2);
        console.log(`Created ${users.length} users for testing\n`);

        console.log('Step 2/3: Seeding test house...');
        houses = await seedHouses(users);
        // Keep only first house
        houses = houses.slice(0, 1);
        console.log(`Created ${houses.length} house for testing\n`);

        console.log('Step 3/3: Seeding test categories...');
        // Add the second user as a member
        housesWithMembers = await seedHouseMembers(users, houses);
        // Create minimal categories and tasks
        categoriesByHouse = await seedCategories(housesWithMembers);
        tasks = await seedTasks(categoriesByHouse);
        console.log(`Created minimal test dataset\n`);
        break;

      case 'staging':
        console.log('🚀 Loading STAGING data (production-like dataset)...\n');

        // Production-like data but with clearly marked test accounts
        console.log('Step 1/5: Seeding staging users...');
        users = await seedUsers();
        console.log(`Created ${users.length} users\n`);

        console.log('Step 2/5: Seeding staging houses...');
        houses = await seedHouses(users);
        console.log(`Created ${houses.length} houses\n`);

        console.log('Step 3/5: Seeding staging house members...');
        housesWithMembers = await seedHouseMembers(users, houses);
        console.log(`Added additional members to houses\n`);

        console.log('Step 4/5: Seeding staging categories...');
        categoriesByHouse = await seedCategories(housesWithMembers);
        console.log(`Created categories for all houses\n`);

        console.log('Step 5/5: Seeding staging tasks...');
        tasks = await seedTasks(categoriesByHouse);
        console.log(`Created ${tasks.length} tasks\n`);
        break;

      case 'production':
        console.log('⚠️  PRODUCTION seeding is disabled for safety.');
        console.log('    Production data should be created through the application interface.');
        console.log('    If you need to seed production, please do so manually.');
        return;

      default:
        console.error(`❌ Unsupported environment: ${environment}`);
        process.exit(1);
    }

    // Print summary based on environment
    if (environment !== 'production') {
      console.log('📊 Seeding Summary:');
      console.log('===================');
      console.log(`🌍 Environment: ${environment.toUpperCase()}`);
      console.log(`👥 Users: ${users.length}`);
      console.log(`🏠 Houses: ${houses.length}`);

      if (housesWithMembers.length > 0) {
        const totalMembers = housesWithMembers.reduce((sum, house) => sum + house.members.length, 0);
        console.log(`👤 House Members: ${totalMembers}`);
      }

      if (categoriesByHouse.length > 0) {
        const totalCategories = categoriesByHouse.reduce((sum, houseData) => sum + houseData.categories.length, 0);
        console.log(`🏷️  Categories: ${totalCategories}`);
      }

      console.log(`📝 Tasks: ${tasks.length}`);

      if (environment === 'development') {
        console.log('\n📖 Test Accounts Created:');
        console.log('========================');
        console.log('All users have password: "password123"');
        console.log('');
        users.forEach(user => {
          console.log(`📧 ${user.email} - ${user.firstName} ${user.lastName}`);
        });

        if (housesWithMembers.length > 0) {
          console.log('\n🏠 Houses Created:');
          console.log('==================');
          housesWithMembers.forEach((house, index) => {
            console.log(`${index + 1}. ${house.name} (${house.members.length} members)`);
            house.members.forEach(member => {
              const roleIcon = member.role === 'OWNER' ? '👑' : '👤';
              console.log(`   ${roleIcon} ${member.displayName} (${member.user.firstName} ${member.user.lastName})`);
            });
            console.log('');
          });
        }
      }

      console.log(`\n🎉 Database seeding completed successfully for ${environment.toUpperCase()}!`);
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });