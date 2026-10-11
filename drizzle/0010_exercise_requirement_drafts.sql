CREATE TABLE "exercise_requirement_drafts" (
	"created_exercise_id" integer,
	"creator_id" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_requirement_drafts" ADD CONSTRAINT "exercise_requirement_drafts_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_requirement_drafts" ADD CONSTRAINT "exercise_requirement_drafts_exercise_fk" FOREIGN KEY ("created_exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercise_requirement_drafts_creator_idx" ON "exercise_requirement_drafts" USING btree ("creator_id");