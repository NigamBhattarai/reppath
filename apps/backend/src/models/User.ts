import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '@reppath/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  gymId: mongoose.Types.ObjectId;
  assignedCoachId: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'coach', 'member'], required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    assignedCoachId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ gymId: 1, role: 1 });

export default mongoose.model<IUser>('User', UserSchema);