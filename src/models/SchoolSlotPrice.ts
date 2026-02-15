import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SchoolSlotPriceAttributes {
    id: number;
    schoolId: number;
    serviceId: number | null; // Null for global defaults
    slotName: string;
    startTime: string;
    endTime: string;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SchoolSlotPriceCreationAttributes extends Optional<SchoolSlotPriceAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class SchoolSlotPrice extends Model<SchoolSlotPriceAttributes, SchoolSlotPriceCreationAttributes> implements SchoolSlotPriceAttributes {
    public id!: number;
    public schoolId!: number;
    public serviceId!: number | null; // Null for global defaults
    public slotName!: string;
    public startTime!: string;
    public endTime!: string;
    public price!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SchoolSlotPrice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'school_id',
            references: {
                model: 'schools',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'service_id',
            references: {
                model: 'services',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        slotName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'slot_name',
        },
        startTime: {
            type: DataTypes.STRING(10),
            allowNull: false,
            field: 'start_time',
        },
        endTime: {
            type: DataTypes.STRING(10),
            allowNull: false,
            field: 'end_time',
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
    },
    {
        sequelize,
        tableName: 'school_slot_prices',
        timestamps: true,
        underscored: true,
    }
);

export default SchoolSlotPrice;
