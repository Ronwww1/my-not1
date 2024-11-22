import { z } from "zod";

export const fileUploadFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character long")
    .max(50, "Name must be at most 50 characters long")
    .regex(/^[a-zA-Z ]+$/, "Name must contain only letters and spaces"),
  type: z
    .string()
    .min(1, "Type must be at least 1 character long")
    .max(50, "Type must be at most 50 characters long"),
});
