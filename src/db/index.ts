import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';
import dotenv from 'dotenv';

dotenv.config();

export type DbEngineType = 'mysql';

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

/**
 * Hostinger MySQL Connection Pool Configuration
 */
export const createMysqlPool = (): mysql.Pool => {
  if (!global._mysqlPool) {
    const connString = process.env.DATABASE_URL?.trim() || 'mysql://u822437904_m2m_admin:Hareem%40sep2026@srv2108.hstgr.io:3306/u822437904_map2medic';

    if (connString.startsWith('mysql://') || connString.startsWith('mysql2://')) {
      console.log('Connecting to Hostinger Remote MySQL database...');
      global._mysqlPool = mysql.createPool({
        uri: connString,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
    } else {
      console.log('Connecting to Hostinger MySQL via MYSQL_HOST configuration...');
      global._mysqlPool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'srv2108.hstgr.io',
        user: process.env.MYSQL_USER || 'u822437904_m2m_admin',
        password: process.env.MYSQL_PASSWORD || 'Hareem@sep2026',
        database: process.env.MYSQL_DATABASE || 'u822437904_map2medic',
        port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });
    }
  }

  return global._mysqlPool;
};

export const activeEngine = 'mysql';

// Export pool and db instance
export const mysqlPool = createMysqlPool();
export const db = drizzle(mysqlPool, { schema, mode: 'default' });
