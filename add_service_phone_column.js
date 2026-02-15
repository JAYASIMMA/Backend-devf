const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'specialdb',
    'postgres',
    'adminroot',
    {
        host: 'specialnest-1984.c3weeoe2iall.ap-south-1.rds.amazonaws.com',
        dialect: 'postgres',
        port: 5432,
        logging: console.log,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        await sequelize.query('ALTER TABLE services ADD COLUMN "phoneNumber" VARCHAR(255);');
        console.log('Column phoneNumber added successfully to services table.');

    } catch (error) {
        if (error.original && error.original.code === '42701') {
            console.log('Column already exists.');
        } else {
            console.error('ERROR:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addColumn();
