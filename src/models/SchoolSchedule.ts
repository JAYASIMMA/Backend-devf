import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SchoolScheduleAttributes {
    id?: number;
    schoolId: number;
    serviceId?: number; // Optional: block specific service or whole school if null
    blockedDate: Date;
    reason?: string;
}

class SchoolSchedule extends Model<SchoolScheduleAttributes> implements SchoolScheduleAttributes {
    public id!: number;
    public schoolId!: number;
    public serviceId!: number;
    public blockedDate!: Date;
    public reason!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SchoolSchedule.init(
    {
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        blockedDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'school_schedules',
    }
);

export default SchoolSchedule;
