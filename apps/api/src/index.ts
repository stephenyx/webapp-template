import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { swaggerSpec } from './lib/swagger.js';
import { corsMiddleware, rateLimiter, errorHandler } from './middleware/index.js';
import { apiRoutes } from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(rateLimiter);

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: env.NODE_ENV !== 'test',
  })
);

// API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/v1', apiRoutes);

// Legacy health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📚 API docs at http://localhost:${env.PORT}/api/docs`);
});

export { app };
