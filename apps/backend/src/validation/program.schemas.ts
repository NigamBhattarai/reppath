import { ObjectId } from "mongodb";
import z from "zod";

export const exerciseSchema = z.object({
    name: z.string().min(2).max(50),
    sets: z.number().min(1).max(50),
    reps: z.string().min(2).max(100),
    targetWeight: z.float32().optional(),
    notes: z.string().max(250).optional()
});

export const daySchema = z.object({
    dayNumber: z.number().min(1).max(7),
    name: z.string().min(2).max(50),
    exercises: z.array(exerciseSchema).min(1).max(20),
})

export const weekSchema = z.object({
    weekNumber: z.number().min(1).max(52),
    days: z.array(daySchema).min(1).max(7),
})

export const createProgramSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(250),
    weeks: z.array(weekSchema).min(1).max(52)
})

export const updateProgramSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(250).optional(),
    weeks: z.array(weekSchema).max(52).optional()
})

export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type DayInput = z.infer<typeof daySchema>;
export type WeekInput = z.infer<typeof weekSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
