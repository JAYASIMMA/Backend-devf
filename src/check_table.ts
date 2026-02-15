import sequelize from './config/database';

const checkTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK.');

        const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'children';");

        console.log('Columns in "children" table:');
        console.table(results);

        const [childSample] = await sequelize.query("SELECT * FROM children LIMIT 1;");
        console.log('Sample child record:');
        console.log(JSON.stringify(childSample[0], null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error checking table:', error);
        process.exit(1);
    }
};

checkTable();
