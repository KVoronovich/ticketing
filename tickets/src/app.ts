import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@kvoronovichtickets/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { updateTicketRouter } from './routes/update';
import { indexTicketRouter } from './routes';

const app = express();
app.use(json());
app.set('trust proxy', true);
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
