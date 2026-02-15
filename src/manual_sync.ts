import sequelize from './config/database';
import Child from './models/Child';
import Parent from './models/Parent';
import User from './models/user';

const runSync = async () => {
    try {
        console.log('Starting manual database sync (AWS Repo)...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        await sequelize.sync({ alter: true });

        console.log('Database sync completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
};

runSync();
