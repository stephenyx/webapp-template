import { Router } from 'express';
import type { ApiResponse } from '@repo/types';
import { withRetries } from '../lib/retry.js';
import { db } from '@repo/db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', (_req, res) => {
  const payload: ApiResponse<{
    status: string;
    timestamp: string;
    uptime: number;
  }> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };

  res.json(payload);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check (includes DB)
 *     responses:
 *       200:
 *         description: Server is ready
 *       503:
 *         description: Server is not ready
 */
router.get('/health/ready', async (_req, res, next) => {
  try {
    let databaseStatus: 'ok' | 'error' = 'ok';

    await withRetries(async () => {
      await db.execute(sql`select 1`);
    }).catch(() => {
      databaseStatus = 'error';
    });

    const payload: ApiResponse<{
      status: string;
      timestamp: string;
      checks: {
        database: 'ok' | 'error';
      };
    }> = {
      success: true,
      data: {
        status: databaseStatus === 'ok' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks: {
          database: databaseStatus,
        },
      },
    };

    res.status(databaseStatus === 'ok' ? 200 : 503).json(payload);
  } catch (err) {
    next(err);
  }
});


export { router as healthRoutes };
