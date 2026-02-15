import sequelize from '../config/database';
import User from '../models/user';
import SuperAdmin from '../models/SuperAdmin';
import bcrypt from 'bcryptjs';
import defineAssociations from '../models/associations';

async function addSuperAdmin() {
    try {
        // Define associations first
        defineAssociations();

        // Sync database (safe alternative to force/alter)
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'superadmin@specialnest.com';
        const phoneNumber = '9999999999';
        const password = 'AdminPassword123';
        const fullName = 'Main Super Admin';

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('Super Admin user already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            email,
            mobileNumber: phoneNumber,
            password: hashedPassword,
            role: 'super_admin',
            isFirstLogin: false,
            username: 'superadmin'
        });

        // Create SuperAdmin Profile
        await SuperAdmin.create({
            userId: user.id,
            fullName,
            email,
            phoneNumber,
            department: 'Management',
            isActive: true,
            permissions: [
                'manage_schools',
                'manage_school_admins',
                'manage_super_admins',
                'view_analytics',
                'manage_bookings',
                'manage_parents',
                'system_settings'
            ]
        });

        console.log('-----------------------------------');
        console.log('Super Admin created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Failed to add Super Admin:', error);
    } finally {
        await sequelize.close();
    }
}

addSuperAdmin();
