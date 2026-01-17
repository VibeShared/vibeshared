import { z } from "zod";

export const PrivacySchema = z.object({
  isPrivate: z.boolean(),
});

export type PrivacyFormValues = z.infer<typeof PrivacySchema>;
