import mongoose, { Document, Schema } from 'mongoose';

interface ISetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface IExerciseLog {
  name: string;
  sets: ISetLog[];
}

export interface IWorkoutLog extends Document {
  memberId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  weekNumber: number;
  dayNumber: number;
  date: Date;
  exercises: IExerciseLog[];
  notes: string | null;
  createdAt: Date;
}

const SetLogSchema = new Schema<ISetLog>(
  {
    setNumber: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, required: true },
    completed: { type: Boolean, required: true }
  },
  { _id: false }
);

const ExerciseLogSchema = new Schema<IExerciseLog>(
  {
    name: { type: String, required: true },
    sets: { type: [SetLogSchema], default: [] }
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'ProgramAssignment', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    weekNumber: { type: Number, required: true },
    dayNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    exercises: { type: [ExerciseLogSchema], default: [] },
    notes: { type: String, default: null }
  },
  { timestamps: true }
);

WorkoutLogSchema.index({ memberId: 1, date: -1 });
WorkoutLogSchema.index({ gymId: 1, date: -1 });
WorkoutLogSchema.index(
  { memberId: 1, assignmentId: 1, weekNumber: 1, dayNumber: 1 },
  { unique: true }
);

export default mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);