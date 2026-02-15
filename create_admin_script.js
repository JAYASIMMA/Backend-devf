const sequelize = require('./dist/config/database').default;
const User = require('./dist/models/user').default;
const SchoolAdmin = require('./dist/models/SchoolAdmin').default;
const School = require('./dist/models/School').default;
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Ensure a school exists
        let school = await School.findOne();
        if (!school) {
            console.log('No school found. Creating dummy school...');
            school = await School.create({
                name: 'Special Nest Academy',
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                contactNumber: '9999999999',
                email: 'school@test.com'
            });
        }

        const fullName = 'John Doe';
        const mobileNumber = '9876543210';
        const email = 'johndoe@school.com';
        const password = 'password123';

        // Username Logic
        const cleanName = fullName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
        const phoneSuffix = mobileNumber.slice(-4);
        const username = `${cleanName}${phoneSuffix}`;

        console.log(`Creating Admin: ${username}`);

        // Check if exists
        const oldUser = await User.findOne({ where: { mobileNumber } });
        if (oldUser) {
            console.log('User already exists. Deleting...');
            await User.destroy({ where: { id: oldUser.id } });
        }

        const oldUserByEmail = await User.findOne({ where: { email } });
        if (oldUserByEmail) {
            console.log('User email already exists. Deleting...');
            await User.destroy({ where: { id: oldUserByEmail.id } });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            mobileNumber,
            password: hashedPassword,
            role: 'school_admin',
            schoolId: school.id,
            isFirstLogin: false,
            username: username
        });

        await SchoolAdmin.create({
            userId: user.id,
            schoolId: school.id,
            fullName,
            email,
            phoneNumber: mobileNumber,
            designation: 'Principal',
            isActive: true,
            permissions: ['all']
        });

        console.log(`✅ School Admin Created!`);
        console.log(`Username: ${username}`);
        console.log(`Mobile: ${mobileNumber}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
