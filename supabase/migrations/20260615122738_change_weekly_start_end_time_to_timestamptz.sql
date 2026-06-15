ALTER TABLE "public"."general_settings"
  ALTER COLUMN "weekly_start_time" DROP DEFAULT,
  ALTER COLUMN "weekly_end_time" DROP DEFAULT,
  ALTER COLUMN "weekly_start_time" TYPE timestamp with time zone USING CURRENT_DATE + "weekly_start_time",
  ALTER COLUMN "weekly_end_time" TYPE timestamp with time zone USING CURRENT_DATE + "weekly_end_time";
