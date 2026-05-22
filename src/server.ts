import app from './app';
import { env } from './config/env';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const startServer = async () => {
  try {
    // Attempt to connect to database
    await prisma.$connect();
    console.log('✅ Connected to database successfully');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', async (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  await prisma.$disconnect();
  process.exit(1);
});
