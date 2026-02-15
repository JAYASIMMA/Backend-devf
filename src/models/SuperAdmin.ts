import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SuperAdminAttributes {
    id?: number;
    userId: number; // Reference to User table
    fullName: string;
    email: string;
    phoneNumber: string;
    department?: string; // e.g., "Operations", "Management"
    permissions?: string[]; // Array of permissions like ["manage_schools", "manage_admins", "view_analytics"]
    isActive: boolean;
    lastLogin?: Date;
    profilePhoto?: string;
    notes?: string; // Internal notes about this admin
}

class SuperAdmin extends Model<SuperAdminAttributes> implements SuperAdminAttributes {
    public id!: number;
    public userId!: number;
    public fullName!: string;
    public email!: string;
    public phoneNumber!: string;
    public department!: string;
    public permissions!: string[];
    public isActive!: boolean;
    public lastLogin!: Date;
    public profilePhoto!: string;
    public notes!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SuperAdmin.init(
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
        department: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        permissions: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [
                'manage_schools',
                'manage_school_admins',
                'manage_super_admins',
                'view_analytics',
                'manage_bookings',
                'manage_parents',
                'system_settings'
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
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'super_admins',
        indexes: [
            {
                unique: true,
                fields: ['userId']
            },
            {
                unique: true,
                fields: ['email']
            }
        ]
    }
);

export default SuperAdmin;
