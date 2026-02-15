import sequelize from '../config/database';

// Import models to ensure they are registered
import '../models/School';
import '../models/Service';
import '../models/SchoolSlot';
import '../models/Booking';
import '../models/Parent';
import '../models/Child';
import '../models/associations';

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true });
        console.log('Database synced.');
        process.exit(0);
    } catch (error: any) {
        console.error('Startup Error:', error);
        process.exit(1);
    }
};

start();
