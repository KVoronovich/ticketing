import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@kvoronovichtickets/common';

import { Password } from '../services/password';
import { User } from '../models/user';

const router = express.Router();

router.post(
    '/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const isPasswordValid = await Password.compare(existingUser.password, password);

        if (!isPasswordValid) {
            throw new BadRequestError('Invalid credentials');
        }

        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!);

        req.session = { jwt: userJwt };
        await existingUser.save();

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
