import { Request, Response } from 'express';
import sequelize from '../config/database';
import User from '../models/user';
import Booking from '../models/Booking';
import Parent from '../models/Parent';
import Service from '../models/Service';
import School from '../models/School';
import SuperAdmin from '../models/SuperAdmin';

import bcrypt from 'bcryptjs';

// Create a School Admin (User)
export const createSchoolAdmin = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { mobileNumber, password, username, email, schoolId } = req.body;

        // Check availability
        const existing = await User.findOne({ where: { mobileNumber } });
        if (existing) {
            await t.rollback();
            return res.status(400).json({ message: 'Mobile number already used.' });
        }

        // Check against School Phone Number
        if (schoolId) {
            const school = await School.findByPk(schoolId);
            if (school && school.schoolNumber === mobileNumber) {
                await t.rollback();
                return res.status(400).json({ message: 'School Admin mobile number cannot be the same as the School Phone Number.' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const newAdmin = await User.create({
            mobileNumber,
            password: hashedPassword,
            username: username || 'School Admin',
            email,
            role: 'school_admin',
            schoolId // Link to school
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: 'School Admin created successfully.', admin: newAdmin });
    } catch (error: any) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// Create a School
export const createSchool = async (req: Request, res: Response) => {
    try {
        const { name, address, city, description, schoolNumber, logoUrl, principalPhoto, image1, image2, image3, image4, image5, image6, image7, image8, image9, image10 } = req.body;

        const newSchool = await School.create({
            name,
            address,
            city,
            description,
            schoolNumber,
            logoUrl,
            principalPhoto,
            image1, image2, image3, image4, image5,
            image6, image7, image8, image9, image10
        });

        // Initialize default time slots for the school - REMOVED as slots now require serviceId and services are added later
        // await initializeDefaultSlots(newSchool.id);

        res.status(201).json({ message: 'School created successfully.', school: newSchool });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Schools
export const getAllSchools = async (req: Request, res: Response) => {
    try {
        const schools = await School.findAll();
        res.status(200).json(schools);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update School
export const updateSchool = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, address, city, description, schoolNumber, logoUrl, principalPhoto, image1, image2, image3, image4, image5, image6, image7, image8, image9, image10 } = req.body;

        await School.update({ name, address, city, description, schoolNumber, logoUrl, principalPhoto, image1, image2, image3, image4, image5, image6, image7, image8, image9, image10 }, { where: { id } });
        res.status(200).json({ message: 'School updated successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete School
export const deleteSchool = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await School.destroy({ where: { id } });
        res.status(200).json({ message: 'School deleted successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await User.destroy({ where: { id } });
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create Generic User
export const createUser = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { username, mobileNumber, email, password, role, schoolId } = req.body;

        // Check availability
        const existing = await User.findOne({ where: { mobileNumber } });
        if (existing) {
            await t.rollback();
            return res.status(400).json({ message: 'Mobile number already used.' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = await User.create({
            mobileNumber,
            password: hashedPassword,
            username,
            email,
            role,
            schoolId: role === 'school_admin' ? schoolId : null
        }, { transaction: t });

        // If Parent, create empty Parent profile to prevent errors in other parts of the app
        if (role === 'parent') {
            await Parent.create({
                userId: newUser.id,
                fatherName: username, // Default to username
                motherName: '',
                email,
                primaryContact: mobileNumber,
                address: '',
                location: ''
            }, { transaction: t });
        }

        // If Super Admin, create SuperAdmin profile
        if (role === 'super_admin') {
            await SuperAdmin.create({
                userId: newUser.id,
                fullName: username || 'Admin User',
                email,
                phoneNumber: mobileNumber,
                isActive: true
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error: any) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// Get All Users (for management)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- Super Admin Features ---

export const getGlobalStats = async (req: Request, res: Response) => {
    try {
        const parentsCount = await User.count({ where: { role: 'parent' } });
        const schoolsCount = await School.count();
        const totalRevenue = await Booking.sum('amount', { where: { status: 'completed' } });

        res.json({
            parentsCount,
            schoolsCount,
            totalRevenue: totalRevenue || 0
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getParents = async (req: Request, res: Response) => {
    try {
        const parents = await User.findAll({
            where: { role: 'parent' },
            attributes: { exclude: ['password'] }
        });
        res.json(parents);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const { userId, newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await User.update({ password: hashedPassword }, { where: { id: userId } });
        res.json({ message: 'Password reset successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: School, as: 'school', attributes: ['name'] },
                { model: Parent, as: 'parent', attributes: ['fatherName'] },
                { model: Service, as: 'service', attributes: ['name'] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
