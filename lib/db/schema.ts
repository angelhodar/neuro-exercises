import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgMaterializedView,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  vector,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { BaseExerciseConfig } from "../schemas/base-schemas";

interface ConfigSchema extends BaseExerciseConfig {
  [x: string]: unknown;
}

// Enums
export const generationStatusEnum = pgEnum("generation_status", [
  "PENDING",
  "GENERATING",
  "COMPLETED",
  "ERROR",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

// Better-auth tables
export const users = pgTable(
  "users",
  {
    banExpires: timestamp("ban_expires", { withTimezone: true }),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    email: text().notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    id: text().primaryKey(),
    image: text(),
    name: text(),
    role: text("role"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_created_at_idx").on(table.createdAt),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    activeOrganizationId: text("active_organization_id"),
    expiresAt: timestamp("expires_at").notNull(),
    id: text().primaryKey(),
    impersonatedBy: text("impersonated_by"),
    ipAddress: text("ip_address"),
    token: text().notNull().unique(),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_fk",
    }).onDelete("cascade"),
  ]
);

export const accounts = pgTable(
  "accounts",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    id: text().primaryKey(),
    idToken: text("id_token"),
    issuer: text().notNull(),
    password: text(),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text(),
    userId: text("user_id").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("accounts_issuer_account_id_unique").on(
      table.issuer,
      table.accountId
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "accounts_user_fk",
    }).onDelete("cascade"),
  ]
);

export const verifications = pgTable("verifications", {
  expiresAt: timestamp("expires_at").notNull(),
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  ...timestamps,
});

export const organization = pgTable("organizations", {
  id: text("id").primaryKey(),
  logo: text("logo"),
  metadata: text("metadata"),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  ...timestamps,
});

export const member = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    role: text("role").default("member").notNull(),
    userId: text("user_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("member_organization_idx").on(table.organizationId),
    index("member_user_idx").on(table.userId),
    uniqueIndex("member_organization_user_unique").on(
      table.organizationId,
      table.userId
    ),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "member_organization_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "member_user_fk",
    }).onDelete("cascade"),
  ]
);

export const invitation = pgTable(
  "invitations",
  {
    email: text("email").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    inviterId: text("inviter_id").notNull(),
    organizationId: text("organization_id").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    ...timestamps,
  },
  (table) => [
    index("invitation_organization_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
    index("invitation_status_idx").on(table.status),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "invitation_organization_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [users.id],
      name: "invitation_inviter_fk",
    }).onDelete("cascade"),
  ]
);

export const exercises = pgTable(
  "exercises",
  {
    audioInstructions: varchar("audio_instructions", { length: 500 }),
    creatorId: text("creator_id"),
    description: text(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    id: serial().primaryKey(),
    prNumber: integer("pr_number"),
    slug: varchar({ length: 100 }).notNull().unique(),
    tags: text("tags").array().notNull().default([]),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("exercises_slug_idx").on(table.slug),
    index("exercises_tags_idx").on(table.tags),
    index("exercises_creator_idx").on(table.creatorId),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "exercises_creator_fk",
    }).onDelete("set null"),
  ]
);

export const exerciseTemplates = pgTable(
  "exercise_templates",
  {
    creatorId: text("creator_id").notNull(),
    description: text("description"),
    id: serial().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("exercise_templates_creator_idx").on(table.creatorId),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "exercise_templates_creator_fk",
    }).onDelete("cascade"),
  ]
);

export const exerciseTemplateItems = pgTable(
  "exercise_template_items",
  {
    config: jsonb().$type<ConfigSchema>(),
    exerciseId: integer("exercise_id").notNull(),
    id: serial().primaryKey(),
    position: integer().notNull(),
    templateId: integer("template_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("exercise_template_items_template_idx").on(table.templateId),
    index("exercise_template_items_exercise_idx").on(table.exerciseId),
    index("exercise_template_items_template_position_idx").on(
      table.templateId,
      table.position
    ),
    uniqueIndex("exercise_template_items_template_position_unique").on(
      table.templateId,
      table.position
    ),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [exerciseTemplates.id],
      name: "exercise_template_items_template_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "exercise_template_items_exercise_fk",
    }).onDelete("cascade"),
  ]
);

