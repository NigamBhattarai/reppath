import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongod: MongoMemoryReplSet;

export const connectTestDB = async (): Promise<void> => {
  mongod = await MongoMemoryReplSet.create({
    replSet: { count: 1 }
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

export const closeTestDB = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export const clearTestDB = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};