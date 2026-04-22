import { Query } from './query';
import { Mutation } from './mutation';

const DateScalar = {
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('DateScalar can only serialize Date objects');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('DateScalar can only parse string values');
  },
  parseLiteral(ast: { kind: string; value?: string }): Date {
    if (ast.kind === 'StringValue' && ast.value) {
      return new Date(ast.value);
    }
    throw new Error('DateScalar literal must be a string');
  }
};

import {
  UserFieldResolvers,
  ProgramFieldResolvers,
  WeekFieldResolvers,
  DayFieldResolvers
} from './fields';

export const resolvers = {
  Date: DateScalar,
  Query,
  Mutation,
  User: UserFieldResolvers,
  Program: ProgramFieldResolvers,
  Week: WeekFieldResolvers,
  Day: DayFieldResolvers
};