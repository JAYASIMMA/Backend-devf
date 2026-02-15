import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import SuperAdmin from '../models/SuperAdmin';
import SchoolAdmin from '../models/SchoolAdmin';
import School from '../models/School';

// ==================== SUPER ADMIN MANAGEMENT ====================

/**
 * Create a new Super Admin
 * POST /api/admin/super-admin/create
 */
export const createSuperAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            fullName,
            email,
            phoneNumber,
            password,
            department,
            permissions,
            profilePhoto,
            notes
        } = req.body;

        // Validate required fields
        if (!fullName || !email || !phoneNumber || !password) {
            res.status(400).json({ error: 'Missing required fields: fullName, email, phoneNumber, password' });
            return;
        }

        // Check if email or phone already exists
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User with super_admin role
        const user = await User.create({
            email,
            mobileNumber: phoneNumber,
            password: hashedPassword,
            role: 'super_admin',
            isFirstLogin: true
        });

        // Create SuperAdmin profile
        const superAdmin = await SuperAdmin.create({
            userId: user.id,
            fullName,
            email,
            phoneNumber,
            department: department || null,
            permissions: permissions || [
                'manage_schools',
                'manage_school_admins',
                'manage_super_admins',
                'view_analytics',
                'manage_bookings',
                'manage_parents',
                'system_settings'
            ],
            isActive: true,
            profilePhoto: profilePhoto || null,
            notes: notes || null
        });

        res.status(201).json({
            message: 'Super Admin created successfully',
            superAdmin: {
                id: superAdmin.id,
                userId: user.id,
                fullName: superAdmin.fullName,
                email: superAdmin.email,
                phoneNumber: superAdmin.phoneNumber,
                department: superAdmin.department,
                permissions: superAdmin.permissions,
                isActive: superAdmin.isActive
            }
        });
    } catch (error: any) {
        console.error('Error creating super admin:', error);
        res.status(500).json({ error: 'Failed to create super admin', details: error.message });
    }
};

/**
 * Get all Super Admins
 * GET /api/admin/super-admin/list
 */
export const getAllSuperAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const superAdmins = await SuperAdmin.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'mobileNumber', 'role', 'isFirstLogin', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            count: superAdmins.length,
            superAdmins
        });
    } catch (error: any) {
        console.error('Error fetching super admins:', error);
        res.status(500).json({ error: 'Failed to fetch super admins', details: error.message });
    }
};

/**
 * Get Super Admin by ID
 * GET /api/admin/super-admin/:id
 */
export const getSuperAdminById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const superAdmin = await SuperAdmin.findByPk(Number(id), {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'mobileNumber', 'role', 'isFirstLogin', 'createdAt']
                }
            ]
        });

        if (!superAdmin) {
            res.status(404).json({ error: 'Super Admin not found' });
            return;
        }

        res.status(200).json({ superAdmin });
    } catch (error: any) {
        console.error('Error fetching super admin:', error);
        res.status(500).json({ error: 'Failed to fetch super admin', details: error.message });
    }
};

/**
 * Update Super Admin
 * PUT /api/admin/super-admin/:id
 */
export const updateSuperAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            fullName,
            email,
            phoneNumber,
            department,
            permissions,
            isActive,
            profilePhoto,
            notes
        } = req.body;

        const superAdmin = await SuperAdmin.findByPk(Number(id));

        if (!superAdmin) {
            res.status(404).json({ error: 'Super Admin not found' });
            return;
        }

        // Update fields
        if (fullName) superAdmin.fullName = fullName;
        if (email) superAdmin.email = email;
        if (phoneNumber) superAdmin.phoneNumber = phoneNumber;
        if (department !== undefined) superAdmin.department = department;
        if (permissions) superAdmin.permissions = permissions;
        if (isActive !== undefined) superAdmin.isActive = isActive;
        if (profilePhoto !== undefined) superAdmin.profilePhoto = profilePhoto;
        if (notes !== undefined) superAdmin.notes = notes;

        await superAdmin.save();

        res.status(200).json({
            message: 'Super Admin updated successfully',
            superAdmin
        });
    } catch (error: any) {
        console.error('Error updating super admin:', error);
        res.status(500).json({ error: 'Failed to update super admin', details: error.message });
    }
};

