import { z } from "zod/v4";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
});

export const environmentSchema = z.object({
  name: z.string().min(1, "Environment name is required").max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9-]*$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const configEntrySchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[A-Z][A-Z0-9_]*$/, "Key must be uppercase snake case (e.g. DATABASE_URL)"),
  value: z.string().min(1, "Value is required"),
  isSecret: z.boolean(),
  description: z.string().max(500).optional(),
  isRequired: z.boolean(),
});

export const updateConfigEntrySchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[A-Z][A-Z0-9_]*$/, "Key must be uppercase snake case")
    .optional(),
  value: z.string().min(1).optional(),
  isSecret: z.boolean().optional(),
  description: z.string().max(500).optional(),
  isRequired: z.boolean().optional(),
});

export const rotateSecretSchema = z.object({
  newValue: z.string().min(1, "New value is required"),
});

export const duplicateEntrySchema = z.object({
  targetEnvironmentId: z.string().uuid("Invalid environment ID"),
});

export const shareLinkSchema = z.object({
  expiresInHours: z.number().min(1 / 60).max(168),
  maxViews: z.number().min(1).max(10),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const updateMemberSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]).optional(),
  canRevealSecrets: z.boolean().optional(),
  canShareSecrets: z.boolean().optional(),
});

export const importEnvSchema = z.object({
  content: z.string().min(1, "Content is required"),
  treatAsSecrets: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
});