export const exerciseLinks = pgTable(
  "exercise_links",
  {
    creatorId: text("creator_id").notNull(),
    id: serial().primaryKey(),
    targetUserId: text("target_user_id").notNull(),
    templateId: integer("template_id").notNull(),
    token: varchar("token", { length: 50 }).notNull().unique(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("exercise_links_token_idx").on(table.token),
    index("exercise_links_creator_idx").on(table.creatorId),
    index("exercise_links_template_idx").on(table.templateId),
    index("exercise_links_target_user_idx").on(table.targetUserId),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "exercise_links_creator_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [exerciseTemplates.id],
      name: "exercise_links_template_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetUserId],
      foreignColumns: [users.id],
      name: "exercise_links_target_user_fk",
    }).onDelete("cascade"),
  ]
);

export const exerciseResults = pgTable(
  "exercise_results",
  {
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    id: serial().primaryKey(),
    linkId: integer("link_id").notNull(),
    results: jsonb(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    templateItemId: integer("template_item_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("exercise_results_link_idx").on(table.linkId),
    index("exercise_results_template_item_idx").on(table.templateItemId),
    index("exercise_results_completed_at_idx").on(table.completedAt),
    // Ensure one result per link+template_item combination
    uniqueIndex("exercise_results_link_template_item_unique").on(
      table.linkId,
      table.templateItemId
    ),
    foreignKey({
      columns: [table.linkId],
      foreignColumns: [exerciseLinks.id],
      name: "exercise_results_link_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.templateItemId],
      foreignColumns: [exerciseTemplateItems.id],
      name: "exercise_results_template_item_fk",
    }).onDelete("cascade"),
  ]
);

export const medias = pgTable(
  "medias",
  (_table) => ({
    authorId: text("creator_id").notNull(),
    blobKey: varchar("blob_key", { length: 500 }).notNull(),
    derivedFrom: integer("derived_from"),
    description: text("description"),
    embedding: vector("embedding", { dimensions: 768 }),
    id: serial().primaryKey(),
    metadata: jsonb("metadata"),
    mimeType: varchar("mime_type", { length: 100 })
      .notNull()
      .default("image/png"),
    name: varchar("name", { length: 255 }).notNull(),
    tags: text("tags").array().default([]),
    thumbnailKey: varchar("thumbnail_key", { length: 500 }),
    ...timestamps,
  }),
  (table) => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [users.id],
      name: "medias_creator_fk",
    }),
    foreignKey({
      columns: [table.derivedFrom],
      foreignColumns: [table.id],
      name: "medias_derived_from_fk",
    }),
    index("medias_tags_idx").on(table.tags),
    index("medias_mime_type_idx").on(table.mimeType),
    index("medias_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const exerciseChatGeneration = pgTable(
  "exercise_chat_generation",
  {
    codeBlobKey: varchar("code_blob_key", { length: 500 }),
    exerciseId: integer("exercise_id").notNull(),
    id: serial().primaryKey(),
    prompt: text("prompt").notNull(),
    sandboxId: varchar("sandbox_id", { length: 255 }),
    status: generationStatusEnum("status").notNull(),
    summary: text("summary"),
    userId: text("user_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("exercise_chat_generation_exercise_idx").on(table.exerciseId),
    index("exercise_chat_generation_user_idx").on(table.userId),
    index("exercise_chat_generation_status_idx").on(table.status),
    index("exercise_chat_generation_sandbox_idx").on(table.sandboxId),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "exercise_chat_generation_exercise_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "exercise_chat_generation_user_fk",
    }).onDelete("cascade"),
  ]
);

