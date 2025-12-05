import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from '../schema/index.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function reset() {
  console.log('🗑️  Resetting database...');

  // Truncate all tables
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  console.log('✅ Truncated all tables');

  console.log('🎉 Reset complete!');
  process.exit(0);
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
