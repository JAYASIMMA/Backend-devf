import sequelize from '../config/database';

const checkRows = async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('SELECT COUNT(*) FROM school_slots');
        console.log('Row count:', results[0]);
    } catch (error) {
        console.error('Error counting rows:', error);
    } finally {
        await sequelize.close();
    }
};

checkRows();
