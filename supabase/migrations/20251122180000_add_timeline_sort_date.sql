-- Rename real_date to sort_date and ensure it is used for sorting
ALTER TABLE "public"."timeline_events" RENAME COLUMN "real_date" TO "sort_date";

-- Make sort_date NOT NULL (assuming we want to enforce it for sorting)
-- We set a default for existing rows first
UPDATE "public"."timeline_events" SET "sort_date" = CURRENT_DATE WHERE "sort_date" IS NULL;
ALTER TABLE "public"."timeline_events" ALTER COLUMN "sort_date" SET NOT NULL;
ALTER TABLE "public"."timeline_events" ALTER COLUMN "sort_date" SET DEFAULT CURRENT_DATE;

-- Update comment
COMMENT ON COLUMN "public"."timeline_events"."sort_date" IS 'Date used for chronological sorting of events.';
