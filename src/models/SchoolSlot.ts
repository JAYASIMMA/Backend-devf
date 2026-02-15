import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SchoolSlotAttributes {
    id: number;
    schoolId: number;
    serviceId: number;
    slotName: string;
    startTime: string;
    endTime: string;
    capacity: number;
    fromDate?: string;
    endDate?: string;
    weekdays?: string[];
    isActive: boolean;
    isRecurring: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SchoolSlotCreationAttributes extends Optional<SchoolSlotAttributes, 'id' | 'isRecurring' | 'createdAt' | 'updatedAt'> { }

class SchoolSlot extends Model<SchoolSlotAttributes, SchoolSlotCreationAttributes> implements SchoolSlotAttributes {
    public id!: number;
    public schoolId!: number;
    public serviceId!: number;
    public slotName!: string;
    public startTime!: string;
    public endTime!: string;
    public capacity!: number;
    public fromDate!: string;
    public endDate!: string;
    public weekdays!: string[];
    public isActive!: boolean;
    public isRecurring!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SchoolSlot.init(
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
            allowNull: false,
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
            defaultValue: 'Regular Slot',
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
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
        },
        fromDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'from_date',
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'end_date',
        },
        weekdays: {
            type: DataTypes.JSON, // Stores array like ["Mon", "Fri"]
            allowNull: true,
            defaultValue: [],
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
        },
        isRecurring: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_recurring',
        },
    },
    {
        sequelize,
        tableName: 'school_slots',
        timestamps: true,
        underscored: true,
    }
);

export default SchoolSlot;
