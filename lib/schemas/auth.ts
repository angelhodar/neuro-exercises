import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(2).max(50),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin"]),
});

export const organizationRoleSchema = z.enum(["member", "admin", "owner"]);
export const organizationSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const organizationInputSchema = z.object({
  logo: z.union([z.url(), z.literal("")]).nullish(),
  metadata: z.string().nullish(),
  name: z.string().trim().min(2).max(255),
  slug: z.union([organizationSlugSchema, z.literal("")]).nullish(),
});

export const addOrganizationMemberSchema = z.object({
  email: z.email().trim().toLowerCase(),
  organizationId: z.string().min(1),
  role: organizationRoleSchema,
});
