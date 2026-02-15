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

const School = sequelize.define('school', {
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    schoolNumber: { type: DataTypes.STRING, allowNull: true } // Testing this specific column
}, {
    tableName: 'schools'
});

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const testPhone = "9998887776";
        const school = await School.create({
            name: "Test Persistence School",
            address: "123 Test Lane",
            city: "Test City",
            schoolNumber: testPhone
        });

        console.log(`Created school with ID: ${school.id}`);

        const fetched = await School.findByPk(school.id);
        console.log(`Fetched schoolNumber: ${fetched.schoolNumber}`);

        if (fetched.schoolNumber === testPhone) {
            console.log("SUCCESS: Phone number persisted correctly.");
        } else {
            console.log(`FAILURE: Expected ${testPhone}, got ${fetched.schoolNumber}`);
        }

        await school.destroy();
        console.log("Cleanup done.");

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

verify();
