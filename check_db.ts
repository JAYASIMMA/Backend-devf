import User from './src/models/user';
import sequelize from './src/config/database';

(async () => {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        console.log('Users:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
})();
