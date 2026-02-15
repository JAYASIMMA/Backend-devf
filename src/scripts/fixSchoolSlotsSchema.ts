import sequelize from '../config/database';
import SchoolSlot from '../models/SchoolSlot';

const fixSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Forcing recreation of school_slots table...');
        await SchoolSlot.sync({ force: true });
        console.log('school_slots table recreated successfully.');

        const tableInfo = await sequelize.getQueryInterface().describeTable('school_slots');
        console.log('--- NEW COLUMNS ---');
        Object.keys(tableInfo).forEach(col => console.log(col));
        console.log('-------------------');

    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        await sequelize.close();
    }
};

fixSchema();
