const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    'specialdb',
    'postgres',
    'adminroot',
    {
        host: 'specialnest-1984.c3weeoe2iall.ap-south-1.rds.amazonaws.com',
        dialect: 'postgres',
        port: 5432,
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

// Minimal Model
const School = sequelize.define('School', {
    schoolNumber: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'schools',
    timestamps: true
});

async function verifyUpdate() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // 1. Fetch
        const school = await School.findByPk(1);
        if (!school) {
            console.log('School ID 1 not found.');
            return;
        }
        console.log('Before Update:', school.schoolNumber);

        // 2. Update
        const newNum = '9876543210';
        await school.update({ schoolNumber: newNum });
        console.log('Update command sent.');

        // 3. Re-fetch
        const updatedSchool = await School.findByPk(1);
        console.log('After Update:', updatedSchool.schoolNumber);

        if (updatedSchool.schoolNumber === newNum) {
            console.log('SUCCESS: schoolNumber persistence verified.');
        } else {
            console.log('FAILURE: schoolNumber did not persist.');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await sequelize.close();
    }
}

verifyUpdate();
