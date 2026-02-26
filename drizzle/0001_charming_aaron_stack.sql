CREATE TABLE "waitlist_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_emails_email_idx" ON "waitlist_emails" USING btree ("email");