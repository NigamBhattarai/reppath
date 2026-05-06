import { ObjectId } from "mongodb";
import z from "zod";

export const setLogSchema = z.object({
    setNumber: z.number().min(1, "Set Number must be at least 1").max(100, "Set number must not exceed 100"),
    reps: z.number().min(1, "Reps must be at least 1").max(100, "Reps must not exceed 100"),
    weight: z.float32().min(0.1, "Weight must be at least 0.1"),
    completed: z.boolean()
});

export const exerciseLogSchema = z.object({
    name: z.string().min(2, "Name must contain at least 2 characters").max(50, "Name must not exceed 50 characters"),
    sets: z.array(setLogSchema).min(1, "Must contain at least 1 set").max(100, "Must not exceed 100 sets"),
})

export const logWorkoutSchema = z.object({
    assignmentId: z.string().refine((val) => ObjectId.isValid(val), {
            message: "Invalid MongoDB ObjectId",
        }),
    weekNumber: z.number().min(1, "Week number must be at least 1").max(52, "Week number must not exceed 52"),
    dayNumber: z.number().min(1, "Day number must be at least 1").max(7, "Day number must not exceed 7"),
    date: z.date({error: "Must be a date"}),
    exercises: z.array(exerciseLogSchema).min(1, "Must contain at least 1 exercise").max(20, "Must not exceed 20 exercises"),
    notes: z.string().max(250, "Note must not exceed 250 characters").nullish()
})

export type SetLogInput = z.infer<typeof setLogSchema>;
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;
export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>;