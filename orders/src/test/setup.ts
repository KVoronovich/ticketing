import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[]
        }
    }
}

let mongo: any;

jest.mock('../nats-wrapper');

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

global.signin = () => {
    const email = 'test@test.com';
    const id = new mongoose.Types.ObjectId().toHexString();
    const token = jwt.sign({ id, email }, process.env.JWT_KEY!);
    const sessionJSON = JSON.stringify({ jwt: token });
    const base64 = Buffer.from(sessionJSON).toString('base64');
    return [`express:sess=${base64}`];
}