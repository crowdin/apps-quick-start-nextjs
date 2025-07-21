import { PrismaClient } from '.prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * `prisma` is a **singleton** instance of `PrismaClient`.
 *
 * Creating a new `PrismaClient` on every request would exhaust the database
 * connection pool very quickly in serverless (or edge) environments. To avoid
 * this, we attach the client to the `global` object when we are **not** in a
 * production build. In production the module is only evaluated once, so a
 * new instance is safe.
 *
 * The client logs are more verbose in the development environment to aid
 * debugging.
 */
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
