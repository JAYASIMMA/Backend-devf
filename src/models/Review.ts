import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface ReviewAttributes {
    id?: number;
    schoolId: number;
    parentId: number;
    bookingId: number;
    rating: number; // 1-5
    comment?: string;
}

class Review extends Model<ReviewAttributes> implements ReviewAttributes {
    public id!: number;
    public schoolId!: number;
    public parentId!: number;
    public bookingId!: number;
    public rating!: number;
    public comment!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Review.init(
    {
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bookingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // One review per booking
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'reviews',
    }
);

export default Review;
