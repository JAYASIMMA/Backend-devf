import { Router } from 'express';
import {
    // Super Admin Management
    createSuperAdmin,
    getAllSuperAdmins,
    getSuperAdminById,
    updateSuperAdmin,
    deleteSuperAdmin,

    // School Admin Management
    createSchoolAdminNew,
    getAllSchoolAdmins,
    getSchoolAdminById,
    updateSchoolAdmin,
    deleteSchoolAdmin,

    // Utility
    updateLastLogin
} from '../controllers/adminManagementController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect all routes with authentication
router.use(authMiddleware.verifyToken);

// ==================== SUPER ADMIN ROUTES ====================
// Note: In production, add role-based middleware to restrict these to super_admin only

/**
 * Create a new Super Admin
 * POST /api/admin-management/super-admin/create
 * Body: { fullName, email, phoneNumber, password, department?, permissions?, profilePhoto?, notes? }
 */
router.post('/super-admin/create', createSuperAdmin);

/**
 * Get all Super Admins
 * GET /api/admin-management/super-admin/list
 */
router.get('/super-admin/list', getAllSuperAdmins);

/**
 * Get Super Admin by ID
 * GET /api/admin-management/super-admin/:id
 */
router.get('/super-admin/:id', getSuperAdminById);

/**
 * Update Super Admin
 * PUT /api/admin-management/super-admin/:id
 * Body: { fullName?, email?, phoneNumber?, department?, permissions?, isActive?, profilePhoto?, notes? }
 */
router.put('/super-admin/:id', updateSuperAdmin);

/**
 * Delete Super Admin
 * DELETE /api/admin-management/super-admin/:id
 */
router.delete('/super-admin/:id', deleteSuperAdmin);

// ==================== SCHOOL ADMIN ROUTES ====================

/**
 * Create a new School Admin
 * POST /api/admin-management/school-admin/create
 * Body: { schoolId, fullName, email, phoneNumber, password, designation?, permissions?, profilePhoto?, joiningDate?, notes? }
 */
router.post('/school-admin/create', createSchoolAdminNew);

/**
 * Get all School Admins (optionally filter by schoolId)
 * GET /api/admin-management/school-admin/list?schoolId=123
 */
router.get('/school-admin/list', getAllSchoolAdmins);

/**
 * Get School Admin by ID
 * GET /api/admin-management/school-admin/:id
 */
router.get('/school-admin/:id', getSchoolAdminById);

/**
 * Update School Admin
 * PUT /api/admin-management/school-admin/:id
 * Body: { fullName?, email?, phoneNumber?, designation?, permissions?, isActive?, profilePhoto?, notes? }
 */
router.put('/school-admin/:id', updateSchoolAdmin);

/**
 * Delete School Admin
 * DELETE /api/admin-management/school-admin/:id
 */
router.delete('/school-admin/:id', deleteSchoolAdmin);

// ==================== UTILITY ROUTES ====================

/**
 * Update last login timestamp
 * POST /api/admin-management/update-last-login
 * Body: { userId, role }
 */
router.post('/update-last-login', updateLastLogin);

export default router;
