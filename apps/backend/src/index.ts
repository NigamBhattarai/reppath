import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema/typeDefs';
import { resolvers } from './graphql/resolvers';
import { buildContext } from './middleware/auth';
import { GraphQLFormattedError } from 'graphql';
import { ZodError } from 'zod';
import { ZodIssue } from 'zod/v3';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async (): Promise<void> => {
  await connectDB();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError, error): GraphQLFormattedError => {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;
        return {
          message: 'Validation failed',
          extensions: {
            code: 'VALIDATION_ERROR',
            issues: zodError.issues.map(issue => ({
              path: issue.path,
              message: issue.message
            }))
          }
        };
      }
      return formattedError;
    }
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req)
    })
  );


  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
};

start();