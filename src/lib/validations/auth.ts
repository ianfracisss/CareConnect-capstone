import { z } from "zod";

// Email validation for institutional email only
const carsuEmailRegex = /@carsu\.edu\.ph$/i;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .regex(
      carsuEmailRegex,
      "Must use a Caraga State University email (@carsu.edu.ph)"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .regex(
        carsuEmailRegex,
        "Must use a Caraga State University email (@carsu.edu.ph)"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters"),
    schoolId: z
      .string()
      .min(1, "School ID is required")
      .regex(/^[0-9]{3}-[0-9]{5}$/, "School ID must be in format: XXX-XXXXX"),
    role: z.enum(["student", "psg_member"], {
      message: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
