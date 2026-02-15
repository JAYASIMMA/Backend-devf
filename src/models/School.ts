import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import SchoolSlot from './SchoolSlot';

interface SchoolAttributes {
    id?: number;
    name: string;
    tag?: string;
    address: string;
    city: string;
    landmark?: string;
    busStand?: string;
    metroStation?: string;
    latitude?: number;
    longitude?: number;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    image5?: string;
    image6?: string;
    image7?: string;
    image8?: string;
    image9?: string;
    image10?: string;
    logoUrl?: string;
    principalPhoto?: string;
    description?: string;
    achievements?: string[];
    amenities?: string[];
    servicesOffered?: string[];
    schoolNumber?: string;
}

class School extends Model<SchoolAttributes> implements SchoolAttributes {
    public id!: number;
    public name!: string;
    public tag!: string;
    public address!: string;
    public city!: string;
    public landmark!: string;
    public busStand!: string;
    public metroStation!: string;
    public latitude!: number;
    public longitude!: number;
    public image1!: string;
    public image2!: string;
    public image3!: string;
    public image4!: string;
    public image5!: string;
    public image6!: string;
    public image7!: string;
    public image8!: string;
    public image9!: string;
    public image10!: string;
    public logoUrl!: string;
    public principalPhoto!: string;
    public description!: string;
    public achievements!: string[];
    public amenities!: string[];
    public servicesOffered!: string[];
    public schoolNumber!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

School.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        landmark: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        busStand: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        metroStation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        image1: { type: DataTypes.TEXT, allowNull: true },
        image2: { type: DataTypes.TEXT, allowNull: true },
        image3: { type: DataTypes.TEXT, allowNull: true },
        image4: { type: DataTypes.TEXT, allowNull: true },
        image5: { type: DataTypes.TEXT, allowNull: true },
        image6: { type: DataTypes.TEXT, allowNull: true },
        image7: { type: DataTypes.TEXT, allowNull: true },
        image8: { type: DataTypes.TEXT, allowNull: true },
        image9: { type: DataTypes.TEXT, allowNull: true },
        image10: { type: DataTypes.TEXT, allowNull: true },
        logoUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        principalPhoto: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        achievements: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        amenities: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        servicesOffered: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        schoolNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'schools',
    }
);

// Associations
School.hasMany(SchoolSlot, { foreignKey: 'schoolId', as: 'slots' });

export default School;
