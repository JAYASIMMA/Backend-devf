import sequelize from './config/database';
import User from './models/user';
import bcrypt from 'bcryptjs';

const seedSuperAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Check if super admin exists
        const existing = await User.findOne({ where: { role: 'super_admin' } });
        if (existing) {
            console.log('Super Admin already exists.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 8);

        await User.create({
            username: 'superadmin',
            mobileNumber: '9999999999',
            password: hashedPassword,
            email: 'admin@specialnest.com',
            role: 'super_admin'
        });

        console.log('Super Admin created successfully.');
        console.log('Mobile: 9999999999');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error seeding super admin:', error);
    } finally {
        await sequelize.close();
    }
};

seedSuperAdmin();
