import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalLimiter } from './middlewares/rateLimiter';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import router from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use('/api', globalLimiter);
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => res.status(200).json({ status: 'ok', message: 'Lakri Chulay Ranna Server is running' }));
app.get('/health', (req: Request, res: Response) => res.status(200).json({ status: 'ok', message: 'Server is healthy' }));

app.use('/api/v1', router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
