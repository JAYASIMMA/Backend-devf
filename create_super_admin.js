const sequelize = require('./dist/config/database').default;
const User = require('./dist/models/user').default;
const bcrypt = require('bcryptjs');

const createSuperAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const username = 'admin1984';
        const mobileNumber = '9159384606';
        const email = 'jayasimma1@gmail.com';
        const password = 'admin123';

        console.log(`Creating Super Admin: ${username}`);

        // Check if exists
        const oldUser = await User.findOne({ where: { mobileNumber } });
        if (oldUser) {
            console.log('User with this mobile already exists. Deleting...');
            await User.destroy({ where: { id: oldUser.id } });
        }

        const oldUserByEmail = await User.findOne({ where: { email } });
        if (oldUserByEmail) {
            console.log('User with this email already exists. Deleting...');
            await User.destroy({ where: { id: oldUserByEmail.id } });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            mobileNumber,
            password: hashedPassword,
            role: 'super_admin',
            isFirstLogin: false,
            username: username
        });

        console.log(`✅ Super Admin Created!`);
        console.log(`Username: ${username}`);
        console.log(`Mobile: ${mobileNumber}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createSuperAdmin();