/**
 * Delete Super Admin
 * DELETE /api/admin/super-admin/:id
 */
export const deleteSuperAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const superAdmin = await SuperAdmin.findByPk(Number(id));

        if (!superAdmin) {
            res.status(404).json({ error: 'Super Admin not found' });
            return;
        }

        // Delete associated user (cascade will delete SuperAdmin)
        await User.destroy({ where: { id: superAdmin.userId } });

        res.status(200).json({ message: 'Super Admin deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting super admin:', error);
        res.status(500).json({ error: 'Failed to delete super admin', details: error.message });
    }
};

// ==================== SCHOOL ADMIN MANAGEMENT ====================

/**
 * Create a new School Admin
 * POST /api/admin/school-admin/create
 */
export const createSchoolAdminNew = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            schoolId,
            fullName,
            email,
            phoneNumber,
            password,
            designation,
            permissions,
            profilePhoto,
            joiningDate,
            notes
        } = req.body;

        // Validate required fields
        if (!schoolId || !fullName || !email || !phoneNumber || !password) {
            res.status(400).json({
                error: 'Missing required fields: schoolId, fullName, email, phoneNumber, password'
            });
            return;
        }

        // Check if school exists
        const school = await School.findByPk(schoolId);
        if (!school) {
            res.status(404).json({ error: 'School not found' });
            return;
        }

        // Check if school already has an admin
        const existingSchoolAdmin = await SchoolAdmin.findOne({ where: { schoolId } });
        if (existingSchoolAdmin) {
            res.status(400).json({ error: 'This school already has an admin assigned. Only one admin per school is allowed.' });
            return;
        }

        // Check if email or phone already exists
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Username: First Name (trimmed) + Last 4 digits of phone
        // e.g., "John Doe" + "9876543210" -> "John3210"
        const cleanName = fullName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
        const phoneSuffix = phoneNumber.slice(-4);
        const generatedUsername = `${cleanName}${phoneSuffix}`;

        // Create User with school_admin role
        const user = await User.create({
            email,
            mobileNumber: phoneNumber,
            password: hashedPassword,
            role: 'school_admin',
            schoolId: schoolId,
            isFirstLogin: true,
            username: generatedUsername
        });

        // Create SchoolAdmin profile
        const schoolAdmin = await SchoolAdmin.create({
            userId: user.id,
            schoolId,
            fullName,
            email,
            phoneNumber,
            designation: designation || 'Administrator',
            permissions: permissions || [
                'manage_school_details',
                'manage_services',
                'manage_schedules',
                'view_bookings',
                'manage_slots',
                'view_analytics'
            ],
            isActive: true,
            profilePhoto: profilePhoto || null,
            joiningDate: joiningDate || new Date(),
            notes: notes || null
        });

        res.status(201).json({
            message: 'School Admin created successfully',
            schoolAdmin: {
                id: schoolAdmin.id,
                userId: user.id,
                schoolId: schoolAdmin.schoolId,
                fullName: schoolAdmin.fullName,
                email: schoolAdmin.email,
                phoneNumber: schoolAdmin.phoneNumber,
                designation: schoolAdmin.designation,
                permissions: schoolAdmin.permissions,
                isActive: schoolAdmin.isActive
            }
        });
    } catch (error: any) {
        console.error('Error creating school admin:', error);
        res.status(500).json({ error: 'Failed to create school admin', details: error.message });
    }
};

/**
 * Get all School Admins (optionally filter by schoolId)
 * GET /api/admin/school-admin/list?schoolId=123
 */
