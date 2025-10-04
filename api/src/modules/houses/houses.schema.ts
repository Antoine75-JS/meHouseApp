import { z } from "zod";

// House name validation: 3-20 chars, letters/numbers/spaces only
const houseNameSchema = z
  .string()
  .min(3, "House name must be at least 3 characters")
  .max(20, "House name must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9\s]+$/,
    "House name can only contain letters, numbers, and spaces"
  )
  .trim();

// Display name validation: max 12 chars, any characters allowed
const displayNameSchema = z
  .string()
  .min(1, "Display name is required")
  .max(12, "Display name must be at most 12 characters")
  .trim();

// House role enum validation
const houseMemberRoleSchema = z.enum(["OWNER", "MEMBER"]);

// Schema for creating a new house
export const createHouseSchema = z.object({
  name: houseNameSchema,
  description: z.string().trim().optional(),
});

// Schema for updating house details
export const updateHouseSchema = z.object({
  name: houseNameSchema.optional(),
  description: z.string().trim().optional(),
});

// Schema for updating member role (only OWNER can do this)
export const updateMemberRoleSchema = z.object({
  role: houseMemberRoleSchema,
});

// Schema for setting display name when joining a house
export const setDisplayNameSchema = z.object({
  displayName: displayNameSchema,
});

// Schema for house ID parameter validation
export const houseIdParamSchema = z.object({
  id: z.string().uuid("Invalid house ID format"),
});

// Schema for user ID parameter validation
export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

// Type exports for TypeScript
export type CreateHouseInput = z.infer<typeof createHouseSchema>;
export type UpdateHouseInput = z.infer<typeof updateHouseSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type SetDisplayNameInput = z.infer<typeof setDisplayNameSchema>;
export type HouseIdParam = z.infer<typeof houseIdParamSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
