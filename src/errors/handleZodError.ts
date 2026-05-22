import { ZodError, ZodIssue } from 'zod';

const handleZodError = (err: ZodError) => {
  const statusCode = 400;
  const message = err.issues.map((issue: ZodIssue) => `${String(issue.path[issue.path.length - 1])} is ${issue.message}`).join('. ');

  return { statusCode, message };
};

export default handleZodError;
