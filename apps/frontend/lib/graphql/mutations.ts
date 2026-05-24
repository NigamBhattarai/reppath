import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER_OWNER_MUTATION = gql`
  mutation RegisterOwner($input: RegisterOwnerInput!) {
    registerOwner(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;