import sequelize from '../config/database';

const checkSchema = async () => {
    try {
        await sequelize.authenticate();
        const tableInfo = await sequelize.getQueryInterface().describeTable('school_slots');
        console.log('--- COLUMNS ---');
        Object.keys(tableInfo).forEach(col => console.log(col));
        console.log('---------------');
    } catch (error) {
        console.error('Error describing table:', error);
    } finally {
        await sequelize.close();
    }
};

checkSchema();
