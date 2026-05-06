import mongoose from 'mongoose';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';
import { Mutation } from '../src/graphql/resolvers/mutation';
import User from '../src/models/User';
import Gym from '../src/models/Gym';
import Program from '../src/models/Program';
import ProgramAssignment from '../src/models/ProgramAssignment';

let memberId: string;
let assignmentId: string;
let gymId: string;

const mockWorkoutInput = {
  weekNumber: 1,
  dayNumber: 1,
  date: new Date(),
  exercises: [
    {
      name: 'Squat',
      sets: [
        { setNumber: 1, reps: 5, weight: 100, completed: true }
      ]
    }
  ],
};

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const gym = await Gym.create({
    name: 'Test Gym',
    ownerId: new mongoose.Types.ObjectId()
  });
  gymId = gym._id.toString();

  const coach = await User.create({
    name: 'Coach',
    email: 'coach@test.com',
    passwordHash: 'hash',
    role: 'coach',
    gymId: gym._id,
    isActive: true
  });

  const member = await User.create({
    name: 'Member',
    email: 'member@test.com',
    passwordHash: 'hash',
    role: 'member',
    gymId: gym._id,
    assignedCoachId: coach._id,
    isActive: true
  });
  memberId = member._id.toString();

  const program = await Program.create({
    name: 'Test Program',
    description: 'Test',
    coachId: coach._id,
    gymId: gym._id,
    weeks: []
  });

  const assignment = await ProgramAssignment.create({
    programId: program._id,
    memberId: member._id,
    coachId: coach._id,
    gymId: gym._id,
    startDate: new Date(),
    isActive: true
  });
  assignmentId = assignment._id.toString();
});

const getMemberContext = () => ({
  user: {
    userId: memberId,
    role: 'member' as const,
    gymId
  }
});

describe('logWorkout', () => {
  it('creates a workout log successfully', async () => {
    const result = await Mutation.logWorkout(
      {},
      { input: { ...mockWorkoutInput, assignmentId } },
      getMemberContext()
    );

    expect(result).toBeDefined();
    expect(result.weekNumber).toBe(1);
    expect(result.dayNumber).toBe(1);
    expect(result.memberId.toString()).toBe(memberId);
  });

  it('throws if same day is logged twice', async () => {
    await Mutation.logWorkout(
      {},
      { input: { ...mockWorkoutInput, assignmentId } },
      getMemberContext()
    );

    await expect(
      Mutation.logWorkout(
        {},
        { input: { ...mockWorkoutInput, assignmentId } },
        getMemberContext()
      )
    ).rejects.toThrow('You have already logged this day');
  });

  it('throws if assignment does not belong to member', async () => {
    const otherMember = await User.create({
      name: 'Other Member',
      email: 'other@test.com',
      passwordHash: 'hash',
      role: 'member',
      gymId,
      isActive: true
    });

    const otherContext = {
      user: {
        userId: otherMember._id.toString(),
        role: 'member' as const,
        gymId
      }
    };

    await expect(
      Mutation.logWorkout(
        {},
        { input: { ...mockWorkoutInput, assignmentId } },
        otherContext
      )
    ).rejects.toThrow('Active program assignment not found');
  });
});