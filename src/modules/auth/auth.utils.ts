import { generateToken, verifyToken } from '../../utils/jwt';
import { Secret } from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { userId: string; role: string; email: string },
  secret: Secret,
  expiresIn: string
) => {
  return generateToken(jwtPayload, secret, expiresIn);
};

export const verifyAuthToken = (token: string, secret: Secret) => {
  return verifyToken(token, secret);
};
