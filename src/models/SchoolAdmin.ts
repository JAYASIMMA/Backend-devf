import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SchoolAdminAttributes {
    id?: number;
    userId: number; // Reference to User table
    schoolId: number; // Reference to School table
    fullName: string;
    email: string;
    phoneNumber: string;
    designation?: string; // e.g., "Principal", "Administrator", "Manager"
    permissions?: string[]; // Array of permissions specific to school management
    isActive: boolean;
    lastLogin?: Date;
    profilePhoto?: string;
    joiningDate?: Date;
    notes?: string; // Internal notes about this admin
}

class SchoolAdmin extends Model<SchoolAdminAttributes> implements SchoolAdminAttributes {
    public id!: number;
    public userId!: number;
    public schoolId!: number;
    public fullName!: string;
    public email!: string;
    public phoneNumber!: string;
    public designation!: string;
    public permissions!: string[];
    public isActive!: boolean;
    public lastLogin!: Date;
    public profilePhoto!: string;
    public joiningDate!: Date;
    public notes!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SchoolAdmin.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Administrator'
        },
        permissions: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [
                'manage_school_details',
                'manage_services',
                'manage_schedules',
                'view_bookings',
                'manage_slots',
                'view_analytics'
            ]
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        profilePhoto: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        joiningDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'school_admins',
        indexes: [
            {
                unique: true,
                fields: ['userId']
            },
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['schoolId']
            }
        ]
    }
);

export default SchoolAdmin;