export const getAllSchoolAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { schoolId } = req.query;

        const whereClause: any = {};
        if (schoolId) {
            whereClause.schoolId = schoolId;
        }

        const schoolAdmins = await SchoolAdmin.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'mobileNumber', 'role', 'isFirstLogin', 'createdAt']
                },
                {
                    model: School,
                    as: 'school',
                    attributes: ['id', 'name', 'city', 'address']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            count: schoolAdmins.length,
            schoolAdmins
        });
    } catch (error: any) {
        console.error('Error fetching school admins:', error);
        res.status(500).json({ error: 'Failed to fetch school admins', details: error.message });
    }
};

/**
 * Get School Admin by ID
 * GET /api/admin/school-admin/:id
 */
export const getSchoolAdminById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const schoolAdmin = await SchoolAdmin.findByPk(Number(id), {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'mobileNumber', 'role', 'isFirstLogin', 'createdAt']
                },
                {
                    model: School,
                    as: 'school',
                    attributes: ['id', 'name', 'city', 'address', 'logoUrl']
                }
            ]
        });

        if (!schoolAdmin) {
            res.status(404).json({ error: 'School Admin not found' });
            return;
        }

        res.status(200).json({ schoolAdmin });
    } catch (error: any) {
        console.error('Error fetching school admin:', error);
        res.status(500).json({ error: 'Failed to fetch school admin', details: error.message });
    }
};

/**
 * Update School Admin
 * PUT /api/admin/school-admin/:id
 */
export const updateSchoolAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            fullName,
            email,
            phoneNumber,
            designation,
            permissions,
            isActive,
            profilePhoto,
            notes
        } = req.body;

        const schoolAdmin = await SchoolAdmin.findByPk(Number(id));

        if (!schoolAdmin) {
            res.status(404).json({ error: 'School Admin not found' });
            return;
        }

        // Update fields
        if (fullName) schoolAdmin.fullName = fullName;
        if (email) schoolAdmin.email = email;
        if (phoneNumber) schoolAdmin.phoneNumber = phoneNumber;
        if (designation !== undefined) schoolAdmin.designation = designation;
        if (permissions) schoolAdmin.permissions = permissions;
        if (isActive !== undefined) schoolAdmin.isActive = isActive;
        if (profilePhoto !== undefined) schoolAdmin.profilePhoto = profilePhoto;
        if (notes !== undefined) schoolAdmin.notes = notes;

        await schoolAdmin.save();

        res.status(200).json({
            message: 'School Admin updated successfully',
            schoolAdmin
        });
    } catch (error: any) {
        console.error('Error updating school admin:', error);
        res.status(500).json({ error: 'Failed to update school admin', details: error.message });
    }
};

/**
 * Delete School Admin
 * DELETE /api/admin/school-admin/:id
 */
export const deleteSchoolAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const schoolAdmin = await SchoolAdmin.findByPk(Number(id));

        if (!schoolAdmin) {
            res.status(404).json({ error: 'School Admin not found' });
            return;
        }

        // Delete associated user (cascade will delete SchoolAdmin)
        await User.destroy({ where: { id: schoolAdmin.userId } });

        res.status(200).json({ message: 'School Admin deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting school admin:', error);
        res.status(500).json({ error: 'Failed to delete school admin', details: error.message });
    }
};

/**
 * Update last login timestamp
 * POST /api/admin/update-last-login
 */
export const updateLastLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.body;

        if (!userId || !role) {
            res.status(400).json({ error: 'Missing userId or role' });
            return;
        }

        if (role === 'super_admin') {
            const superAdmin = await SuperAdmin.findOne({ where: { userId } });
            if (superAdmin) {
                superAdmin.lastLogin = new Date();
                await superAdmin.save();
            }
        } else if (role === 'school_admin') {
            const schoolAdmin = await SchoolAdmin.findOne({ where: { userId } });
            if (schoolAdmin) {
                schoolAdmin.lastLogin = new Date();
                await schoolAdmin.save();
            }
        }

        res.status(200).json({ message: 'Last login updated successfully' });
    } catch (error: any) {
        console.error('Error updating last login:', error);
        res.status(500).json({ error: 'Failed to update last login', details: error.message });
    }
};
