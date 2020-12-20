import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
    namespace NodeJS {
        interface Global {
            signin(userId?: string): string[]
        }
    }
}

let mongo: any;

jest.mock('../nats-wrapper');

// this is a test key
process.env.STRIPE_KEY = 'sk_test_51GdDzvDoL2YU28ykED3ay8ykf8a9b1gNnw8ReFhxiUQOObukV5NKNSt81MIiUfO5Vi2f8uGoPQiIQDXNjTSrXVI100fn8j3dQ6'

beforeAll(async () => {
    process.env.JWT_KEY = 'secret for tests'; // temp solution to be replaced
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
   const collections = await mongoose.connection.db.collections();
   
   for (let collection of collections) {
       await collection.deleteMany({});
   }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (userId?: string) => {
    const email = 'test@test.com';
    const id = userId || new mongoose.Types.ObjectId().toHexString();
    const token = jwt.sign({ id, email }, process.env.JWT_KEY!);
    const sessionJSON = JSON.stringify({ jwt: token });
    const base64 = Buffer.from(sessionJSON).toString('base64');
    return [`express:sess=${base64}`];
}