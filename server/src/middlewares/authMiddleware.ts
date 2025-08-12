import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  const [, token] = authorization.split(' ');

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET as string);
    const { id } = data as TokenPayload;

    // Você pode anexar o id do usuário na requisição para usar nos controllers
    // req.userId = id;

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}