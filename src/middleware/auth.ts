import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface CustomRequest extends Request {
    userId?: number;
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    let token = req.headers['x-access-token'] as string || req.headers['authorization'];

    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) {
        return res.status(403).json({
            message: 'No token provided!',
        });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Unauthorized!',
            });
        }
        (req as any).user = decoded;
        next();
    });
};

export const authMiddleware = {
    verifyToken,
};
