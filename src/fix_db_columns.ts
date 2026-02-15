import sequelize from './config/database';

const fixColumns = async () => {
    try {
        console.log('Starting raw SQL column addition...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        // Add dob column
        await sequelize.query('ALTER TABLE children ADD COLUMN IF NOT EXISTS dob DATE;');
        console.log('Column "dob" check/addition completed.');

        // Add gender column
        await sequelize.query('ALTER TABLE children ADD COLUMN IF NOT EXISTS gender VARCHAR(255);');
        console.log('Column "gender" check/addition completed.');

        console.log('Database columns fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing database columns:', error);
        process.exit(1);
    }
};

fixColumns();
