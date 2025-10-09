-- Migration: Add username to User and firstName/lastName to Profile
-- This migration adds new fields and backfills existing data

-- Step 1: Add new columns (nullable initially)
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "Profile" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Profile" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Profile" ADD COLUMN "dateOfBirth" TIMESTAMP(3);

-- Step 2: Backfill username from email (before @ sign, lowercase)
-- Handle collisions by appending user ID suffix
DO $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    FOR user_record IN SELECT id, email FROM "User" WHERE username IS NULL
    LOOP
        -- Extract base username from email (part before @)
        base_username := lower(split_part(user_record.email, '@', 1));

        -- Remove any characters that aren't alphanumeric, dots, or underscores
        base_username := regexp_replace(base_username, '[^a-z0-9._]', '_', 'g');

        -- Ensure username is at least 3 characters
        IF length(base_username) < 3 THEN
            base_username := base_username || '_user';
        END IF;

        -- Check for collisions and append counter if needed
        final_username := base_username;
        counter := 1;

        WHILE EXISTS (SELECT 1 FROM "User" WHERE username = final_username) LOOP
            final_username := base_username || counter::text;
            counter := counter + 1;
        END LOOP;

        -- Update the user
        UPDATE "User" SET username = final_username WHERE id = user_record.id;
    END LOOP;
END $$;

-- Step 3: Backfill Profile names from displayName
-- Try to split displayName into firstName and lastName
DO $$
DECLARE
    profile_record RECORD;
    name_parts TEXT[];
    first_name TEXT;
    last_name TEXT;
BEGIN
    FOR profile_record IN SELECT id, "displayName" FROM "Profile" WHERE "firstName" IS NULL
    LOOP
        -- Split displayName by spaces
        name_parts := string_to_array(trim(profile_record."displayName"), ' ');

        -- Handle different cases
        IF array_length(name_parts, 1) >= 2 THEN
            -- Multiple words: first word is firstName, rest is lastName
            first_name := name_parts[1];
            last_name := array_to_string(name_parts[2:array_length(name_parts,1)], ' ');
        ELSIF array_length(name_parts, 1) = 1 THEN
            -- Single word: use as firstName, lastName = first initial
            first_name := name_parts[1];
            last_name := substring(name_parts[1], 1, 1);
        ELSE
            -- Empty displayName: use placeholder
            first_name := 'User';
            last_name := substring(profile_record.id, 1, 4);
        END IF;

        -- Update the profile
        UPDATE "Profile"
        SET
            "firstName" = first_name,
            "lastName" = last_name
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- Step 4: Backfill dateOfBirth from birthYear if available
-- Create a date on January 1st of the birth year
UPDATE "Profile"
SET "dateOfBirth" = make_date("birthYear", 1, 1)
WHERE "birthYear" IS NOT NULL AND "dateOfBirth" IS NULL;

-- Step 5: Create unique index on username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Step 6: Create index on username for faster lookups
CREATE INDEX "User_username_idx" ON "User"("username");

-- Step 7: Drop the old birthYear column (data is now in dateOfBirth)
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "birthYear";

-- NOTE: In the next migration, we will make username, firstName, and lastName NOT NULL
-- This two-step approach allows for safe backfilling
