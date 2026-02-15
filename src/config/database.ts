import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPass = process.env.DB_PASS as string;
const dbHost = process.env.DB_HOST as string;
const dbDialect = (process.env.DB_DIALECT || 'postgres') as 'postgres';

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: dbDialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

console.log('Database Config Dialect Options:', JSON.stringify(sequelize.config.dialectOptions, null, 2));
console.log('Using database configuration from TS file.');

export default sequelize;
