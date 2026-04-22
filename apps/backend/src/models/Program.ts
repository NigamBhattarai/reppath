import mongoose, { Document, Schema } from 'mongoose';

interface IExercise {
  name: string;
  sets: number;
  reps: string;
  targetWeight: number | null;
  notes: string | null;
}

export interface IDay {
  dayNumber: number;
  name: string;
  exercises: IExercise[];
}

export interface IWeek {
  weekNumber: number;
  days: IDay[];
}

export interface IProgram extends Document {
  name: string;
  description: string;
  coachId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  weeks: IWeek[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    targetWeight: { type: Number, default: null },
    notes: { type: String, default: null }
  },
  { _id: false }
);

const DaySchema = new Schema<IDay>(
  {
    dayNumber: { type: Number, required: true },
    name: { type: String, required: true },
    exercises: { type: [ExerciseSchema], default: [] }
  },
  { _id: false }
);

const WeekSchema = new Schema<IWeek>(
  {
    weekNumber: { type: Number, required: true },
    days: { type: [DaySchema], default: [] }
  },
  { _id: false }
);

const ProgramSchema = new Schema<IProgram>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    weeks: { type: [WeekSchema], default: [] },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);
ProgramSchema.index({ coachId: 1, gymId: 1 });

export default mongoose.model<IProgram>('Program', ProgramSchema);