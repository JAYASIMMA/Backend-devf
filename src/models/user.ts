import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
    id?: number;
    username?: string;
    email?: string;
    mobileNumber: string;
    password?: string;
    role?: 'parent' | 'specialist' | 'admin' | 'school_admin' | 'super_admin';
    isFirstLogin?: boolean;
    schoolId?: number;
}

class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public mobileNumber!: string;
    public password!: string;
    public role!: 'parent' | 'specialist' | 'admin' | 'school_admin' | 'super_admin';
    public isFirstLogin!: boolean;
    public schoolId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        mobileNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('parent', 'specialist', 'admin', 'school_admin', 'super_admin'),
            defaultValue: 'parent',
        },
        isFirstLogin: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'schools',
                key: 'id',
            }
        }
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User;
