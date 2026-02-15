import sequelize from '../config/database';
import { DataTypes } from 'sequelize';

async function fixParentSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('parents');

        if (!tableInfo.state) {
            console.log('Adding state column to parents table...');
            await queryInterface.addColumn('parents', 'state', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            console.log('✅ state column added.');
        } else {
            console.log('state column already exists in parents table.');
        }

        if (!tableInfo.pincode) {
            console.log('Adding pincode column to parents table...');
            await queryInterface.addColumn('parents', 'pincode', {
                type: DataTypes.STRING,
                allowNull: true,
            });
            console.log('✅ pincode column added.');
        } else {
            console.log('pincode column already exists in parents table.');
        }

        console.log('Parent schema check complete.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to fix parent schema:', error);
        process.exit(1);
    }
}

fixParentSchema();
