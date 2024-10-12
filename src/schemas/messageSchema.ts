import { z } from "zod";

export const messageSchema = z.object({
  tontent: z
    .string()
    .min(10, "content must be at least 10 characters")
    .max(300, "content must be less than 300 characters"),
});
