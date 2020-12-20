import mongoose from 'mongoose';

import { app } from './app';

const PORT = 3000;

const start = async () => {
    console.log('starting auth service');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT must be defined');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('DB connected');
    } catch (e) {
        console.error(e);
    }

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
};

start();
