import mongoose, { Document, Schema } from 'mongoose';

export interface IProgramAssignment extends Document {
  programId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
}

const ProgramAssignmentSchema = new Schema<IProgramAssignment>(
  {
    programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    startDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ProgramAssignmentSchema.index({ memberId: 1, isActive: 1 });
ProgramAssignmentSchema.index({ coachId: 1, gymId: 1 });

export default mongoose.model<IProgramAssignment>('ProgramAssignment', ProgramAssignmentSchema);