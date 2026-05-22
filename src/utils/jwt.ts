import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export const generateToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
