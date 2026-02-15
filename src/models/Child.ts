import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Parent from './Parent';

interface ChildAttributes {
    id?: number;
    parentId: number;
    name: string;
    age: number;
    disabilityType: string;
    disabilityPercent: number;
    aadharNumber: string;
    uuid?: string;
    schoolName?: string;
    schoolAddress?: string;
    schoolContactPerson?: string;
    schoolContactNumber?: string;
    profileImage?: string;
    dob?: Date | string;
    gender?: string;
}

class Child extends Model<ChildAttributes> implements ChildAttributes {
    public id!: number;
    public parentId!: number;
    public name!: string;
    public age!: number;
    public disabilityType!: string;
    public disabilityPercent!: number;
    public aadharNumber!: string;
    public uuid!: string;
    public schoolName!: string;
    public schoolAddress!: string;
    public schoolContactPerson!: string;
    public schoolContactNumber!: string;
    public profileImage!: string;
    public dob!: Date | string;
    public gender!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Child.init(
    {
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Parent,
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        disabilityType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        disabilityPercent: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        aadharNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        uuid: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        schoolName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        schoolAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        schoolContactPerson: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        schoolContactNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'children',
    }
);

// Associations move to associations.ts
export default Child;
