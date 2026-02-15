import sequelize from '../config/database';

async function fixBookingsTable() {
    try {
        console.log('Starting bookings table fix...');
        
        // Drop the enum type if it exists
        await sequelize.query('DROP TYPE IF EXISTS "public"."enum_bookings_status" CASCADE;');
        console.log('Dropped existing ENUM type (if any)');
        
        // Drop the bookings table
        await sequelize.query('DROP TABLE IF EXISTS "bookings" CASCADE;');
        console.log('Dropped bookings table');
        
        // Now sync will recreate the table with correct structure
        await sequelize.sync({ force: false });
        console.log('Recreated bookings table with correct ENUM type');
        
        console.log('✅ Bookings table fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing bookings table:', error);
        process.exit(1);
    }
}

fixBookingsTable();
