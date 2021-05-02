import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

let mongo: any;

// Expose a cookie extractor method.

// Allow us to add our signin method to the global object.
// Note that a cookie is an array of string.
declare global {
  namespace NodeJS {
    interface Global {
      signinCookie(userId?: string): string[];
    }
  }
}

// Look for a file in __mocks__/
jest.mock('../nats-wrapper');

// No longer async. Note type is also changed.
global.signinCookie = (userId: string) => {
  // We need to build a mocked token and cookie.
  const fakeUserID = userId || new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id: fakeUserID,
    email: 'fake@faker.org',
  };

  const userJwt = jwt.sign(
    payload,
    // The ! indicates that TS should allow this.
    process.env.JWT_KEY!
  );

  const session = {
    jwt: userJwt,
  };

  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString('base64');
  const cookie = `express:sess=${base64}`;
  return [cookie];
};

beforeAll(async () => {
  // temp hack to deal with emulating
  // a k8s secret
  process.env.JWT_KEY = 'test-secret';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
