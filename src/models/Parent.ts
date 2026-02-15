import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user';

interface ParentAttributes {
    id?: number;
    userId: number;
    fatherName: string;
    motherName: string;
    guardianName?: string;
    primaryContact: string;
    alternateContact?: string;
    email?: string;
    address: string;
    location: string;
    pincode?: string;
    state?: string;
    profileImage?: string;
}

class Parent extends Model<ParentAttributes> implements ParentAttributes {
    public id!: number;
    public userId!: number;
    public fatherName!: string;
    public motherName!: string;
    public guardianName!: string;
    public primaryContact!: string;
    public alternateContact!: string;
    public email!: string;
    public address!: string;
    public location!: string;
    public pincode!: string;
    public state!: string;
    public profileImage!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Parent.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        fatherName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        motherName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guardianName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        primaryContact: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        alternateContact: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'parents',
    }
);

// Associations move to associations.ts
export default Parent;
