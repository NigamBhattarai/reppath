import z from "zod";

export const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must have less than 50 characters"),
    email: z.email("Invalid email"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/(?=.*[a-z])/, "Must contain at least one lowercase letter")
        .regex(/(?=.*[A-Z])/, "Must contain at least one uppercase letter")
        .regex(/(?=.*\d)/, "Must contain at least one number"),

})

export type CreateUserInput = z.infer<typeof createUserSchema>;
