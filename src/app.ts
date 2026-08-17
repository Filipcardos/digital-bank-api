import express, { Application } from 'express';
import { routes } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app: Application = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'DIO Bank API',
    status: 'ok',
    docs: 'Consulte o README do repositório para a lista completa de endpoints.',
  });
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