export const exerciseWorkspaces = pgTable(
  "exercise_workspaces",
  {
    activeGenerationId: integer("active_generation_id"),
    baseCommitSha: varchar("base_commit_sha", { length: 64 }),
    exerciseId: integer("exercise_id").notNull(),
    harnessResumeState: jsonb("harness_resume_state").$type<
      Record<string, unknown>
    >(),
    harnessSessionId: varchar("harness_session_id", { length: 255 }).notNull(),
    id: serial().primaryKey(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    lastError: text("last_error"),
    lockExpiresAt: timestamp("lock_expires_at", { withTimezone: true }),
    sandboxName: varchar("sandbox_name", { length: 255 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("exercise_workspaces_exercise_unique").on(table.exerciseId),
    uniqueIndex("exercise_workspaces_harness_session_unique").on(
      table.harnessSessionId
    ),
    uniqueIndex("exercise_workspaces_sandbox_unique").on(table.sandboxName),
    index("exercise_workspaces_active_generation_idx").on(
      table.activeGenerationId
    ),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "exercise_workspaces_exercise_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.activeGenerationId],
      foreignColumns: [exerciseChatGeneration.id],
      name: "exercise_workspaces_active_generation_fk",
    }).onDelete("set null"),
  ]
);

// Exercise config presets (user-created)
export const exerciseConfigPresets = pgTable(
  "exercise_config_presets",
  {
    config: jsonb().$type<ConfigSchema>().notNull(),
    creatorId: text("creator_id").notNull(),
    exerciseId: integer("exercise_id").notNull(),
    id: serial().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("exercise_config_presets_exercise_idx").on(table.exerciseId),
    index("exercise_config_presets_creator_idx").on(table.creatorId),
    uniqueIndex("exercise_config_presets_exercise_creator_name_unique").on(
      table.exerciseId,
      table.creatorId,
      table.name
    ),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "exercise_config_presets_exercise_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "exercise_config_presets_creator_fk",
    }).onDelete("cascade"),
  ]
);

// Patient management tables
export const patients = pgTable(
  "patients",
  {
    creatorId: text("creator_id").notNull(),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    diagnosis: text("diagnosis"),
    email: varchar("email", { length: 255 }),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    id: serial().primaryKey(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    notes: text("notes"),
    phone: varchar("phone", { length: 50 }),
    ...timestamps,
  },
  (table) => [
    index("patients_creator_idx").on(table.creatorId),
    index("patients_last_name_idx").on(table.lastName),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "patients_creator_fk",
    }).onDelete("cascade"),
  ]
);

export const patientSessions = pgTable(
  "patient_sessions",
  {
    creatorId: text("creator_id").notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    discipline: varchar("discipline", { length: 50 }).notNull(),
    id: serial().primaryKey(),
    observations: text("observations"),
    patientId: integer("patient_id").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("patient_sessions_patient_idx").on(table.patientId),
    index("patient_sessions_creator_idx").on(table.creatorId),
    index("patient_sessions_date_idx").on(table.date),
    foreignKey({
      columns: [table.patientId],
      foreignColumns: [patients.id],
      name: "patient_sessions_patient_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "patient_sessions_creator_fk",
    }).onDelete("cascade"),
  ]
);

export const patientTests = pgTable(
  "patient_tests",
  {
    creatorId: text("creator_id").notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    evaluatedProcess: varchar("evaluated_process", { length: 100 }).notNull(),
    id: serial().primaryKey(),
    observations: text("observations"),
    patientId: integer("patient_id").notNull(),
    score: varchar("score", { length: 100 }),
    sessionId: integer("session_id"),
    testName: varchar("test_name", { length: 255 }),
    ...timestamps,
  },
  (table) => [
    index("patient_tests_patient_idx").on(table.patientId),
    index("patient_tests_session_idx").on(table.sessionId),
    index("patient_tests_creator_idx").on(table.creatorId),
    index("patient_tests_evaluated_process_idx").on(table.evaluatedProcess),
    foreignKey({
      columns: [table.patientId],
      foreignColumns: [patients.id],
      name: "patient_tests_patient_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [patientSessions.id],
      name: "patient_tests_session_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.creatorId],
      foreignColumns: [users.id],
      name: "patient_tests_creator_fk",
    }).onDelete("cascade"),
  ]
);

// Waitlist emails
export const waitlistEmails = pgTable(
  "waitlist_emails",
  {
    email: text().notNull().unique(),
    id: serial().primaryKey(),
    ...timestamps,
  },
  (table) => [uniqueIndex("waitlist_emails_email_idx").on(table.email)]
);

// Materialized view for distinct media tags
export const mediaTagsView = pgMaterializedView("media_tags", {
  tag: text("tag").primaryKey(),
}).as(sql`SELECT DISTINCT unnest(${medias.tags}) AS tag FROM ${medias}`);

