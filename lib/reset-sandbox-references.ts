import { getSandboxNamespace } from "./sandbox-identity";

interface ResetClient {
  query: (
    text: string,
    values?: unknown[]
  ) => Promise<{ rows: { id: number }[] }>;
}

// Only resets references in the selected DB. Never stops/deletes remote sandboxes
// that may still belong to the source database of a clone.
export async function resetSandboxReferences(client: ResetClient) {
  const namespace = getSandboxNamespace();
  await client.query("BEGIN");
  try {
    await client.query(
      "LOCK TABLE exercise_workspaces, exercise_chat_generation IN SHARE ROW EXCLUSIVE MODE"
    );
    const active = await client.query(
      "SELECT id FROM exercise_workspaces WHERE active_generation_id IS NOT NULL AND (lock_expires_at IS NULL OR lock_expires_at > now()) LIMIT 1"
    );
    if (active.rows.length > 0) {
      throw new Error(
        "Active generation lock found. Stop generation traffic and wait for its lock to expire before resetting references"
      );
    }

    await client.query(
      "UPDATE exercise_chat_generation SET status = 'ERROR', updated_at = now() WHERE status = 'GENERATING'"
    );
    const workspaces = await client.query(
      `UPDATE exercise_workspaces SET
        harness_session_id = $1 || '-exercise-' || exercise_id::text,
        sandbox_name = NULL, harness_resume_state = NULL,
        active_generation_id = NULL, lock_expires_at = NULL,
        base_commit_sha = NULL, last_active_at = NULL, last_error = NULL,
        updated_at = now() RETURNING id`,
      [namespace]
    );
    const previews = await client.query(
      "UPDATE exercise_chat_generation SET sandbox_id = NULL, updated_at = now() WHERE sandbox_id IS NOT NULL RETURNING id"
    );
    await client.query("COMMIT");
    return {
      previews: previews.rows.length,
      workspaces: workspaces.rows.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
