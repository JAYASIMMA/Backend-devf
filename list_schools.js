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
    schoolNumber: { type: DataTypes.STRING, allowNull: true }
}, {
    tableName: 'schools'
});

async function list() {
    try {
        await sequelize.authenticate();
        const schools = await School.findAll();

        console.log('\n==========================================');
        console.log(`TOTAL SCHOOLS: ${schools.length}`);
        schools.forEach(s => {
            console.log(`[${s.id}] ${s.name} | Phone: "${s.schoolNumber || 'N/A'}"`);
        });
        console.log('==========================================\n');

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

list();
