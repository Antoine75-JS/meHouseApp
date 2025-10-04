import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SeededUser } from './types';

const prisma = new PrismaClient();

export const seedUsers = async (): Promise<SeededUser[]> => {
  console.log('🌱 Seeding users...');

  // Test users with predictable passwords for development
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
    },
    {
      email: 'jane.doe@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      avatar: null,
    },
    {
      email: 'mike.wilson@example.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Wilson',
      avatar: null,
    },
    {
      email: 'sarah.johnson@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      avatar: null,
    },
    {
      email: 'alex.brown@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Brown',
      avatar: null,
    },
    {
      email: 'emma.davis@example.com',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Davis',
      avatar: null,
    },
  ];

  // Hash passwords and create users
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {}, // Don't update if exists
      create: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  console.log('✅ Users seeded successfully');
  return await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true },
  });
};