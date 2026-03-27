const GITHUB_API = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER ?? "angelhodar";
const REPO = process.env.GITHUB_REPO ?? "neuro-exercises";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function githubFetch(path: string, options?: RequestInit) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub API error ${response.status} for ${path}: ${body}`
    );
  }

  return response.json();
}

export async function getMainBranchSha(): Promise<string> {
  const data = await githubFetch(
    `/repos/${OWNER}/${REPO}/git/ref/heads/main`
  );
  return data.object.sha as string;
}

export async function createBranch(
  branchName: string,
  sha: string
): Promise<void> {
  await githubFetch(`/repos/${OWNER}/${REPO}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
  });
}

export async function getFileSha(
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const data = await githubFetch(
      `/repos/${OWNER}/${REPO}/contents/${path}?ref=${branch}`
    );
    return (data.sha as string) ?? null;
  } catch {
    return null;
  }
}

export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
  branch: string,
  existingSha?: string | null
): Promise<void> {
  const base64Content = Buffer.from(content, "utf8").toString("base64");
  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }
  await githubFetch(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export interface PullRequest {
  number: number;
  html_url: string;
}

export async function createPullRequest(
  title: string,
  body: string,
  head: string,
  base = "main"
): Promise<PullRequest> {
  const data = await githubFetch(`/repos/${OWNER}/${REPO}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, body, head, base }),
  });
  return { number: data.number as number, html_url: data.html_url as string };
}
