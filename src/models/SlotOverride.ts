import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SlotOverrideAttributes {
    id?: number;
    schoolId: number;
    serviceId: number;
    slotId: number;
    date: string; // DateOnly YYYY-MM-DD
    newCapacity: number;
    reason?: string;
}

class SlotOverride extends Model<SlotOverrideAttributes> implements SlotOverrideAttributes {
    public id!: number;
    public schoolId!: number;
    public serviceId!: number;
    public slotId!: number;
    public date!: string;
    public newCapacity!: number;
    public reason!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SlotOverride.init(
    {
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        slotId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        newCapacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'slot_overrides',
        indexes: [
            {
                unique: true,
                fields: ['slot_id', 'date']
            }
        ],
        underscored: true
    }
);

export default SlotOverride;
