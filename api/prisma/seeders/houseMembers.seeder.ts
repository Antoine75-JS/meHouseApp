import { PrismaClient, Role } from '@prisma/client';
import { SeededUser, SeededHouse, SeededHouseWithMembers } from './types';

const prisma = new PrismaClient();

export const seedHouseMembers = async (
  users: SeededUser[],
  houses: SeededHouse[]
): Promise<SeededHouseWithMembers[]> => {
  console.log('👥 Seeding house members...');

  // Define member relationships using array indices for reliability
  const memberRelationships = [
    // The Doe Family Home (houses[0]) - Add Jane as co-owner, Alex as member
    {
      houseIndex: 0, // The Doe Family Home
      userEmail: 'jane.doe@example.com',
      displayName: 'Mom',
      role: 'OWNER', // Make Jane co-owner
    },
    {
      houseIndex: 0, // The Doe Family Home
      userEmail: 'alex.brown@example.com',
      displayName: 'Alex',
      role: 'MEMBER', // Alex is staying as a guest
    },

    // Downtown Apartment (houses[1]) - Add Sarah and Emma as members
    {
      houseIndex: 1, // Downtown Apartment
      userEmail: 'sarah.johnson@example.com',
      displayName: 'Sarah J',
      role: 'MEMBER',
    },
    {
      houseIndex: 1, // Downtown Apartment
      userEmail: 'emma.davis@example.com',
      displayName: 'Emma',
      role: 'MEMBER',
    },

    // College House (houses[2]) - Add multiple students
    {
      houseIndex: 2, // College House
      userEmail: 'emma.davis@example.com',
      displayName: 'Emma D',
      role: 'MEMBER',
    },
    {
      houseIndex: 2, // College House
      userEmail: 'alex.brown@example.com',
      displayName: 'Alex B',
      role: 'MEMBER',
    },
    {
      houseIndex: 2, // College House
      userEmail: 'mike.wilson@example.com',
      displayName: 'Mike W',
      role: 'MEMBER',
    },

    // Beach House (houses[3]) - Add the Doe family
    {
      houseIndex: 3, // Beach House
      userEmail: 'john.doe@example.com',
      displayName: 'John',
      role: 'MEMBER',
    },
    {
      houseIndex: 3, // Beach House
      userEmail: 'jane.doe@example.com',
      displayName: 'Jane',
      role: 'MEMBER',
    },
  ];

  for (const relationship of memberRelationships) {
    // Get house by index
    const house = houses[relationship.houseIndex];
    if (!house) {
      console.warn(`⚠️  House not found at index: ${relationship.houseIndex}`);
      continue;
    }

    // Find the user by email
    const user = users.find(u => u.email === relationship.userEmail);
    if (!user) {
      console.warn(`⚠️  User not found: ${relationship.userEmail}`);
      continue;
    }

    // Check if membership already exists
    const existingMembership = await prisma.houseMember.findUnique({
      where: {
        userId_houseId: {
          userId: user.id,
          houseId: house.id,
        },
      },
    });

    if (existingMembership) {
      console.log(`ℹ️  Membership already exists: ${relationship.userEmail} in ${house.name}`);
      continue;
    }

    // Create membership
    await prisma.houseMember.create({
      data: {
        userId: user.id,
        houseId: house.id,
        displayName: relationship.displayName,
        role: relationship.role as Role,
      },
    });

    console.log(`✅ Added ${relationship.userEmail} to ${house.name} as ${relationship.role}`);
  }

  console.log('✅ House members seeded successfully');

  // Return houses with their members for later use
  const housesWithMembers = [];
  for (const house of houses) {
    const members = await prisma.houseMember.findMany({
      where: { houseId: house.id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: [
        { role: 'desc' }, // OWNER first
        { createdAt: 'asc' },
      ],
    });

    housesWithMembers.push({
      id: house.id,
      name: house.name,
      description: house.description,
      createdAt: house.createdAt,
      updatedAt: house.updatedAt,
      ownerId: house.ownerId,
      members: members.map(member => ({
        id: member.id,
        displayName: member.displayName,
        role: member.role,
        userId: member.userId,
        houseId: member.houseId,
        createdAt: member.createdAt,
        user: {
          id: member.user.id,
          email: member.user.email,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
        },
      })),
    });
  }

  return housesWithMembers;
};