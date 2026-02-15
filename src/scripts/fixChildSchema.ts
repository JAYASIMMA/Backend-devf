import sequelize from '../config/database';
import { DataTypes } from 'sequelize';

async function fixChildSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('children');

        if (!tableInfo.dob) {
            console.log('Adding dob column to children table...');
            await queryInterface.addColumn('children', 'dob', {
                type: DataTypes.DATEONLY,
                allowNull: true,
            });
            console.log('✅ dob column added.');
        } else {
            console.log('dob column already exists.');
        }

        if (!tableInfo.gender) {
            console.log('Adding gender column to children table...');
            await queryInterface.addColumn('children', 'gender', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            console.log('✅ gender column added.');
        } else {
            console.log('gender column already exists.');
        }

        console.log('Child schema check complete.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to fix child schema:', error);
        process.exit(1);
    }
}

fixChildSchema();
