import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorPayload } from '@repo/types';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const isDev = process.env.NODE_ENV === 'development';

  const buildErrorPayload = (override: Partial<ApiErrorPayload>): ApiErrorPayload => ({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    ...override,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: buildErrorPayload({
        code: 'APP_ERROR',
        message: err.message,
        ...(isDev && { details: { stack: err.stack } }),
      }),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: buildErrorPayload({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: { issues: err.errors },
      }),
    });
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  return res.status(500).json({
    success: false,
    error: buildErrorPayload({
      ...(isDev && { details: { message: err.message, stack: err.stack } }),
    }),
  });
}
