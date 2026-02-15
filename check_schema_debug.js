const { Sequelize } = require('sequelize');

// Hardcoded config based on .env
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
        console.log('Connection has been established successfully.');

        const [results, metadata] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'schools';");
        const columns = results.map(r => r.column_name);
        console.log('Columns in schools table:', columns);

        const schoolNumberCol = results.find(r => r.column_name === 'schoolNumber' || r.column_name === 'school_number' || r.column_name === 'schoolnumber');
        if (schoolNumberCol) {
            console.log('Found column:', schoolNumberCol);
        } else {
            console.log('Column schoolNumber NOT FOUND');
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
