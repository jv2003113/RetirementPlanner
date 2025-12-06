
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'undefined');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Adding breakdown columns to annual_snapshots table...');

        await client.query(`
      ALTER TABLE annual_snapshots 
      ADD COLUMN IF NOT EXISTS income_breakdown JSONB,
      ADD COLUMN IF NOT EXISTS expense_breakdown JSONB;
    `);

        console.log('✅ Successfully added breakdown columns.');
    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
