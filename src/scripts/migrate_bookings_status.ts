import sequelize from '../config/database';

async function migrateBookingsStatus() {
    try {
        console.log('Starting bookings status migration...');

        // Step 1: Create the ENUM type if it doesn't exist
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."enum_bookings_status" AS ENUM('booked', 'completed', 'cancelled');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✅ ENUM type created/verified');

        // Step 2: Add a temporary column with the ENUM type
        await sequelize.query(`
            ALTER TABLE "bookings" 
            ADD COLUMN IF NOT EXISTS "status_new" "public"."enum_bookings_status" DEFAULT 'booked';
        `);
        console.log('✅ Added temporary status_new column');

        // Step 3: Copy data from old column to new column, with validation
        await sequelize.query(`
            UPDATE "bookings" 
            SET "status_new" = CASE 
                WHEN "status" IN ('booked', 'completed', 'cancelled') THEN "status"::"public"."enum_bookings_status"
                ELSE 'booked'::"public"."enum_bookings_status"
            END;
        `);
        console.log('✅ Migrated existing data to new column');

        // Step 4: Drop the old column
        await sequelize.query(`
            ALTER TABLE "bookings" DROP COLUMN IF EXISTS "status";
        `);
        console.log('✅ Dropped old status column');

        // Step 5: Rename the new column to the original name
        await sequelize.query(`
            ALTER TABLE "bookings" RENAME COLUMN "status_new" TO "status";
        `);
        console.log('✅ Renamed status_new to status');

        // Step 6: Set NOT NULL constraint if needed
        await sequelize.query(`
            ALTER TABLE "bookings" ALTER COLUMN "status" SET NOT NULL;
        `);
        console.log('✅ Set NOT NULL constraint');

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

migrateBookingsStatus();
