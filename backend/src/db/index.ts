import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

export function getDb(d1?: any) {
  if (d1) {
    _db = drizzle(d1, { schema });
    return _db;
  }
  if (_db) return _db;
  throw new Error('D1 database not initialized.');
}
