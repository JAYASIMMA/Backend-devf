import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database';
import User from '../models/user';
import Parent from '../models/Parent';
import Child from '../models/Child';

export const signup = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const {
            mobileNumber,
            password,
            fatherName,
            motherName,
            guardianName,
            primaryContact,
            alternateContact,
            email,
            address,
            location,
            state,
            pincode,
            children
        } = req.body;

        const existingUser = await User.findOne({ where: { mobileNumber } });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ message: 'Mobile number already registered!' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        // 1. Create User
        const newUser = await User.create({
            mobileNumber,
            password: hashedPassword,
            role: 'parent',
            username: fatherName // default username
        }, { transaction: t });

        // 2. Create Parent Profile
        const newParent = await Parent.create({
            userId: newUser.id,
            fatherName,
            motherName,
            guardianName,
            primaryContact,
            alternateContact,
            email,
            address,
            location,
            state,
            pincode
        }, { transaction: t });

        // 3. Create Children
        const createdChildren = [];
        if (children && Array.isArray(children)) {
            for (const childData of children) {
                const newChild = await Child.create({
                    parentId: newParent.id,
                    name: childData.name,
                    age: childData.age,
                    dob: childData.dob,
                    gender: childData.gender,
                    disabilityType: childData.disabilityType,
                    disabilityPercent: childData.disabilityPercent,
                    aadharNumber: childData.aadharNumber,
                    uuid: childData.uuid,
                    schoolName: childData.schoolName,
                    schoolAddress: childData.schoolAddress,
                    schoolContactPerson: childData.schoolContactPerson,
                    schoolContactNumber: childData.schoolContactNumber
                }, { transaction: t });
                createdChildren.push(newChild);
            }
        }
        await t.commit();
        res.status(201).json({
            message: 'Parent registered successfully!',
            user: newUser,
            parent: newParent,
            children: createdChildren
        });
    } catch (error: any) {
        console.error('Signup Error:', error);
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { mobileNumber, username, password } = req.body;

        let user;
        if (mobileNumber) {
            user = await User.findOne({ where: { mobileNumber } });
        } else if (username) {
            user = await User.findOne({ where: { username } });
        } else {
            return res.status(400).json({ message: 'Mobile number or Username is required.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({
                accessToken: null,
                message: 'Invalid Password!',
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: 86400 } // 24 hours
        );

        res.status(200).json({
            id: user.id,
            username: user.username,
            mobileNumber: user.mobileNumber,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            accessToken: token,
            requirePasswordReset: user.isFirstLogin
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id; // From authMiddleware
        const { username, email, mobileNumber } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Optional: Check unique mobile/email if changed
        if (mobileNumber && mobileNumber !== user.mobileNumber) {
            const existing = await User.findOne({ where: { mobileNumber } });
            if (existing) return res.status(400).json({ message: 'Mobile number already taken.' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.mobileNumber = mobileNumber || user.mobileNumber;

        await user.save();

        res.json({ message: 'Profile updated successfully.', user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const passwordIsValid = await bcrypt.compare(currentPassword, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid current password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 8);
        user.password = hashedPassword;
        user.isFirstLogin = false;
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { mobileNumber, childAadharNumber, newPassword } = req.body;

        const user = await User.findOne({ where: { mobileNumber } });
        if (!user) {
            return res.status(404).json({ message: 'User with this mobile number not found.' });
        }

        const parent = await Parent.findOne({ where: { userId: user.id } });
        if (!parent) {
            return res.status(404).json({ message: 'Parent profile not found.' });
        }

        const child = await Child.findOne({
            where: {
                parentId: parent.id,
                aadharNumber: childAadharNumber
            }
        });

        if (!child) {
            return res.status(400).json({ message: 'Child Aadhar number does not match record.' });
        }

        // Reset Password
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const userId = (req as any).user.id; // From authMiddleware

        // 1. Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found.' });
        }

        // 2. Find Parent profile
        const parent = await Parent.findOne({ where: { userId } });

        if (parent) {
            // 3. Delete Children (Cascade usually handles this, but explicit is safer without cascade content)
            await Child.destroy({ where: { parentId: parent.id }, transaction: t });

            // 4. Delete Parent
            await parent.destroy({ transaction: t });
        }

        // 5. Delete User
        await user.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Account deleted successfully.' });

    } catch (error: any) {
        await t.rollback();
        console.error('Delete Account Error:', error);
        res.status(500).json({ message: error.message });
    }
};
