import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate<T extends ZodSchema>(schema: T, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(result.error);
    }

    req[target] = result.data;
    next();
  };
}
