import pg from 'pg';
const { Pool } = pg;

let pool: pg.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5960,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'powa_db',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
};

export const testConnection = async () => {
  const pool = getPool();
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected successfully');
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Failed to connect to database:', error);
        throw error;
      }
      console.log(`Waiting for database... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
