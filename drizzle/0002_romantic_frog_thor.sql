CREATE TABLE "patient_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"type" varchar(50) NOT NULL,
	"discipline" varchar(50) NOT NULL,
	"observations" text,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"session_id" integer,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"evaluated_process" varchar(100) NOT NULL,
	"test_name" varchar(255),
	"score" varchar(100),
	"observations" text,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"date_of_birth" timestamp with time zone,
	"phone" varchar(50),
	"email" varchar(255),
	"diagnosis" text,
	"notes" text,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD CONSTRAINT "patient_sessions_patient_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD CONSTRAINT "patient_sessions_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_patient_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_session_fk" FOREIGN KEY ("session_id") REFERENCES "public"."patient_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_creator_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_sessions_patient_idx" ON "patient_sessions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_sessions_creator_idx" ON "patient_sessions" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "patient_sessions_date_idx" ON "patient_sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "patient_tests_patient_idx" ON "patient_tests" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_tests_session_idx" ON "patient_tests" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "patient_tests_creator_idx" ON "patient_tests" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "patient_tests_evaluated_process_idx" ON "patient_tests" USING btree ("evaluated_process");--> statement-breakpoint
CREATE INDEX "patients_creator_idx" ON "patients" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "patients_last_name_idx" ON "patients" USING btree ("last_name");