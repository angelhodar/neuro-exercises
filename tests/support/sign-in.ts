import { setTimeout } from "node:timers/promises";

interface LoginResponse {
  headers: () => Partial<Record<string, string>>;
  status: () => number;
}

interface LoginClient {
  post: (
    path: string,
    options: { data: { email: string; password: string } }
  ) => Promise<LoginResponse>;
}

export async function signInUser(
  client: LoginClient,
  credentials: { email: string; password: string },
  wait: (milliseconds: number) => Promise<unknown> = setTimeout
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: retry only after the real server's rate-limit response
    const response = await client.post("/api/auth/sign-in/email", {
      data: credentials,
    });
    const status = response.status();
    if (status === 200) {
      return;
    }
    const headers = response.headers();
    const seconds = Number(headers["retry-after"] ?? headers["x-retry-after"]);
    if (
      status !== 429 ||
      attempt === 2 ||
      !Number.isFinite(seconds) ||
      seconds <= 0 ||
      seconds > 15
    ) {
      throw new Error(`Synthetic account login failed (${status})`);
    }
    // This is server-directed backoff, not a fixed browser synchronization sleep.
    await wait(seconds * 1000);
  }
}
