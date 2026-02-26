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
    id: text().primaryKey(),
    name: text(),
    email: text().notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    role: text("role"),
    banned: boolean("banned"),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", { withTimezone: true }),
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
    id: text().primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text().notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
    activeOrganizationId: text("active_organization_id"),
    impersonatedBy: text("impersonated_by"),
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
    id: text().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "accounts_user_fk",
    }).onDelete("cascade"),
  ]
);

export const verifications = pgTable("verifications", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});

export const organization = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  ...timestamps,
});

export const member = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").default("member").notNull(),
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
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    inviterId: text("inviter_id").notNull(),
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
    id: serial().primaryKey(),
    slug: varchar({ length: 100 }).notNull().unique(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    tags: text("tags").array().notNull().default([]),
    description: text(),
    prNumber: integer("pr_number"),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    audioInstructions: varchar("audio_instructions", { length: 500 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("exercises_slug_idx").on(table.slug),
    index("exercises_tags_idx").on(table.tags),
  ]
);

export const exerciseTemplates = pgTable(
  "exercise_templates",
  {
    id: serial().primaryKey(),
    creatorId: text("creator_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
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
    id: serial().primaryKey(),
    templateId: integer("template_id").notNull(),
    exerciseId: integer("exercise_id").notNull(),
    config: jsonb().$type<ConfigSchema>(),
    position: integer().notNull(),
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
    id: serial().primaryKey(),
    creatorId: text("creator_id").notNull(),
    templateId: integer("template_id").notNull(),
    targetUserId: text("target_user_id").notNull(),
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
    id: serial().primaryKey(),
    linkId: integer("link_id").notNull(),
    templateItemId: integer("template_item_id").notNull(),
    results: jsonb(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
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
    id: serial().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    tags: text("tags").array().default([]),
    blobKey: varchar("blob_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 })
      .notNull()
      .default("image/png"),
    thumbnailKey: varchar("thumbnail_key", { length: 500 }),
    metadata: jsonb("metadata"),
    authorId: text("creator_id").notNull(),
    derivedFrom: integer("derived_from"),
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
  ]
);

export const exerciseChatGeneration = pgTable(
  "exercise_chat_generation",
  {
    id: serial().primaryKey(),
    exerciseId: integer("exercise_id").notNull(),
    userId: text("user_id").notNull(),
    status: generationStatusEnum("status").notNull(),
    codeBlobKey: varchar("code_blob_key", { length: 500 }),
    sandboxId: varchar("sandbox_id", { length: 255 }),
    summary: text("summary"),
    prompt: text("prompt").notNull(),
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

// Sandbox snapshots
export const sandboxSnapshots = pgTable(
  "sandbox_snapshots",
  {
    id: serial().primaryKey(),
    snapshotId: varchar("snapshot_id", { length: 255 }).notNull(),
    gitRevision: varchar("git_revision", { length: 100 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("sandbox_snapshots_expires_at_idx").on(table.expiresAt)]
);

// Patient management tables
export const patients = pgTable(
  "patients",
  {
    id: serial().primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    diagnosis: text("diagnosis"),
    notes: text("notes"),
    creatorId: text("creator_id").notNull(),
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
    id: serial().primaryKey(),
    patientId: integer("patient_id").notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    discipline: varchar("discipline", { length: 50 }).notNull(),
    observations: text("observations"),
    creatorId: text("creator_id").notNull(),
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
    id: serial().primaryKey(),
    patientId: integer("patient_id").notNull(),
    sessionId: integer("session_id"),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    evaluatedProcess: varchar("evaluated_process", { length: 100 }).notNull(),
    testName: varchar("test_name", { length: 255 }),
    score: varchar("score", { length: 100 }),
    observations: text("observations"),
    creatorId: text("creator_id").notNull(),
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
    id: serial().primaryKey(),
    email: text().notNull().unique(),
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
  createdExerciseTemplates: many(exerciseTemplates),
  createdExerciseLinks: many(exerciseLinks, {
    relationName: "createdExerciseLinks",
  }),
  targetedExerciseLinks: many(exerciseLinks, {
    relationName: "targetedExerciseLinks",
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  medias: many(medias),
  exerciseChatGenerations: many(exerciseChatGeneration),
  memberships: many(member),
  sentInvitations: many(invitation, { relationName: "sentInvitations" }),
  referenceTexts: many(speechTexts),
  transcriptionResults: many(transcriptionResults),
  createdPatients: many(patients),
  createdPatientSessions: many(patientSessions),
  createdPatientTests: many(patientTests),
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

export const exercisesRelations = relations(exercises, ({ many }) => ({
  exerciseTemplateItems: many(exerciseTemplateItems),
  exerciseChatGenerations: many(exerciseChatGeneration),
}));

export const exerciseTemplatesRelations = relations(
  exerciseTemplates,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [exerciseTemplates.creatorId],
      references: [users.id],
    }),
    exerciseTemplateItems: many(exerciseTemplateItems),
    exerciseLinks: many(exerciseLinks),
  })
);

export const exerciseTemplateItemsRelations = relations(
  exerciseTemplateItems,
  ({ one, many }) => ({
    template: one(exerciseTemplates, {
      fields: [exerciseTemplateItems.templateId],
      references: [exerciseTemplates.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseTemplateItems.exerciseId],
      references: [exercises.id],
    }),
    exerciseResults: many(exerciseResults),
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
    template: one(exerciseTemplates, {
      fields: [exerciseLinks.templateId],
      references: [exerciseTemplates.id],
    }),
    targetUser: one(users, {
      fields: [exerciseLinks.targetUserId],
      references: [users.id],
      relationName: "targetedExerciseLinks",
    }),
    exerciseResults: many(exerciseResults),
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
    id: serial().primaryKey(),
    referenceTextId: integer("reference_text_id").notNull(),
    targetUserId: text("target_user_id").notNull(),
    transcribedText: text("transcribed_text").notNull(),
    audioBlobKey: varchar("audio_blob_key", { length: 500 }).notNull(),
    accuracy: integer("accuracy").notNull(), // Stored as percentage (0-100)
    matchingWords: integer("matching_words").notNull(),
    nonMatchingWords: integer("non_matching_words").notNull(),
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
  members: many(member),
  invitations: many(invitation),
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
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(users, {
    fields: [invitation.inviterId],
    references: [users.id],
    relationName: "sentInvitations",
  }),
}));

export const speechTextsRelations = relations(speechTexts, ({ one, many }) => ({
  user: one(users, {
    fields: [speechTexts.userId],
    references: [users.id],
  }),
  transcriptionResults: many(transcriptionResults),
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
    patient: one(patients, {
      fields: [patientSessions.patientId],
      references: [patients.id],
    }),
    creator: one(users, {
      fields: [patientSessions.creatorId],
      references: [users.id],
    }),
    patientTests: many(patientTests),
  })
);

export const patientTestsRelations = relations(patientTests, ({ one }) => ({
  patient: one(patients, {
    fields: [patientTests.patientId],
    references: [patients.id],
  }),
  session: one(patientSessions, {
    fields: [patientTests.sessionId],
    references: [patientSessions.id],
  }),
  creator: one(users, {
    fields: [patientTests.creatorId],
    references: [users.id],
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

export const speechTextSelectSchema = createSelectSchema(speechTexts);
export const speechTextInsertSchema = createInsertSchema(speechTexts);
export const speechTextUpdateSchema = createUpdateSchema(speechTexts);

export const transcriptionResultSelectSchema =
  createSelectSchema(transcriptionResults);
export const transcriptionResultInsertSchema =
  createInsertSchema(transcriptionResults);
export const transcriptionResultUpdateSchema =
  createUpdateSchema(transcriptionResults);

export const sandboxSnapshotSelectSchema = createSelectSchema(sandboxSnapshots);
export const sandboxSnapshotInsertSchema = createInsertSchema(sandboxSnapshots);

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

export type SandboxSnapshot = typeof sandboxSnapshots.$inferSelect;
export type NewSandboxSnapshot = typeof sandboxSnapshots.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type PatientSession = typeof patientSessions.$inferSelect;
export type NewPatientSession = typeof patientSessions.$inferInsert;

export type PatientTest = typeof patientTests.$inferSelect;
export type NewPatientTest = typeof patientTests.$inferInsert;
export type WaitlistEmail = typeof waitlistEmails.$inferSelect;
export type NewWaitlistEmail = typeof waitlistEmails.$inferInsert;
