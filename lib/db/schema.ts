import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  varchar,
  index,
  uniqueIndex,
  foreignKey,
  boolean,
  pgMaterializedView,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { BaseExerciseConfig } from "../schemas/base-schemas";

interface ConfigSchema extends BaseExerciseConfig {
  [x: string]: any;
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
    .notNull(),
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
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

export const sessions = pgTable("sessions", {
  id: text().primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text().notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const accounts = pgTable("accounts", {
  id: text().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text(),
  password: text(),
  ...timestamps,
});

export const verifications = pgTable("verifications", {
  id: text().primaryKey(),
  identifier: text().unique(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});

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
  ],
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
  ],
);

export const exerciseTemplateItems = pgTable(
  "exercise_template_items",
  {
    id: serial().primaryKey(),
    templateId: integer("template_id").notNull(),
    exerciseId: integer("exercise_id").notNull(),
    config: jsonb().$type<ConfigSchema>(),
    position: integer().notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    index("exercise_template_items_template_idx").on(table.templateId),
    index("exercise_template_items_exercise_idx").on(table.exerciseId),
    index("exercise_template_items_template_position_idx").on(
      table.templateId,
      table.position,
    ),
    uniqueIndex("exercise_template_items_template_position_unique").on(
      table.templateId,
      table.position,
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
  ],
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
  ],
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
    index("exercise_results_completed_at_idx").on(table.completedAt), // For time-based queries
    // Ensure one result per link+template_item combination
    uniqueIndex("exercise_results_link_template_item_unique").on(
      table.linkId,
      table.templateItemId,
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
  ],
);

export const medias = pgTable(
  "medias",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    tags: text("tags").array().default([]),
    blobKey: varchar("blob_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    thumbnailKey: varchar("thumbnail_key", { length: 500 }),
    metadata: jsonb("metadata"),
    authorId: text("creator_id").notNull(),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [users.id],
      name: "medias_creator_fk",
    }),
    index("medias_tags_idx").on(table.tags),
    index("medias_mime_type_idx").on(table.mimeType),
  ],
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
  ],
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
  }),
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
  }),
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
  }),
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
  }),
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
  }),
);

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
  exerciseTemplateItems,
);
export const exerciseTemplateItemInsertSchema = createInsertSchema(
  exerciseTemplateItems,
);
export const exerciseTemplateItemUpdateSchema = createUpdateSchema(
  exerciseTemplateItems,
);

export const exerciseLinkSelectSchema = createSelectSchema(exerciseLinks);
export const exerciseLinkInsertSchema = createInsertSchema(exerciseLinks);
export const exerciseLinkUpdateSchema = createUpdateSchema(exerciseLinks);

export const exerciseResultSelectSchema = createSelectSchema(exerciseResults);
export const exerciseResultInsertSchema = createInsertSchema(exerciseResults);
export const exerciseResultUpdateSchema = createUpdateSchema(exerciseResults);

export const exerciseChatGenerationSelectSchema = createSelectSchema(
  exerciseChatGeneration,
);
export const exerciseChatGenerationInsertSchema = createInsertSchema(
  exerciseChatGeneration,
);
export const exerciseChatGenerationUpdateSchema = createUpdateSchema(
  exerciseChatGeneration,
);

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
