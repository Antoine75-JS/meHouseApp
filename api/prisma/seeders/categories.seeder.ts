import { PrismaClient } from '@prisma/client';
import { SeededHouseWithMembers, SeededHouseWithCategories } from './types';

const prisma = new PrismaClient();

export const seedCategories = async (
  housesWithMembers: SeededHouseWithMembers[]
): Promise<SeededHouseWithCategories[]> => {
  console.log('🏷️  Seeding categories...');

  // Common categories that most houses would have
  const commonCategories = [
    { name: 'Cleaning', color: '#FF6B6B' },
    { name: 'Cooking', color: '#4ECDC4' },
    { name: 'Shopping', color: '#45B7D1' },
    { name: 'Maintenance', color: '#96CEB4' },
    { name: 'Bills & Admin', color: '#FFEAA7' },
    { name: 'Pet Care', color: '#DDA0DD' },
    { name: 'Garden', color: '#98D8C8' },
  ];

  // House-specific categories
  const houseSpecificCategories = {
    'The Doe Family Home': [
      { name: 'Kids Activities', color: '#FFB6C1' },
      { name: 'School Prep', color: '#F7DC6F' },
    ],
    'College House': [
      { name: 'Study Group', color: '#AED6F1' },
      { name: 'Party Prep', color: '#F8C471' },
    ],
    'Beach House': [
      { name: 'Beach Setup', color: '#85C1E9' },
      { name: 'Vacation Prep', color: '#F9E79F' },
    ],
  };

  const createdCategories = [];

  for (const house of housesWithMembers) {
    // Add common categories to each house
    for (const categoryData of commonCategories) {
      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: categoryData.name,
          houseId: house.id,
        },
      });

      if (existingCategory) {
        console.log(`ℹ️  Category "${categoryData.name}" already exists in ${house.name}`);
        createdCategories.push(existingCategory);
        continue;
      }

      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
          color: categoryData.color,
          houseId: house.id,
        },
      });

      createdCategories.push(category);
    }

    // Add house-specific categories
    const specificCategories = houseSpecificCategories[house.name as keyof typeof houseSpecificCategories];
    if (specificCategories) {
      for (const categoryData of specificCategories) {
        // Check if category already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: categoryData.name,
            houseId: house.id,
          },
        });

        if (existingCategory) {
          console.log(`ℹ️  Category "${categoryData.name}" already exists in ${house.name}`);
          createdCategories.push(existingCategory);
          continue;
        }

        const category = await prisma.category.create({
          data: {
            name: categoryData.name,
            color: categoryData.color,
            houseId: house.id,
          },
        });

        createdCategories.push(category);
      }
    }
  }

  console.log('✅ Categories seeded successfully');

  // Return categories grouped by house for task seeding
  const categoriesByHouse = [];
  for (const house of housesWithMembers) {
    const categories = await prisma.category.findMany({
      where: { houseId: house.id },
      orderBy: { name: 'asc' },
    });

    categoriesByHouse.push({
      house: house,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        houseId: cat.houseId,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })),
    });
  }

  return categoriesByHouse;
};