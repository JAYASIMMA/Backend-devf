import sequelize from '../config/database';
import SuperAdmin from '../models/SuperAdmin';
import SchoolAdmin from '../models/SchoolAdmin';

async function createAdminTables() {
    try {
        console.log('🚀 Starting admin tables creation...\n');

        // Create SuperAdmin table
        console.log('Creating super_admins table...');
        await SuperAdmin.sync({ force: false });
        console.log('✅ super_admins table created successfully\n');

        // Create SchoolAdmin table
        console.log('Creating school_admins table...');
        await SchoolAdmin.sync({ force: false });
        console.log('✅ school_admins table created successfully\n');

        console.log('🎉 All admin tables created successfully!');
        console.log('\nTable Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n1. super_admins table:');
        console.log('   - id (Primary Key)');
        console.log('   - userId (Foreign Key -> users.id)');
        console.log('   - fullName');
        console.log('   - email (Unique)');
        console.log('   - phoneNumber (Unique)');
        console.log('   - department');
        console.log('   - permissions (JSON)');
        console.log('   - isActive (Boolean)');
        console.log('   - lastLogin (Date)');
        console.log('   - profilePhoto');
        console.log('   - notes');
        console.log('   - createdAt, updatedAt');

        console.log('\n2. school_admins table:');
        console.log('   - id (Primary Key)');
        console.log('   - userId (Foreign Key -> users.id)');
        console.log('   - schoolId (Foreign Key -> schools.id)');
        console.log('   - fullName');
        console.log('   - email (Unique)');
        console.log('   - phoneNumber (Unique)');
        console.log('   - designation');
        console.log('   - permissions (JSON)');
        console.log('   - isActive (Boolean)');
        console.log('   - lastLogin (Date)');
        console.log('   - profilePhoto');
        console.log('   - joiningDate (Date)');
        console.log('   - notes');
        console.log('   - createdAt, updatedAt');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📝 Next Steps:');
        console.log('1. Build the project: npm run build');
        console.log('2. Restart the server: npm start');
        console.log('3. Test the API endpoints:');
        console.log('   - POST /api/admin-management/super-admin/create');
        console.log('   - POST /api/admin-management/school-admin/create');
        console.log('   - GET /api/admin-management/super-admin/list');
        console.log('   - GET /api/admin-management/school-admin/list');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin tables:', error);
        process.exit(1);
    }
}

createAdminTables();