// Relations
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  createdExerciseLinks: many(exerciseLinks, {
    relationName: "createdExerciseLinks",
  }),
  createdExerciseTemplates: many(exerciseTemplates),
  createdPatientSessions: many(patientSessions),
  createdPatients: many(patients),
  createdPatientTests: many(patientTests),
  exerciseChatGenerations: many(exerciseChatGeneration),
  exerciseConfigPresets: many(exerciseConfigPresets),
  exercises: many(exercises),
  medias: many(medias),
  memberships: many(member),
  referenceTexts: many(speechTexts),
  sentInvitations: many(invitation, { relationName: "sentInvitations" }),
  sessions: many(sessions),
  targetedExerciseLinks: many(exerciseLinks, {
    relationName: "targetedExerciseLinks",
  }),
  transcriptionResults: many(transcriptionResults),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  creator: one(users, {
    fields: [exercises.creatorId],
    references: [users.id],
  }),
  exerciseChatGenerations: many(exerciseChatGeneration),
  exerciseConfigPresets: many(exerciseConfigPresets),
  exerciseTemplateItems: many(exerciseTemplateItems),
  workspace: one(exerciseWorkspaces),
}));

export const exerciseTemplatesRelations = relations(
  exerciseTemplates,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [exerciseTemplates.creatorId],
      references: [users.id],
    }),
    exerciseLinks: many(exerciseLinks),
    exerciseTemplateItems: many(exerciseTemplateItems),
  })
);

export const exerciseTemplateItemsRelations = relations(
  exerciseTemplateItems,
  ({ one, many }) => ({
    exercise: one(exercises, {
      fields: [exerciseTemplateItems.exerciseId],
      references: [exercises.id],
    }),
    exerciseResults: many(exerciseResults),
    template: one(exerciseTemplates, {
      fields: [exerciseTemplateItems.templateId],
      references: [exerciseTemplates.id],
    }),
  })
);

export const exerciseLinksRelations = relations(
  exerciseLinks,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [exerciseLinks.creatorId],
      references: [users.id],
      relationName: "createdExerciseLinks",
    }),
    exerciseResults: many(exerciseResults),
    targetUser: one(users, {
      fields: [exerciseLinks.targetUserId],
      references: [users.id],
      relationName: "targetedExerciseLinks",
    }),
    template: one(exerciseTemplates, {
      fields: [exerciseLinks.templateId],
      references: [exerciseTemplates.id],
    }),
  })
);

export const exerciseResultsRelations = relations(
  exerciseResults,
  ({ one }) => ({
    exerciseLink: one(exerciseLinks, {
      fields: [exerciseResults.linkId],
      references: [exerciseLinks.id],
    }),
    templateItem: one(exerciseTemplateItems, {
      fields: [exerciseResults.templateItemId],
      references: [exerciseTemplateItems.id],
    }),
  })
);

export const mediasRelations = relations(medias, ({ one }) => ({
  author: one(users, {
    fields: [medias.authorId],
    references: [users.id],
  }),
}));

export const exerciseChatGenerationRelations = relations(
  exerciseChatGeneration,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exerciseChatGeneration.exerciseId],
      references: [exercises.id],
    }),
    user: one(users, {
      fields: [exerciseChatGeneration.userId],
      references: [users.id],
    }),
  })
);

