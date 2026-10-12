import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire, Module } from "node:module";
import { after, before, mock, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { organization as organizationPlugin } from "better-auth/plugins/organization";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import type { ExerciseRefinementMessage } from "../lib/ai/refinement/agent";
// biome-ignore lint/performance/noNamespaceImport: Drizzle requires the relation schema
import * as schema from "../lib/db/schema";

const require = createRequire(`${process.cwd()}/package.json`);
const postgres = new PGlite();
const database = drizzle(postgres, { schema });
const password = "Audit-password-2026";
let requestHeaders = new Headers();
let usersActions: typeof import("../app/actions/users");
let organizationsActions: typeof import("../app/actions/organizations");
let patientsActions: typeof import("../app/actions/patients");
let localAuth: ReturnType<typeof createLocalAuth>;
let ownerCookie: string;
let memberCookie: string;
let adminCookie: string;
let ownerId: string;
let memberId: string;
let organizationId: string;
let ownerPatientId: number;

function createLocalAuth(
  options: Pick<BetterAuthOptions, "emailAndPassword" | "session">
) {
  return betterAuth({
    baseURL: "http://localhost:3000",
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: {
        ...schema,
        account: schema.accounts,
        session: schema.sessions,
        user: schema.users,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: options.emailAndPassword,
    logger: { disabled: true },
    plugins: [
      organizationPlugin({
        invitationExpiresIn: 7 * 24 * 60 * 60,
        requireEmailVerificationOnInvitation: true,
      }),
      admin(),
    ],
    rateLimit: { enabled: true, storage: "database" },
    secret: process.env.BETTER_AUTH_SECRET,
    session: options.session,
  });
}

function setRequestCookie(cookie = "") {
  requestHeaders = new Headers({ cookie });
}

async function signIn(email: string) {
  const response = await localAuth.api.signInEmail({
    asResponse: true,
    body: { email, password },
  });
  assert.equal(response.status, 200);
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

before(async () => {
  // Authorization denials are expected; failed assertions still report their errors.
  mock.method(console, "error", () => undefined);
  // All application DB operations are redirected to an isolated PostgreSQL engine.
  // No Neon connection is used, even if the developer has a configured .env file.
  process.env.DATABASE_URL = "postgresql://audit:audit@localhost:5432/audit";
  process.env.BETTER_AUTH_SECRET = "isolated-auth-regression-test-secret-2026";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";

  // The vector-only migration is unrelated to auth/patients and requires pgvector.
  const migrations = await Promise.all(
    [
      "0000_sudden_sunspot.sql",
      "0001_charming_aaron_stack.sql",
      "0002_romantic_frog_thor.sql",
      "0004_overrated_sebastian_shaw.sql",
      "0005_lazy_thunderbird.sql",
      "0006_many_red_shift.sql",
      "0007_boring_the_spike.sql",
      "0008_last_jackpot.sql",
    ].map((filename) => readFile(`drizzle/${filename}`, "utf8"))
  );
  await postgres.exec(migrations.join("\n"));
  await postgres.exec(`
    INSERT INTO users (id, email, name) VALUES ('legacy-user', 'legacy@example.invalid', NULL), ('later-user', 'later@example.invalid', 'Later');
    INSERT INTO organizations (id, name, slug) VALUES ('legacy-org', 'Legacy', NULL), ('owned-org', 'Owned', 'owned-org');
    INSERT INTO members (id, organization_id, user_id, role, created_at) VALUES
      ('legacy-admin', 'legacy-org', 'legacy-user', 'admin', '2020-01-01'),
      ('later-admin', 'legacy-org', 'later-user', 'admin', '2020-01-02'),
      ('preserved-admin', 'owned-org', 'later-user', 'admin', '2020-01-01'),
      ('existing-owner', 'owned-org', 'legacy-user', 'owner', '2020-01-02');
  `);
  await postgres.exec(await readFile("drizzle/0009_public_sage.sql", "utf8"));
  await postgres.exec(
    await readFile("drizzle/0010_exercise_requirement_drafts.sql", "utf8")
  );

  const nextHeaders = require("next/headers") as typeof import("next/headers");
  const nextCache = require("next/cache") as typeof import("next/cache");
  mock.method(nextHeaders, "headers", () => Promise.resolve(requestHeaders));
  mock.method(nextCache, "revalidatePath", () => undefined);

  const { db } = await import("../lib/db");
  Object.assign(db.query, database.query);
  mock.method(
    db,
    "select",
    database.select.bind(database) as unknown as typeof db.select
  );
  mock.method(
    db,
    "insert",
    database.insert.bind(database) as unknown as typeof db.insert
  );
  mock.method(
    db,
    "update",
    database.update.bind(database) as unknown as typeof db.update
  );
  mock.method(
    db,
    "delete",
    database.delete.bind(database) as unknown as typeof db.delete
  );

  const { auth } = await import("../lib/auth/auth.server");
  localAuth = createLocalAuth(auth.options);
  type ApiMethods = Record<string, (...args: unknown[]) => unknown>;
  const appApi = auth.api as unknown as ApiMethods;
  const testApi = localAuth.api as unknown as ApiMethods;
  for (const method of [
    "getSession",
    "createUser",
    "createOrganization",
    "updateOrganization",
    "deleteOrganization",
    "createInvitation",
    "removeMember",
    "addMember",
  ]) {
    mock.method(appApi, method, (...args: unknown[]) =>
      Reflect.apply(testApi[method], testApi, args)
    );
  }

  usersActions = await import("../app/actions/users");
  organizationsActions = await import("../app/actions/organizations");
  patientsActions = await import("../app/actions/patients");

  const owner = await localAuth.api.createUser({
    body: {
      email: "owner@example.invalid",
      name: "Owner",
      password,
      role: "user",
    },
  });
  const regular = await localAuth.api.createUser({
    body: {
      email: "member@example.invalid",
      name: "Member",
      password,
      role: "user",
    },
  });
  await localAuth.api.createUser({
    body: {
      email: "admin@example.invalid",
      name: "Admin",
      password,
      role: "admin",
    },
  });
  ownerId = owner.user.id;
  memberId = regular.user.id;
  ownerCookie = await signIn("owner@example.invalid");
  memberCookie = await signIn("member@example.invalid");
  adminCookie = await signIn("admin@example.invalid");
});

after(async () => {
  mock.restoreAll();
  await postgres.close();
});

test("auth migration backfills required fields and preserves/promotes organization owners", async () => {
  const legacyUser = await database.query.users.findFirst({
    where: eq(schema.users.id, "legacy-user"),
  });
  const legacyOrganization = await database.query.organization.findFirst({
    where: eq(schema.organization.id, "legacy-org"),
  });
  const legacyAdmin = await database.query.member.findFirst({
    where: eq(schema.member.id, "legacy-admin"),
  });
  const existingOwner = await database.query.member.findFirst({
    where: eq(schema.member.id, "existing-owner"),
  });
  assert.equal(legacyUser?.name, "legacy@example.invalid");
  assert.equal(legacyOrganization?.slug, "legacy-legacy-org");
  assert.equal(legacyAdmin?.role, "owner");
  assert.equal(existingOwner?.role, "owner");
  const laterAdmin = await database.query.member.findFirst({
    where: eq(schema.member.id, "later-admin"),
  });
  const preservedAdmin = await database.query.member.findFirst({
    where: eq(schema.member.id, "preserved-admin"),
  });
  assert.equal(laterAdmin?.role, "admin");
  assert.equal(preservedAdmin?.role, "admin");
});

test("anonymous and non-admin callers cannot create admins or enumerate users", async () => {
  const input = {
    email: "blocked@example.invalid",
    name: "Blocked",
    password,
    role: "admin" as const,
  };
  async function assertForbiddenUserManagement(cookie: string) {
    setRequestCookie(cookie);
    assert.ok((await usersActions.createUser(input)).error);
    await assert.rejects(usersActions.getUsers());
  }
  await assertForbiddenUserManagement("");
  await assertForbiddenUserManagement(memberCookie);
  assert.equal(
    await database.query.users.findFirst({
      where: eq(schema.users.email, input.email),
    }),
    undefined
  );
  setRequestCookie(adminCookie);
  const created = await usersActions.createUser({
    ...input,
    email: "allowed@example.invalid",
    role: "user",
  });
  assert.equal(created.user?.role, "user");
});

test("server-side validation rejects forged roles and short passwords", async () => {
  setRequestCookie(adminCookie);
  const invalidRole = {
    email: "forged@example.invalid",
    name: "Forged",
    password,
    role: "superadmin",
  };
  assert.ok(
    (
      await usersActions.createUser(
        invalidRole as Parameters<typeof usersActions.createUser>[0]
      )
    ).error
  );
  assert.ok(
    (
      await usersActions.createUser({
        email: "short@example.invalid",
        name: "Short",
        password: "x",
        role: "user",
      })
    ).error
  );
  assert.equal(
    await database.query.users.findFirst({
      where: eq(schema.users.email, invalidRole.email),
    }),
    undefined
  );
});

test("organization APIs enforce ownership, membership, and last-owner protection", async () => {
  setRequestCookie(ownerCookie);
  const created = await organizationsActions.createOrganization({
    name: "Audit Organization",
    slug: "audit-org",
  });
  assert.ok(created);
  organizationId = created.id;
  const creator = await database.query.member.findFirst({
    where: eq(schema.member.organizationId, organizationId),
  });
  assert.equal(creator?.role, "owner");
  assert.equal(
    (
      await organizationsActions.addMemberToOrganization(
        "member@example.invalid",
        "member",
        organizationId
      )
    ).success,
    true
  );

  setRequestCookie(memberCookie);
  assert.ok(
    (
      await organizationsActions.addMemberToOrganization(
        "admin@example.invalid",
        "owner",
        organizationId
      )
    ).error
  );
  await assert.rejects(
    organizationsActions.updateOrganization(organizationId, {
      name: "Hijacked",
    })
  );
  await assert.rejects(organizationsActions.deleteOrganization(organizationId));
  assert.equal((await organizationsActions.getAllOrganizations()).length, 1);
  const directory = await usersActions.getAvailableUsers();
  assert.ok(directory.some((user) => user.id === ownerId));
  assert.ok(!directory.some((user) => user.email === "legacy@example.invalid"));

  setRequestCookie();
  assert.ok(
    (
      await organizationsActions.addMemberToOrganization(
        "admin@example.invalid",
        "owner",
        organizationId
      )
    ).error
  );
  await assert.rejects(organizationsActions.getOrgMembers(organizationId));
  await assert.rejects(organizationsActions.getAllOrganizations());

  setRequestCookie(adminCookie);
  assert.ok(
    (
      await organizationsActions.addMemberToOrganization(
        "admin@example.invalid",
        "owner",
        organizationId
      )
    ).error
  );

  setRequestCookie(ownerCookie);
  assert.equal(
    (
      await organizationsActions.addMemberToOrganization(
        "admin@example.invalid",
        "admin",
        organizationId
      )
    ).success,
    true
  );
  setRequestCookie(adminCookie);
  assert.ok(
    (
      await organizationsActions.addMemberToOrganization(
        "allowed@example.invalid",
        "owner",
        organizationId
      )
    ).error
  );
  await organizationsActions.updateOrganization(organizationId, {
    name: "Managed by admin",
  });
  await assert.rejects(organizationsActions.deleteOrganization(organizationId));

  setRequestCookie(ownerCookie);
  await assert.rejects(
    organizationsActions.removeMemberFromOrganization(organizationId, ownerId)
  );
  await organizationsActions.removeMemberFromOrganization(
    organizationId,
    memberId
  );
  setRequestCookie(memberCookie);
  await assert.rejects(
    organizationsActions.getOrganizationById(organizationId)
  );
  await assert.rejects(organizationsActions.getOrgMembers(organizationId));
});

test("accepting an invitation requires verified ownership of the recipient email", async () => {
  const invitation = await localAuth.api.createInvitation({
    body: { email: "member@example.invalid", organizationId, role: "member" },
    headers: new Headers({ cookie: ownerCookie }),
  });
  await assert.rejects(
    localAuth.api.acceptInvitation({
      body: { invitationId: invitation.id },
      headers: new Headers({ cookie: memberCookie }),
    })
  );
  assert.equal(
    await database.query.member.findFirst({
      where: eq(schema.member.userId, memberId),
    }),
    undefined
  );
});

test("anonymous upload-token requests return 401 before issuing a Blob token", async () => {
  const { POST } = await import("../app/api/media/upload/route");
  const response = await POST(
    new Request("http://localhost:3000/api/media/upload", {
      body: JSON.stringify({
        payload: {
          clientPayload: null,
          multipart: false,
          pathname: "audit.png",
        },
        type: "blob.generate-client-token",
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    })
  );
  assert.equal(response.status, 401);
});

test("generation requests enforce authentication, validation, and exercise ownership", async (t) => {
  // The Pi runtime is ESM-only; this suite runs through tsx's CommonJS loader.
  // Substitute the agent before loading the route, also preventing paid calls.
  const agentPath = require.resolve("./lib/ai/agent/agent.ts");
  const previousAgent = require.cache[agentPath];
  const agentModule = new Module(agentPath);
  agentModule.exports = {
    exerciseAgent: {
      createSession() {
        throw new Error("Unexpected agent session in authorization test");
      },
      stream() {
        throw new Error("Unexpected agent call in authorization test");
      },
    },
  };
  require.cache[agentPath] = agentModule;
  t.after(() => {
    if (previousAgent) {
      require.cache[agentPath] = previousAgent;
    } else {
      delete require.cache[agentPath];
    }
  });
  const { NextRequest } = await import("next/server");
  const { POST } = await import("../app/api/chat/route");
  function request(body: unknown) {
    return new NextRequest("http://localhost:3000/api/chat", {
      body: JSON.stringify(body),
      headers: requestHeaders,
      method: "POST",
    });
  }
  const messages = [
    { id: "user", parts: [{ text: "Refine", type: "text" }], role: "user" },
  ];
  setRequestCookie();
  const anonymous = await POST(
    request({ messages, slug: "private-generation" })
  );
  assert.equal(anonymous.status, 401);
  assert.equal(await anonymous.text(), "No autorizado");

  setRequestCookie(ownerCookie);
  assert.equal((await POST(request({ messages, slug: 123 }))).status, 400);
  assert.equal(
    (await POST(request({ messages, slug: "missing" }))).status,
    404
  );
  await database.insert(schema.exercises).values({
    creatorId: ownerId,
    displayName: "Private generation",
    slug: "private-generation",
  });
  setRequestCookie(memberCookie);
  const foreign = await POST(request({ messages, slug: "private-generation" }));
  assert.equal(foreign.status, 403);
  assert.equal(await foreign.text(), "No autorizado");
  setRequestCookie(ownerCookie);
  const noGeneration = await POST(
    request({ messages, slug: "private-generation" })
  );
  assert.equal(noGeneration.status, 400);
  assert.equal(await noGeneration.text(), "No generation to process");
});

test("anonymous patient mutations retain their Unauthorized error and read fallbacks", async () => {
  setRequestCookie();
  assert.deepEqual(await patientsActions.getPatients(), []);
  assert.equal(await patientsActions.getPatientById(1), null);
  const mutations = [
    () =>
      patientsActions.createPatient({
        firstName: "Private",
        lastName: "Patient",
      }),
    () => patientsActions.updatePatient(1, { firstName: "Changed" }),
    () => patientsActions.deletePatient(1),
    () =>
      patientsActions.createPatientSession({
        discipline: "speech",
        patientId: 1,
        type: "therapy",
      }),
    () =>
      patientsActions.updatePatientSession(1, 1, { observations: "Changed" }),
    () => patientsActions.deletePatientSession(1, 1),
    () =>
      patientsActions.createPatientTest({
        evaluatedProcess: "memory",
        patientId: 1,
      }),
    () => patientsActions.updatePatientTest(1, 1, { score: "Changed" }),
    () => patientsActions.deletePatientTest(1, 1),
  ];
  await Promise.all(
    mutations.map((mutate) =>
      assert.rejects(mutate, { message: "Unauthorized", name: "Error" })
    )
  );
});

test("patient data and child records cannot be accessed or mutated by another user", async () => {
  setRequestCookie(ownerCookie);
  const patient = await patientsActions.createPatient({
    firstName: "Private",
    lastName: "Patient",
  });
  ownerPatientId = patient.id;
  const session = await patientsActions.createPatientSession({
    discipline: "speech",
    patientId: patient.id,
    type: "therapy",
  });
  const result = await patientsActions.createPatientTest({
    evaluatedProcess: "memory",
    patientId: patient.id,
    sessionId: session.id,
  });

  setRequestCookie(memberCookie);
  assert.equal(await patientsActions.getPatientById(patient.id), undefined);
  await assert.rejects(
    patientsActions.updatePatient(patient.id, { firstName: "Hijacked" })
  );
  await assert.rejects(patientsActions.deletePatient(patient.id));
  await assert.rejects(
    patientsActions.createPatientSession({
      discipline: "speech",
      patientId: patient.id,
      type: "therapy",
    })
  );
  await assert.rejects(
    patientsActions.updatePatientSession(session.id, patient.id, {
      observations: "Hijacked",
    })
  );
  await assert.rejects(
    patientsActions.deletePatientSession(session.id, patient.id)
  );
  await assert.rejects(
    patientsActions.createPatientTest({
      evaluatedProcess: "memory",
      patientId: patient.id,
    })
  );
  await assert.rejects(
    patientsActions.updatePatientTest(result.id, patient.id, {
      score: "Hijacked",
    })
  );
  await assert.rejects(
    patientsActions.deletePatientTest(result.id, patient.id)
  );

  const ownPatient = await patientsActions.createPatient({
    firstName: "Other",
    lastName: "Patient",
  });
  await assert.rejects(
    patientsActions.updatePatientSession(session.id, ownPatient.id, {
      observations: "Wrong parent",
    })
  );
  await assert.rejects(
    patientsActions.createPatientTest({
      evaluatedProcess: "memory",
      patientId: ownPatient.id,
      sessionId: session.id,
    })
  );
  assert.equal(
    (
      await database.query.patients.findFirst({
        where: eq(schema.patients.id, patient.id),
      })
    )?.firstName,
    "Private"
  );

  setRequestCookie(ownerCookie);
  await patientsActions.updatePatient(patient.id, { firstName: "Updated" });
  await patientsActions.updatePatientSession(session.id, patient.id, {
    observations: "Updated",
  });
  await patientsActions.updatePatientTest(result.id, patient.id, {
    score: "Updated",
  });
});

test("requirements drafts persist messages and are private to their creator", async () => {
  const { createRequirementDraft } = await import(
    "../app/actions/exercise-requirement-drafts"
  );
  const {
    findRequirementDraft,
    listRequirementDrafts,
    saveRequirementDraftTurn,
    saveRequirementDraftResponse,
  } = await import("../lib/ai/refinement/draft-repository");
  setRequestCookie();
  await assert.rejects(createRequirementDraft("Private idea"));
  setRequestCookie(ownerCookie);
  await assert.rejects(createRequirementDraft(" "));
  const { id } = await createRequirementDraft("An attention exercise");
  const initial = await findRequirementDraft(id, ownerId);
  assert.ok(initial);
  assert.equal(initial.revision, 0);
  assert.equal(initial.messages[0].parts[0].type, "text");
  assert.ok(
    (await listRequirementDrafts(ownerId)).some((draft) => draft.id === id)
  );
  const memberUser = await localAuth.api.getSession({
    headers: new Headers({ cookie: memberCookie }),
    query: { disableCookieCache: true },
  });
  assert.ok(memberUser);
  assert.equal(await findRequirementDraft(id, memberUser.user.id), undefined);
  assert.ok(
    !(await listRequirementDrafts(memberUser.user.id)).some(
      (draft) => draft.id === id
    )
  );
  assert.equal(
    await saveRequirementDraftTurn({
      creatorId: memberUser.user.id,
      id,
      messages: [],
      revision: 0,
    }),
    undefined
  );

  const claimed = await saveRequirementDraftTurn({
    creatorId: ownerId,
    id,
    messages: initial.messages,
    revision: 0,
  });
  assert.equal(claimed?.revision, 1);
  const messages: ExerciseRefinementMessage[] = [
    ...initial.messages,
    {
      id: "saved-question",
      parts: [
        { type: "step-start" },
        {
          input: { question: "How long?" },
          state: "input-available",
          toolCallId: "question-1",
          type: "tool-askUserQuestion",
        },
      ],
      role: "assistant",
    },
  ];
  await saveRequirementDraftResponse({
    creatorId: ownerId,
    id,
    messages,
    revision: 1,
  });
  assert.deepEqual(
    (await findRequirementDraft(id, ownerId))?.messages,
    messages
  );
  assert.equal(
    await saveRequirementDraftTurn({
      creatorId: ownerId,
      id,
      messages: [],
      revision: 0,
    }),
    undefined
  );
  assert.deepEqual(
    (await findRequirementDraft(id, ownerId))?.messages,
    messages
  );
  await assert.rejects(
    saveRequirementDraftResponse({
      creatorId: memberUser.user.id,
      id,
      messages: [],
      revision: 1,
    })
  );

  const answered: ExerciseRefinementMessage[] = [
    messages[0],
    {
      ...messages[1],
      parts: [
        {
          input: { question: "How long?" },
          output: { selected: ["Two minutes"] },
          state: "output-available",
          toolCallId: "question-1",
          type: "tool-askUserQuestion",
        },
      ],
    },
  ];
  assert.equal(
    (
      await saveRequirementDraftTurn({
        creatorId: ownerId,
        id,
        messages: answered,
        revision: 1,
      })
    )?.revision,
    2
  );
  await assert.rejects(
    saveRequirementDraftResponse({
      creatorId: ownerId,
      id,
      messages,
      revision: 1,
    })
  );
  assert.deepEqual(
    (await findRequirementDraft(id, ownerId))?.messages,
    answered
  );
});

test("requirements API rejects foreign and stale drafts before calling the agent", async () => {
  const { createRequirementDraft } = await import(
    "../app/actions/exercise-requirement-drafts"
  );
  const { POST } = await import("../app/api/exercise-refinement/route");
  const { findRequirementDraft } = await import(
    "../lib/ai/refinement/draft-repository"
  );
  setRequestCookie(ownerCookie);
  const { id } = await createRequirementDraft("Private requirements");
  const draft = await findRequirementDraft(id, ownerId);
  assert.ok(draft);
  const request = (cookie: string, revision: number) =>
    new Request("http://localhost:3000/api/exercise-refinement", {
      body: JSON.stringify({ draftId: id, messages: draft.messages, revision }),
      headers: { "content-type": "application/json", cookie },
      method: "POST",
    });
  const { NextRequest } = await import("next/server");
  assert.equal(
    (await POST(new NextRequest(request(memberCookie, 0)))).status,
    404
  );
  assert.equal(
    (await POST(new NextRequest(request(ownerCookie, 99)))).status,
    409
  );
  assert.equal((await findRequirementDraft(id, ownerId))?.revision, 0);
});

test("revoked sessions are rejected even with an unexpired cookie cache", async () => {
  const response = await localAuth.api.signInEmail({
    asResponse: true,
    body: { email: "owner@example.invalid", password },
  });
  const cachedCookie = response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
  assert.ok(cachedCookie.includes("session_data="));
  const userSession = await localAuth.api.getSession({
    headers: new Headers({ cookie: cachedCookie }),
    query: { disableCookieCache: true },
  });
  assert.ok(userSession);
  await database
    .delete(schema.sessions)
    .where(eq(schema.sessions.id, userSession.session.id));
  assert.ok(
    await localAuth.api.getSession({
      headers: new Headers({ cookie: cachedCookie }),
    })
  );
  setRequestCookie(cachedCookie);
  assert.equal(await usersActions.getCurrentUser(), null);
  await assert.rejects(
    patientsActions.updatePatient(ownerPatientId, { firstName: "Revoked" })
  );
});

test("demoted administrators lose privileged access despite cached admin data", async () => {
  const user = await database.query.users.findFirst({
    where: eq(schema.users.email, "admin@example.invalid"),
  });
  assert.ok(user);
  await database
    .update(schema.users)
    .set({ role: "user" })
    .where(eq(schema.users.id, user.id));
  setRequestCookie(adminCookie);
  await assert.rejects(usersActions.getUsers());
  assert.ok(
    (
      await usersActions.createUser({
        email: "demoted@example.invalid",
        name: "Demoted",
        password,
        role: "admin",
      })
    ).error
  );
  await database
    .update(schema.users)
    .set({ role: "admin" })
    .where(eq(schema.users.id, user.id));
});

test("database-backed rate limiting bounds concurrent login attempts", async () => {
  const secondInstance = createLocalAuth(localAuth.options);
  const responses = await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      (index % 2 === 0 ? localAuth : secondInstance).handler(
        new Request("http://localhost:3000/api/auth/sign-in/email", {
          body: JSON.stringify({ email: "missing@example.invalid", password }),
          headers: {
            "content-type": "application/json",
            origin: "http://localhost:3000",
            "x-forwarded-for": "192.0.2.42",
          },
          method: "POST",
        })
      )
    )
  );
  assert.ok(responses.some((response) => response.status === 429));
  assert.ok(
    responses.filter((response) => response.status !== 429).length <= 3
  );
  assert.ok((await database.select().from(schema.rateLimit)).length > 0);
});
