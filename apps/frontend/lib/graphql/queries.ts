import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

export const OWNER_DASHBOARD_QUERY = gql`
  query OwnerDashboard {
    ownerDashboard {
      totalMembers
      totalCoaches
      activeProgramAssignments
      workoutLogsLast7Days
    }
  }
`;