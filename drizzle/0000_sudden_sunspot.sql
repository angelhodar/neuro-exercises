CREATE TYPE "public"."generation_status" AS ENUM('PENDING', 'GENERATING', 'COMPLETED', 'ERROR');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_chat_generation" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"status" "generation_status" NOT NULL,
	"code_blob_key" varchar(500),
	"sandbox_id" varchar(255),
	"summary" text,
	"prompt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"template_id" integer NOT NULL,
	"target_user_id" text NOT NULL,
	"token" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "exercise_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"template_item_id" integer NOT NULL,
	"results" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_template_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"config" jsonb,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"pr_number" integer,
	"thumbnail_url" varchar(500),
	"audio_instructions" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"inviter_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medias" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}',
	"blob_key" varchar(500) NOT NULL,
	"mime_type" varchar(100) DEFAULT 'image/png' NOT NULL,
	"thumbnail_key" varchar(500),
	"metadata" jsonb,
	"creator_id" text NOT NULL,
	"derived_from" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sandbox_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" varchar(255) NOT NULL,
	"git_revision" varchar(100),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	"impersonated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "speech_texts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"reference_text" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcription_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_text_id" integer NOT NULL,
	"target_user_id" text NOT NULL,
	"transcribed_text" text NOT NULL,
	"audio_blob_key" varchar(500) NOT NULL,
	"accuracy" integer NOT NULL,
	"matching_words" integer NOT NULL,
	"non_matching_words" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_chat_generation" ADD CONSTRAINT "exercise_chat_generation_exercise_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_chat_generation" ADD CONSTRAINT "exercise_chat_generation_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_links" ADD CONSTRAINT "exercise_links_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_links" ADD CONSTRAINT "exercise_links_template_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exercise_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_links" ADD CONSTRAINT "exercise_links_target_user_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_results" ADD CONSTRAINT "exercise_results_link_fk" FOREIGN KEY ("link_id") REFERENCES "public"."exercise_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_results" ADD CONSTRAINT "exercise_results_template_item_fk" FOREIGN KEY ("template_item_id") REFERENCES "public"."exercise_template_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_template_items" ADD CONSTRAINT "exercise_template_items_template_fk" FOREIGN KEY ("template_id") REFERENCES "public"."exercise_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_template_items" ADD CONSTRAINT "exercise_template_items_exercise_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_templates" ADD CONSTRAINT "exercise_templates_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitation_organization_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitation_inviter_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_derived_from_fk" FOREIGN KEY ("derived_from") REFERENCES "public"."medias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "member_organization_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "member_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_texts" ADD CONSTRAINT "speech_texts_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcription_results" ADD CONSTRAINT "transcription_results_reference_text_fk" FOREIGN KEY ("reference_text_id") REFERENCES "public"."speech_texts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcription_results" ADD CONSTRAINT "transcription_results_target_user_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercise_chat_generation_exercise_idx" ON "exercise_chat_generation" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "exercise_chat_generation_user_idx" ON "exercise_chat_generation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exercise_chat_generation_status_idx" ON "exercise_chat_generation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exercise_chat_generation_sandbox_idx" ON "exercise_chat_generation" USING btree ("sandbox_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_links_token_idx" ON "exercise_links" USING btree ("token");--> statement-breakpoint
CREATE INDEX "exercise_links_creator_idx" ON "exercise_links" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "exercise_links_template_idx" ON "exercise_links" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "exercise_links_target_user_idx" ON "exercise_links" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "exercise_results_link_idx" ON "exercise_results" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "exercise_results_template_item_idx" ON "exercise_results" USING btree ("template_item_id");--> statement-breakpoint
CREATE INDEX "exercise_results_completed_at_idx" ON "exercise_results" USING btree ("completed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_results_link_template_item_unique" ON "exercise_results" USING btree ("link_id","template_item_id");--> statement-breakpoint
CREATE INDEX "exercise_template_items_template_idx" ON "exercise_template_items" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "exercise_template_items_exercise_idx" ON "exercise_template_items" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "exercise_template_items_template_position_idx" ON "exercise_template_items" USING btree ("template_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_template_items_template_position_unique" ON "exercise_template_items" USING btree ("template_id","position");--> statement-breakpoint
CREATE INDEX "exercise_templates_creator_idx" ON "exercise_templates" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_slug_idx" ON "exercises" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "exercises_tags_idx" ON "exercises" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "invitation_organization_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitation_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "medias_tags_idx" ON "medias" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "medias_mime_type_idx" ON "medias" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "member_organization_idx" ON "members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_organization_user_unique" ON "members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "sandbox_snapshots_expires_at_idx" ON "sandbox_snapshots" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "speech_texts_user_idx" ON "speech_texts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "speech_texts_name_idx" ON "speech_texts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "transcription_results_reference_text_idx" ON "transcription_results" USING btree ("reference_text_id");--> statement-breakpoint
CREATE INDEX "transcription_results_target_user_idx" ON "transcription_results" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "transcription_results_accuracy_idx" ON "transcription_results" USING btree ("accuracy");--> statement-breakpoint
CREATE INDEX "transcription_results_created_at_idx" ON "transcription_results" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."media_tags" AS (SELECT DISTINCT unnest("medias"."tags") AS tag FROM "medias");