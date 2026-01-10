import { z } from "zod";

export const NotificationsSchema = z.object({
  notificationLikes: z.boolean(),
  notificationComments: z.boolean(),
  notificationFollows: z.boolean(),
});

export type NotificationsFormValues = z.infer<
  typeof NotificationsSchema
>;
