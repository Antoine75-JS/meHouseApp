import { PrismaClient } from '@prisma/client';
import { SeededHouseWithCategories, SeededTask } from './types';

const prisma = new PrismaClient();

export const seedTasks = async (
  categoriesByHouse: SeededHouseWithCategories[]
): Promise<SeededTask[]> => {
  console.log('📝 Seeding tasks...');

  const createdTasks = [];

  for (const houseData of categoriesByHouse) {
    const { house, categories } = houseData;

    // Get categories by name for easier reference
    const cleaningCat = categories.find(c => c.name === 'Cleaning');
    const cookingCat = categories.find(c => c.name === 'Cooking');
    const shoppingCat = categories.find(c => c.name === 'Shopping');
    const maintenanceCat = categories.find(c => c.name === 'Maintenance');
    const billsCat = categories.find(c => c.name === 'Bills & Admin');

    // Sample tasks for each house
    const houseTasks = [];

    if (house.name === 'The Doe Family Home') {
      houseTasks.push(
        {
          title: 'Weekly grocery shopping',
          description: 'Buy groceries for the family including fresh fruits and vegetables',
          priority: 'HIGH',
          status: 'PENDING',
          categoryId: shoppingCat?.id,
          creatorIndex: 0, // Dad (owner)
          assigneeIndices: [0, 1], // Dad and Mom
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
        {
          title: 'Deep clean living room',
          description: 'Vacuum, dust, and organize the living room',
          priority: 'MEDIUM',
          status: 'PENDING',
          categoryId: cleaningCat?.id,
          creatorIndex: 1, // Mom
          assigneeIndices: [2], // Alex (guest helping)
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        },
        {
          title: 'Pay electricity bill',
          description: 'Monthly electricity bill is due',
          priority: 'HIGH',
          status: 'COMPLETED',
          categoryId: billsCat?.id,
          creatorIndex: 0, // Dad
          assigneeIndices: [0], // Dad
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue but completed)
          completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        },
        {
          title: 'Fix leaky kitchen faucet',
          description: 'The kitchen faucet has been dripping for a week',
          priority: 'MEDIUM',
          status: 'PENDING',
          categoryId: maintenanceCat?.id,
          creatorIndex: 1, // Mom
          assigneeIndices: [], // Unassigned
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        },
        {
          title: 'Prepare dinner for tonight',
          description: 'Cook pasta with marinara sauce and garlic bread',
          priority: 'HIGH',
          status: 'PENDING',
          categoryId: cookingCat?.id,
          creatorIndex: 0, // Dad
          assigneeIndices: [1], // Mom
          dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        }
      );
    } else if (house.name === 'Downtown Apartment') {
      houseTasks.push(
        {
          title: 'Clean bathroom',
          description: 'Weekly bathroom cleaning - toilet, shower, mirrors',
          priority: 'MEDIUM',
          status: 'PENDING',
          categoryId: cleaningCat?.id,
          creatorIndex: 0, // Mike (owner)
          assigneeIndices: [1, 2], // Sarah J and Emma
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        {
          title: 'Buy coffee and snacks',
          description: 'We are running low on coffee beans and healthy snacks',
          priority: 'LOW',
          status: 'PENDING',
          categoryId: shoppingCat?.id,
          creatorIndex: 1, // Sarah J
          assigneeIndices: [0], // Mike
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        },
        {
          title: 'Split internet bill',
          description: 'Monthly internet bill needs to be split 3 ways',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          categoryId: billsCat?.id,
          creatorIndex: 0, // Mike
          assigneeIndices: [0, 1, 2], // All three
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
      );
    } else if (house.name === 'College House') {
      houseTasks.push(
        {
          title: 'Organize study session',
          description: 'Group study for upcoming midterms - bring notes and snacks',
          priority: 'HIGH',
          status: 'PENDING',
          categoryId: categories.find(c => c.name === 'Study Group')?.id,
          creatorIndex: 0, // Sarah (owner)
          assigneeIndices: [1, 2, 3], // Emma D, Alex B, Mike W
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        },
        {
          title: 'Take out trash',
          description: 'Trash pickup is tomorrow morning',
          priority: 'HIGH',
          status: 'PENDING',
          categoryId: cleaningCat?.id,
          creatorIndex: 1, // Emma D
          assigneeIndices: [2], // Alex B
          dueDate: new Date(Date.now() + 16 * 60 * 60 * 1000), // 16 hours from now
        },
        {
          title: 'Buy party supplies',
          description: 'Weekend party supplies - drinks, cups, decorations',
          priority: 'MEDIUM',
          status: 'PENDING',
          categoryId: categories.find(c => c.name === 'Party Prep')?.id,
          creatorIndex: 3, // Mike W
          assigneeIndices: [0, 3], // Sarah and Mike W
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        }
      );
    } else if (house.name === 'Beach House') {
      houseTasks.push(
        {
          title: 'Set up beach umbrellas',
          description: 'Put up the large umbrellas on the beach area',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          categoryId: categories.find(c => c.name === 'Beach Setup')?.id,
          creatorIndex: 0, // Alex (owner)
          assigneeIndices: [1, 2], // John and Jane
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          title: 'Stock kitchen for weekend',
          description: 'Buy food and drinks for the weekend stay',
          priority: 'HIGH',
          status: 'PENDING',
          categoryId: shoppingCat?.id,
          creatorIndex: 1, // John
          assigneeIndices: [1, 2], // John and Jane
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        }
      );
    }

    // Create tasks for this house
    for (const taskData of houseTasks) {
      // Get creator member
      const creator = house.members[taskData.creatorIndex];
      if (!creator) {
        console.warn(`⚠️  Creator not found at index ${taskData.creatorIndex} for house ${house.name}`);
        continue;
      }

      // Check if task already exists (by title and house)
      const existingTask = await prisma.task.findFirst({
        where: {
          title: taskData.title,
          houseId: house.id,
        },
      });

      if (existingTask) {
        console.log(`ℹ️  Task "${taskData.title}" already exists in ${house.name}`);
        createdTasks.push(existingTask);
        continue;
      }

      // Create task
      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority as any,
          status: taskData.status as any,
          houseId: house.id,
          categoryId: taskData.categoryId,
          createdById: creator.id,
          dueDate: taskData.dueDate,
          completedAt: taskData.completedAt || null,
        },
      });

      // Create task assignments
      for (const assigneeIndex of taskData.assigneeIndices) {
        const assignee = house.members[assigneeIndex];
        if (!assignee) {
          console.warn(`⚠️  Assignee not found at index ${assigneeIndex} for task ${taskData.title}`);
          continue;
        }

        await prisma.taskAssignee.create({
          data: {
            taskId: task.id,
            houseMemberId: assignee.id,
          },
        });
      }

      createdTasks.push(task);
      console.log(`✅ Created task "${taskData.title}" in ${house.name}`);
    }
  }

  console.log('✅ Tasks seeded successfully');
  return createdTasks;
};