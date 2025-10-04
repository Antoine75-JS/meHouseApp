import { Role } from '@prisma/client';

// Base types for seeded data
export interface SeededUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SeededHouse {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface SeededHouseMember {
  id: string;
  displayName: string;
  role: Role;
  userId: string;
  houseId: string;
  createdAt: Date;
  user: SeededUser;
}

export interface SeededHouseWithMembers extends SeededHouse {
  members: SeededHouseMember[];
}

export interface SeededCategory {
  id: string;
  name: string;
  color: string | null;
  houseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeededHouseWithCategories {
  house: SeededHouseWithMembers;
  categories: SeededCategory[];
}

export interface SeededTask {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  completedAt: Date | null;
  houseId: string;
  categoryId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}