import { ObjectId } from "mongodb";
import z from "zod";

export const setLogSchema = z.object({
    setNumber: z.number().min(1).max(100),
    reps: z.number().min(1).max(100),
    weight: z.float32().min(0.1),
    completed: z.boolean()
});

export const exerciseLogSchema = z.object({
    name: z.string().min(2).max(50),
    sets: z.array(setLogSchema).min(1).max(100),
})

export const logWorkoutSchema = z.object({
    assignmentId: z.string().refine((val) => ObjectId.isValid(val), {
            message: "Invalid MongoDB ObjectId",
        }),
    weekNumber: z.number().min(1).max(52),
    dayNumber: z.number().min(1).max(7),
    date: z.date(),
    exercises: z.array(exerciseLogSchema).min(1).max(20),
    notes: z.string().max(250).optional()
})

export type SetLogInput = z.infer<typeof setLogSchema>;
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;