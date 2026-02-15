import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface BookingAttributes {
    id?: number;
    schoolId: number;
    parentId: number; // We'll link to Parent model
    childId: number;  // We'll link to Child model
    serviceId: number;
    slotId?: number;
    date: Date;
    status: 'booked' | 'completed' | 'cancelled';
    amount: number;
    bookingIdStr: string; // Unique string ID for reference
    cancellationReason?: string;
}

class Booking extends Model<BookingAttributes> implements BookingAttributes {
    public id!: number;
    public schoolId!: number;
    public parentId!: number;
    public childId!: number;
    public serviceId!: number;
    public slotId!: number;
    public date!: Date;
    public status!: 'booked' | 'completed' | 'cancelled';
    public amount!: number;
    public bookingIdStr!: string;
    public cancellationReason!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Booking.init(
    {
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        childId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        slotId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'school_slots', // Matches tableName in SchoolSlot.ts
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATE, // Storing full date-time or just date depending on need
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('booked', 'completed', 'cancelled'),
            defaultValue: 'booked',
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        bookingIdStr: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        cancellationReason: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'bookings',
    }
);

export default Booking;
