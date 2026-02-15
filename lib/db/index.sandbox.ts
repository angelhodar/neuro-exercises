import "dotenv/config";

import { drizzle } from "drizzle-orm/pglite";
// biome-ignore lint/performance/noNamespaceImport: drizzle requires namespace import for schema
import * as schema from "./schema";

export const db = drizzle({ schema });
