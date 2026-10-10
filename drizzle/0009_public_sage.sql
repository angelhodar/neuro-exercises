CREATE TABLE "auth_rate_limits" (
	"count" integer NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "auth_rate_limits_key_unique" UNIQUE("key")
);
--> statement-breakpoint
UPDATE "organizations" SET "slug" = 'legacy-' || "id" WHERE "slug" IS NULL;--> statement-breakpoint
UPDATE "users" SET "name" = "email" WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
-- The legacy create action assigned its creator "admin" instead of "owner".
-- Preserve existing owners; promote the earliest admin only for ownerless orgs.
WITH legacy_owners AS (
  SELECT DISTINCT ON (m."organization_id") m."id"
  FROM "members" m
  WHERE 'admin' = ANY(string_to_array(m."role", ','))
    AND NOT EXISTS (
      SELECT 1 FROM "members" owner
      WHERE owner."organization_id" = m."organization_id"
        AND 'owner' = ANY(string_to_array(owner."role", ','))
    )
  ORDER BY m."organization_id", m."created_at", m."id"
)
UPDATE "members" SET "role" = 'owner'
WHERE "id" IN (SELECT "id" FROM legacy_owners);
