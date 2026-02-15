import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
// biome-ignore lint/performance/noNamespaceImport: drizzle requires namespace import for schema
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL ?? "", { schema });
