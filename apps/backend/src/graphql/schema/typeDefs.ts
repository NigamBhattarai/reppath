export const typeDefs = `#graphql

  # --- Scalars ---
  scalar Date

  # --- Enums ---
  enum Role {
    owner
    coach
    member
  }

  # --- Auth ---
  type AuthPayload {
    token: String!
    user: User!
  }

  # --- User ---
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    gymId: ID!
    isActive: Boolean!
    assignedCoachId: ID
    createdAt: Date!
  }

  # --- Gym ---
  type Gym {
    id: ID!
    name: String!
    ownerId: ID!
    createdAt: Date!
  }

  # --- Program ---
  type Exercise {
    name: String!
    sets: Int!
    reps: String!
    targetWeight: Float
    notes: String
  }

  type Day {
    dayNumber: Int!
    name: String!
    exercises: [Exercise!]!
  }

  type Week {
    weekNumber: Int!
    days: [Day!]!
  }

  type Program {
    id: ID!
    name: String!
    description: String!
    coachId: ID!
    gymId: ID!
    weeks: [Week!]!
    createdAt: Date!
  }

  # --- Program Assignment ---
  type ProgramAssignment {
    id: ID!
    programId: ID!
    memberId: ID!
    coachId: ID!
    startDate: Date!
    isActive: Boolean!
    program: Program!
    member: User!
  }

  # --- Workout Log ---
  type SetLog {
    setNumber: Int!
    reps: Int!
    weight: Float!
    completed: Boolean!
  }

  type ExerciseLog {
    name: String!
    sets: [SetLog!]!
  }

  type WorkoutLog {
    id: ID!
    memberId: ID!
    programId: ID!
    weekNumber: Int!
    dayNumber: Int!
    date: Date!
    exercises: [ExerciseLog!]!
    notes: String
    createdAt: Date!
  }

  # --- Dashboard ---
  type OwnerDashboard {
    totalMembers: Int!
    totalCoaches: Int!
    activeProgramAssignments: Int!
    workoutLogsLast7Days: Int!
  }

  type CoachMemberSummary {
    member: User!
    lastWorkoutDate: Date
    hasLoggedThisWeek: Boolean!
  }

  type CoachDashboard {
    memberSummaries: [CoachMemberSummary!]!
    totalAssigned: Int!
    activeThisWeek: Int!
  }

  # --- Progress ---
  type ProgressPoint {
    date: Date!
    averageWeight: Float!
  }

  type ExerciseProgress {
    exerciseName: String!
    points: [ProgressPoint!]!
  }

  # --- Input Types ---
  input RegisterOwnerInput {
    name: String!
    email: String!
    password: String!
    gymName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input ExerciseInput {
    name: String!
    sets: Int!
    reps: String!
    targetWeight: Float
    notes: String
  }

  input DayInput {
    dayNumber: Int!
    name: String!
    exercises: [ExerciseInput!]!
  }

  input WeekInput {
    weekNumber: Int!
    days: [DayInput!]!
  }

  input CreateProgramInput {
    name: String!
    description: String!
    weeks: [WeekInput!]!
  }

  input UpdateProgramInput {
    name: String
    description: String
    weeks: [WeekInput!]
  }

  input SetLogInput {
    setNumber: Int!
    reps: Int!
    weight: Float!
    completed: Boolean!
  }

  input ExerciseLogInput {
    name: String!
    sets: [SetLogInput!]!
  }

  input LogWorkoutInput {
    assignmentId: ID!
    weekNumber: Int!
    dayNumber: Int!
    date: Date!
    exercises: [ExerciseLogInput!]!
    notes: String
  }

  # --- Queries ---
  type Query {
    # Auth
    me: User!

    # Owner
    gymMembers: [User!]!
    gymCoaches: [User!]!
    ownerDashboard: OwnerDashboard!
    coachMembers(coachId: ID!): [User!]!
    
    # Coach
    myMembers: [User!]!
    coachDashboard: CoachDashboard!
    memberWorkoutLogs(memberId: ID!): [WorkoutLog!]!
    memberProgress(memberId: ID!, exerciseName: String!): ExerciseProgress!

    # Coach & Member
    programs: [Program!]!
    program(id: ID!): Program!

    # Member
    myAssignment: ProgramAssignment
    myWorkoutLogs: [WorkoutLog!]!
    myProgress(exerciseName: String!): ExerciseProgress!
  }

  # --- Mutations ---
  type Mutation {
    # Auth
    registerOwner(input: RegisterOwnerInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Owner
    createCoach(input: CreateUserInput!): User!
    createMember(input: CreateUserInput!): User!
    assignMemberToCoach(memberId: ID!, coachId: ID!): User!
    deactivateUser(userId: ID!): User!

    # Coach
    createProgram(input: CreateProgramInput!): Program!
    updateProgram(id: ID!, input: UpdateProgramInput!): Program!
    deleteProgram(id: ID!): Boolean!
    assignProgram(memberId: ID!, programId: ID!): ProgramAssignment!
    unassignProgram(memberId: ID!): Boolean!
    
    # Member
    logWorkout(input: LogWorkoutInput!): WorkoutLog!
  }
`;