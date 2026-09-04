CREATE TABLE "exercise_workspaces" (
	"active_generation_id" integer,
	"base_commit_sha" varchar(64),
	"exercise_id" integer NOT NULL,
	"harness_resume_state" jsonb,
	"harness_session_id" varchar(255) NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"last_active_at" timestamp with time zone,
	"last_error" text,
	"lock_expires_at" timestamp with time zone,
	"sandbox_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "creator_id" text;--> statement-breakpoint
ALTER TABLE "exercise_workspaces" ADD CONSTRAINT "exercise_workspaces_exercise_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_workspaces" ADD CONSTRAINT "exercise_workspaces_active_generation_fk" FOREIGN KEY ("active_generation_id") REFERENCES "public"."exercise_chat_generation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_workspaces_exercise_unique" ON "exercise_workspaces" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_workspaces_harness_session_unique" ON "exercise_workspaces" USING btree ("harness_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_workspaces_sandbox_unique" ON "exercise_workspaces" USING btree ("sandbox_name");--> statement-breakpoint
CREATE INDEX "exercise_workspaces_active_generation_idx" ON "exercise_workspaces" USING btree ("active_generation_id");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercises_creator_idx" ON "exercises" USING btree ("creator_id");