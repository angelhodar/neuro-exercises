import "dotenv/config"

import { drizzle } from 'drizzle-orm/pglite';
import * as schema from "./schema"

export const db = drizzle({ schema })
