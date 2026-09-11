import { z } from "zod";

export const baseSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
});

export const baseDefaults = { subject: "", description: "" };

export type BaseValues = z.infer<typeof baseSchema>;
