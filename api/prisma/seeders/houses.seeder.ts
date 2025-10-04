import { PrismaClient } from '@prisma/client';
import { SeededUser, SeededHouse } from './types';

const prisma = new PrismaClient();

export const seedHouses = async (users: SeededUser[]): Promise<SeededHouse[]> => {
  console.log('🏠 Seeding houses...');

  // Sample houses with different scenarios - using user IDs instead of emails
  const houses = [
    {
      name: 'The Doe Family Home',
      description: 'A cozy family home where John and Jane live with their kids',
      ownerEmail: 'john.doe@example.com', // Only for finding the user initially
      ownerDisplayName: 'Dad',
    },
    {
      name: 'Downtown Apartment',
      description: 'Modern apartment shared by young professionals',
      ownerEmail: 'mike.wilson@example.com',
      ownerDisplayName: 'Mike',
    },
    {
      name: 'College House',
      description: 'Shared student accommodation near the university',
      ownerEmail: 'sarah.johnson@example.com',
      ownerDisplayName: 'Sarah',
    },
    {
      name: 'Beach House',
      description: 'Vacation home used for family getaways',
      ownerEmail: 'alex.brown@example.com',
      ownerDisplayName: 'Alex',
    },
  ];

  const createdHouses = [];

  for (const houseData of houses) {
    // Find the owner user by email (one-time lookup)
    const owner = users.find(user => user.email === houseData.ownerEmail);
    if (!owner) {
      console.warn(`⚠️  Owner not found for email: ${houseData.ownerEmail}`);
      continue;
    }

    // Check if house already exists by looking for existing membership
    const existingMembership = await prisma.houseMember.findFirst({
      where: {
        userId: owner.id,
        displayName: houseData.ownerDisplayName,
        role: 'OWNER',
      },
      include: { house: true },
    });

    let house;
    if (existingMembership) {
      house = existingMembership.house;
      console.log(`ℹ️  House "${house.name}" already exists`);
    } else {
      // Create new house
      house = await prisma.house.create({
        data: {
          name: houseData.name,
          description: houseData.description,
        },
      });

      // Create owner membership
      await prisma.houseMember.create({
        data: {
          userId: owner.id,
          houseId: house.id,
          displayName: houseData.ownerDisplayName,
          role: 'OWNER',
        },
      });
    }

    createdHouses.push({
      id: house.id,
      name: house.name,
      description: house.description,
      createdAt: house.createdAt,
      updatedAt: house.updatedAt,
      ownerId: owner.id,
    });
  }

  console.log('✅ Houses seeded successfully');
  return createdHouses;
};