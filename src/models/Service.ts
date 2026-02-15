import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import School from './School';

interface ServiceAttributes {
    id?: number;
    schoolId: number;
    name: string;
    description?: string;
    cost: number;
    duration: string; // e.g. "09:00-17:00" or "1 hour"
    phoneNumber?: string;
    advancedBookingEnabled: boolean;
}

class Service extends Model<ServiceAttributes> implements ServiceAttributes {
    public id!: number;
    public schoolId!: number;
    public name!: string;
    public description!: string;
    public cost!: number;
    public duration!: string;
    public phoneNumber?: string;
    public advancedBookingEnabled!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Service.init(
    {
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        cost: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        advancedBookingEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'advanced_booking_enabled',
        }
    },
    {
        sequelize,
        tableName: 'services',
    }
);

export default Service;
