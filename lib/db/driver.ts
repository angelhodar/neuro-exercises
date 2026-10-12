export function getDatabaseDriver(
  connectionString: string,
  configured?: string
) {
  if (configured) {
    if (configured !== "neon" && configured !== "postgres") {
      throw new Error("DATABASE_DRIVER must be neon or postgres");
    }
    return configured;
  }

  // Keep the hosted Neon HTTP transport; ordinary PostgreSQL uses TCP.
  const hostname = connectionString ? new URL(connectionString).hostname : "";
  return hostname.endsWith(".neon.tech") ? "neon" : "postgres";
}
