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
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod"
import { BaseExerciseConfig } from "../schemas/base-schemas"

interface ConfigSchema extends BaseExerciseConfig {
  [x: string]: any
}

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}

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
  (table) => [uniqueIndex("users_email_idx").on(table.email), index("users_created_at_idx").on(table.createdAt)],
)

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
})

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
})

export const verifications = pgTable("verifications", {
  id: text().primaryKey(),
  identifier: text().unique(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
})

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
    ...timestamps,
  },
  (table) => [
    uniqueIndex("exercises_slug_idx").on(table.slug), 
    index("exercises_tags_idx").on(table.tags)
  ],
)

export const exerciseLinks = pgTable(
  "exercise_links",
  {
    id: serial().primaryKey(),
    templateId: text("template_id").notNull(),
    targetUserId: text("target_user_id").notNull(),
    publicId: varchar("public_id", { length: 50 }).notNull().unique(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("exercise_links_public_id_idx").on(table.publicId),
    index("exercise_links_template_idx").on(table.templateId),
    index("exercise_links_target_user_idx").on(table.targetUserId),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [users.id],
      name: "exercise_links_template_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.targetUserId],
      foreignColumns: [users.id],
      name: "exercise_links_target_user_fk",
    }).onDelete("cascade"),
  ],
)

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
      name: "exercise_links_creator_fk",
    }).onDelete("cascade")
  ],
)

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
    index("exercise_template_items_link_idx").on(table.templateId),
    index("exercise_template_items_exercise_idx").on(table.exerciseId),
    index("exercise_template_items_link_position_idx").on(table.templateId, table.position),
    uniqueIndex("exercise_template_items_link_position_unique").on(table.templateId, table.position),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [exerciseLinks.id],
      name: "exercise_template_items_link_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "exercise_template_items_exercise_fk",
    }).onDelete("cascade"),
  ],
)

export const exerciseResults = pgTable(
  "exercise_results",
  {
    id: serial().primaryKey(),
    linkId: integer("link_id").notNull(),
    linkTemplateItemId: integer("link_template_item_id").notNull(),
    results: jsonb(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [
    index("exercise_results_link_idx").on(table.linkId),
    index("exercise_results_template_item_idx").on(table.linkTemplateItemId),
    foreignKey({
      columns: [table.linkTemplateItemId],
      foreignColumns: [exerciseTemplateItems.id],
      name: "exercise_results_template_item_fk",
    }).onDelete("cascade"),
  ],
)

export const medias = pgTable("medias", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  tags: text("tags").array().default([]),
  blobKey: varchar("blob_key", { length: 500 }).notNull(),
  authorId: text("creator_id").notNull(),
  ...timestamps
}, (table) => [
  foreignKey({
    columns: [table.authorId],
    foreignColumns: [users.id],
    name: "medias_creator_fk"
  }),
  index("medias_tags_idx").on(table.tags)
])

// Materialized view for distinct media tags
export const mediaTagsView = pgMaterializedView("media_tags", {
  tag: text("tag").primaryKey(),
}).as(sql`SELECT DISTINCT unnest(${medias.tags}) AS tag FROM ${medias}`);

// Relations
export const userRelations = relations(users, ({ many }) => ({
  createdExerciseTemplates: many(exerciseTemplates, {
    relationName: "createdExerciseTemplates",
  }),
  targetedExerciseLinks: many(exerciseLinks, {
    relationName: "targetedExerciseLinks",
  }),
  sessions: many(sessions),
  accounts: many(accounts),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const exercisesRelations = relations(exercises, ({ many }) => ({
  exerciseTemplateItems: many(exerciseTemplateItems),
}))

export const exerciseLinksRelations = relations(exerciseLinks, ({ one, many }) => ({
  template: one(exerciseTemplates, {
    fields: [exerciseLinks.templateId],
    references: [exerciseTemplates.id],
    relationName: "fromTemplate",
  }),
  targetUser: one(users, {
    fields: [exerciseLinks.targetUserId],
    references: [users.id],
    relationName: "targetedExerciseLinks",
  }),
  exerciseTemplateItems: many(exerciseTemplateItems),
}))

export const exerciseTemplateItemsRelations = relations(exerciseTemplateItems, ({ one }) => ({
  template: one(exerciseTemplates, {
    fields: [exerciseTemplateItems.templateId],
    references: [exerciseTemplates.id],
  }),
  exercise: one(exercises, {
    fields: [exerciseTemplateItems.exerciseId],
    references: [exercises.id],
  }),
  exerciseResults: one(exerciseResults),
}))

export const exerciseResultsRelations = relations(exerciseResults, ({ one }) => ({
  exerciseLinkItem: one(exerciseTemplateItems, {
    fields: [exerciseResults.linkTemplateItemId],
    references: [exerciseTemplateItems.id],
  }),
}))

export const mediasRelations = relations(medias, ({ one }) => ({
  author: one(users, {
    fields: [medias.authorId],
    references: [users.id],
  }),
}))

export const exerciseSelectSchema = createSelectSchema(exercises)
export const exerciseInsertSchema = createInsertSchema(exercises)
export const exerciseUpdateSchema = createUpdateSchema(exercises)

export const exerciseLinkSelectSchema = createSelectSchema(exerciseLinks)
export const exerciseLinkInsertSchema = createInsertSchema(exerciseLinks)
export const exerciseLinkUpdateSchema = createUpdateSchema(exerciseLinks)

export const exerciseTemplateItemselectSchema = createSelectSchema(exerciseTemplateItems)
export const exerciseLinkItemInsertSchema = createInsertSchema(exerciseTemplateItems)
export const exerciseLinkItemUpdateSchema = createUpdateSchema(exerciseTemplateItems)

export const exerciseResultSelectSchema = createSelectSchema(exerciseResults)
export const exerciseResultInsertSchema = createInsertSchema(exerciseResults)
export const exerciseResultUpdateSchema = createUpdateSchema(exerciseResults)

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert

export type Exercise = typeof exercises.$inferSelect
export type NewExercise = typeof exercises.$inferInsert

export type ExerciseLink = typeof exerciseLinks.$inferSelect
export type NewExerciseLink = typeof exerciseLinks.$inferInsert

export type ExerciseLinkItem = typeof exerciseTemplateItems.$inferSelect
export type NewExerciseLinkItem = typeof exerciseTemplateItems.$inferInsert

export type ExerciseResult = typeof exerciseResults.$inferSelect
export type NewExerciseResult = typeof exerciseResults.$inferInsert

export type Media = typeof medias.$inferSelect
export type NewMedia = typeof medias.$inferInsert
