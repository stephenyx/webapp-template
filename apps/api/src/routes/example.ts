import { Router } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '@repo/types';
import { validate } from '../middleware/validate.js';

const router = Router();

const echoSchema = z.object({
  message: z.string().min(1),
});

/**
 * @swagger
 * /example/echo:
 *   post:
 *     summary: Example endpoint demonstrating Zod validation and standard response envelope
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Echoed message
 */
router.post(
  '/example/echo',
  validate(echoSchema, 'body'),
  (req, res) => {
    const payload: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: req.body.message,
      },
    };

    res.json(payload);
  }
);

export { router as exampleRoutes };

