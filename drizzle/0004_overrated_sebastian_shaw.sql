CREATE TABLE "exercise_config_presets" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_id" integer NOT NULL,
	"creator_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_config_presets" ADD CONSTRAINT "exercise_config_presets_exercise_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_config_presets" ADD CONSTRAINT "exercise_config_presets_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercise_config_presets_exercise_idx" ON "exercise_config_presets" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "exercise_config_presets_creator_idx" ON "exercise_config_presets" USING btree ("creator_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exercise_config_presets_exercise_creator_name_unique" ON "exercise_config_presets" USING btree ("exercise_id","creator_id","name");