const { Sequelize } = require('sequelize');

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

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'schools' AND column_name = 'schoolNumber';");

        if (results.length > 0) {
            console.log('COLUMN_EXISTS: YES');
        } else {
            console.log('COLUMN_EXISTS: NO');
        }

    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
