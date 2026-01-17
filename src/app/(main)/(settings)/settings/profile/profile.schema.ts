// profile.schema.ts
import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(2).max(50),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and _ allowed"),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;
