DROP INDEX "accounts_issuer_account_id_unique";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" DROP NOT NULL;