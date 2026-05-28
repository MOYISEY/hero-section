import { z } from "zod"
const roleValues = ["client", "manager", "developer", "director"] as const

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(256),
})

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(6).max(256),
})

export const directorUserCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(6).max(256),
  role: z.enum(roleValues).refine((role) => role === "manager" || role === "developer", {
    message: "Director can create only manager or developer accounts",
  }),
  specialization: z.string().trim().max(120).optional().nullable(),
})

export const directorUserManageSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["set_role", "set_specialization", "delete"]),
  role: z.enum(roleValues).optional(),
  specialization: z.string().trim().max(120).optional(),
})
