import { Request, Response, NextFunction } from 'express';
import { Messages } from '../constants/messages';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `${Messages.NOT_FOUND} - ${req.originalUrl}`,
  });
};

export default notFound;
