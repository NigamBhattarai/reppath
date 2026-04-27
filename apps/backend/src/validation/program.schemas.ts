import { ObjectId } from "mongodb";
import z from "zod";

export const exerciseSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must have less than 50 characters"),
    sets: z.number().min(1, "Sets must have minimum value of 1").max(50, "Sets must have maximum value of 50"),
    reps: z.string().min(2, "Reps must have minumum value of 2").max(100, "Reps must have maximum value of 100"),
    targetWeight: z.float32().optional(),
    notes: z.string().max(250, "Notes should not exceed 250 characters").optional()
});

export const daySchema = z.object({
    dayNumber: z.number().min(1, "Day number must be at least 1").max(7, "Day number must not exceed 7"),
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must have less than 50 characters"),
    exercises: z.array(exerciseSchema).min(1, "Must contain at least 1 exercise").max(20, "Must not exceed 20 exercises"),
})

export const weekSchema = z.object({
    weekNumber: z.number().min(1, "Week number must have minimum value of 1").max(52, "Week number must have maximum value of 52"),
    days: z.array(daySchema).min(1, "Must contain at least 1 day").max(7, "Must not exceed 7 days"),
})

export const createProgramSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must have less than 50 characters"),
    description: z.string().max(250, "Description must not exceed 250 characters"),
    weeks: z.array(weekSchema).min(1, "Must contain at least 1 week").max(52, "Must not exceed 52 weeks")
})

export const updateProgramSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must have less than 50 characters").optional(),
    description: z.string().max(250, "Description must not exceed 250 characters").optional(),
    weeks: z.array(weekSchema).max(52, "Must not exceed 52 weeks").optional()
})

export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type DayInput = z.infer<typeof daySchema>;
export type WeekInput = z.infer<typeof weekSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