export const exerciseWorkspacesRelations = relations(
  exerciseWorkspaces,
  ({ one }) => ({
    activeGeneration: one(exerciseChatGeneration, {
      fields: [exerciseWorkspaces.activeGenerationId],
      references: [exerciseChatGeneration.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseWorkspaces.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const exerciseConfigPresetsRelations = relations(
  exerciseConfigPresets,
  ({ one }) => ({
    creator: one(users, {
      fields: [exerciseConfigPresets.creatorId],
      references: [users.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseConfigPresets.exerciseId],
      references: [exercises.id],
    }),
  })
);

// Speech recognition tables
export const speechTexts = pgTable(
  "speech_texts",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    referenceText: text("reference_text").notNull(),
    userId: text("user_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("speech_texts_user_idx").on(table.userId),
    index("speech_texts_name_idx").on(table.name),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "speech_texts_user_fk",
    }).onDelete("cascade"),
  ]
);

export const transcriptionResults = pgTable(
  "transcription_results",
  {
    accuracy: integer("accuracy").notNull(), // Stored as percentage (0-100)
    audioBlobKey: varchar("audio_blob_key", { length: 500 }).notNull(),
    id: serial().primaryKey(),
    matchingWords: integer("matching_words").notNull(),
    nonMatchingWords: integer("non_matching_words").notNull(),
    referenceTextId: integer("reference_text_id").notNull(),
    targetUserId: text("target_user_id").notNull(),
    transcribedText: text("transcribed_text").notNull(),
    ...timestamps,
  },
  (table) => [
    index("transcription_results_reference_text_idx").on(table.referenceTextId),
    index("transcription_results_target_user_idx").on(table.targetUserId),
    index("transcription_results_accuracy_idx").on(table.accuracy),
    index("transcription_results_created_at_idx").on(table.createdAt),
    foreignKey({
      columns: [table.referenceTextId],
      foreignColumns: [speechTexts.id],
      name: "transcription_results_reference_text_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetUserId],
      foreignColumns: [users.id],
      name: "transcription_results_target_user_fk",
    }).onDelete("cascade"),
  ]
);

export const organizationRelations = relations(organization, ({ many }) => ({
  invitations: many(invitation),
  members: many(member),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(users, {
    fields: [member.userId],
    references: [users.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  inviter: one(users, {
    fields: [invitation.inviterId],
    references: [users.id],
    relationName: "sentInvitations",
  }),
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
}));

export const speechTextsRelations = relations(speechTexts, ({ one, many }) => ({
  transcriptionResults: many(transcriptionResults),
  user: one(users, {
    fields: [speechTexts.userId],
    references: [users.id],
  }),
}));

export const transcriptionResultsRelations = relations(
  transcriptionResults,
  ({ one }) => ({
    referenceText: one(speechTexts, {
      fields: [transcriptionResults.referenceTextId],
      references: [speechTexts.id],
    }),
    targetUser: one(users, {
      fields: [transcriptionResults.targetUserId],
      references: [users.id],
    }),
  })
);

// Patient relations
export const patientsRelations = relations(patients, ({ one, many }) => ({
  creator: one(users, {
    fields: [patients.creatorId],
    references: [users.id],
  }),
  patientSessions: many(patientSessions),
  patientTests: many(patientTests),
}));

export const patientSessionsRelations = relations(
  patientSessions,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [patientSessions.creatorId],
      references: [users.id],
    }),
    patient: one(patients, {
      fields: [patientSessions.patientId],
      references: [patients.id],
    }),
    patientTests: many(patientTests),
  })
);

export const patientTestsRelations = relations(patientTests, ({ one }) => ({
  creator: one(users, {
    fields: [patientTests.creatorId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [patientTests.patientId],
    references: [patients.id],
  }),
  session: one(patientSessions, {
    fields: [patientTests.sessionId],
    references: [patientSessions.id],
  }),
}));

// Schemas
export const exerciseSelectSchema = createSelectSchema(exercises);
export const exerciseInsertSchema = createInsertSchema(exercises);
export const exerciseUpdateSchema = createUpdateSchema(exercises);

export const exerciseTemplateSelectSchema =
  createSelectSchema(exerciseTemplates);
export const exerciseTemplateInsertSchema =
  createInsertSchema(exerciseTemplates);
export const exerciseTemplateUpdateSchema =
  createUpdateSchema(exerciseTemplates);

export const exerciseTemplateItemSelectSchema = createSelectSchema(
  exerciseTemplateItems
);
export const exerciseTemplateItemInsertSchema = createInsertSchema(
  exerciseTemplateItems
);
export const exerciseTemplateItemUpdateSchema = createUpdateSchema(
  exerciseTemplateItems
);

export const exerciseLinkSelectSchema = createSelectSchema(exerciseLinks);
export const exerciseLinkInsertSchema = createInsertSchema(exerciseLinks);
export const exerciseLinkUpdateSchema = createUpdateSchema(exerciseLinks);

export const exerciseResultSelectSchema = createSelectSchema(exerciseResults);
export const exerciseResultInsertSchema = createInsertSchema(exerciseResults);
export const exerciseResultUpdateSchema = createUpdateSchema(exerciseResults);

export const exerciseChatGenerationSelectSchema = createSelectSchema(
  exerciseChatGeneration
);
export const exerciseChatGenerationInsertSchema = createInsertSchema(
  exerciseChatGeneration
);
export const exerciseChatGenerationUpdateSchema = createUpdateSchema(
  exerciseChatGeneration
);

export const exerciseWorkspaceSelectSchema =
  createSelectSchema(exerciseWorkspaces);
export const exerciseWorkspaceInsertSchema =
  createInsertSchema(exerciseWorkspaces);
export const exerciseWorkspaceUpdateSchema =
  createUpdateSchema(exerciseWorkspaces);

export const speechTextSelectSchema = createSelectSchema(speechTexts);
export const speechTextInsertSchema = createInsertSchema(speechTexts);
export const speechTextUpdateSchema = createUpdateSchema(speechTexts);

export const transcriptionResultSelectSchema =
  createSelectSchema(transcriptionResults);
export const transcriptionResultInsertSchema =
  createInsertSchema(transcriptionResults);
export const transcriptionResultUpdateSchema =
  createUpdateSchema(transcriptionResults);

export const exerciseConfigPresetSelectSchema = createSelectSchema(
  exerciseConfigPresets
);
export const exerciseConfigPresetInsertSchema = createInsertSchema(
  exerciseConfigPresets
);
export const exerciseConfigPresetUpdateSchema = createUpdateSchema(
  exerciseConfigPresets
);

export const patientSelectSchema = createSelectSchema(patients);
export const patientInsertSchema = createInsertSchema(patients);
export const patientUpdateSchema = createUpdateSchema(patients);

export const patientSessionSelectSchema = createSelectSchema(patientSessions);
export const patientSessionInsertSchema = createInsertSchema(patientSessions);
export const patientSessionUpdateSchema = createUpdateSchema(patientSessions);

export const patientTestSelectSchema = createSelectSchema(patientTests);
export const patientTestInsertSchema = createInsertSchema(patientTests);
export const patientTestUpdateSchema = createUpdateSchema(patientTests);
export const waitlistEmailSelectSchema = createSelectSchema(waitlistEmails);
export const waitlistEmailInsertSchema = createInsertSchema(waitlistEmails);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect;
export type NewExerciseTemplate = typeof exerciseTemplates.$inferInsert;

export type ExerciseTemplateItem = typeof exerciseTemplateItems.$inferSelect;
export type NewExerciseTemplateItem = typeof exerciseTemplateItems.$inferInsert;

export type ExerciseLink = typeof exerciseLinks.$inferSelect;
export type NewExerciseLink = typeof exerciseLinks.$inferInsert;

export type ExerciseResult = typeof exerciseResults.$inferSelect;
export type NewExerciseResult = typeof exerciseResults.$inferInsert;

export type Media = typeof medias.$inferSelect;
export type NewMedia = typeof medias.$inferInsert;

export type ExerciseChatGeneration = typeof exerciseChatGeneration.$inferSelect;
export type NewExerciseChatGeneration =
  typeof exerciseChatGeneration.$inferInsert;

export type ExerciseWorkspace = typeof exerciseWorkspaces.$inferSelect;
export type NewExerciseWorkspace = typeof exerciseWorkspaces.$inferInsert;

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = Omit<typeof organization.$inferInsert, "id">;
export type UpdateOrganization = Partial<NewOrganization>;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;

export type SpeechText = typeof speechTexts.$inferSelect;
export type NewSpeechText = typeof speechTexts.$inferInsert;

export type TranscriptionResult = typeof transcriptionResults.$inferSelect;
export type NewTranscriptionResult = typeof transcriptionResults.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type PatientSession = typeof patientSessions.$inferSelect;
export type NewPatientSession = typeof patientSessions.$inferInsert;

export type PatientTest = typeof patientTests.$inferSelect;
export type NewPatientTest = typeof patientTests.$inferInsert;
export type WaitlistEmail = typeof waitlistEmails.$inferSelect;
export type NewWaitlistEmail = typeof waitlistEmails.$inferInsert;

export type ExerciseConfigPreset = typeof exerciseConfigPresets.$inferSelect;
export type NewExerciseConfigPreset = typeof exerciseConfigPresets.$inferInsert;
