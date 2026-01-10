import { z } from "zod";

export const PrivacySchema = z.object({
  isPrivate: z.boolean(),
  commentPermission: z.enum(["everyone", "followers"]),
});

export type PrivacyFormValues = z.infer<typeof PrivacySchema>;
