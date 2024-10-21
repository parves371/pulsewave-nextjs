import { z } from "zod";

export const verifySchema = z.object({
  username: z.string().min(1, "Username is required"),
  token: z.string().length(6, "Verification code must be 6 characters"),
});

