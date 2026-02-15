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

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'schools';");
        const columns = results.map(r => r.column_name);
        console.log('ALL COLUMNS:', columns.join(', '));

        const hasIt = columns.some(c => c.toLowerCase() === 'schoolnumber' || c.toLowerCase() === 'school_number');
        if (hasIt) {
            console.log('MATCH FOUND: YES');
        } else {
            console.log('MATCH FOUND: NO');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
