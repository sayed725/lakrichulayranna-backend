import { Prisma } from '@prisma/client';

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
  let message = 'Database Error';
  let statusCode = 400;

  if (err.code === 'P2002') {
    message = `Duplicate field value: ${err.meta?.target}`;
    statusCode = 409;
  } else if (err.code === 'P2025') {
    message = 'Record not found';
    statusCode = 404;
  }

  return { statusCode, message };
};

export default handlePrismaError;
