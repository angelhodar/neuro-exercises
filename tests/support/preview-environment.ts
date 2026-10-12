export function previewBaseUrl() {
  if (!process.env.E2E_BASE_URL) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(process.env.E2E_BASE_URL);
  } catch {
    // biome-ignore lint/style/useErrorCause: invalid URL errors retain the input, which may contain credentials
    throw new Error("E2E_BASE_URL must be a valid HTTPS preview origin");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "E2E_BASE_URL must be an HTTPS preview origin without credentials, query parameters, or a path"
    );
  }
  if (!process.env.E2E_TOKEN || process.env.E2E_TOKEN.length < 32) {
    throw new Error(
      "A preview E2E_TOKEN of at least 32 characters is required"
    );
  }
  return url.origin;
}

export function deploymentHeaders(): Record<string, string> {
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return bypass ? { "x-vercel-protection-bypass": bypass } : {};
}
