import { Router } from 'express';
import {
    createSchoolAdmin, createSchool, getAllSchools, getAllUsers, createUser,
    updateSchool, deleteSchool, deleteUser,
    getGlobalStats, getParents, resetUserPassword, getAllBookings
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect all routes with authMiddleware
// TODO: Add strict role check middleware (e.g. requireSuperAdmin)
router.use(authMiddleware.verifyToken);

router.post('/create-school-admin', createSchoolAdmin);
router.post('/create-school', createSchool);
router.put('/school/:id', updateSchool);
router.delete('/school/:id', deleteSchool);
router.delete('/user/:id', deleteUser);
router.get('/schools', getAllSchools);
router.post('/create-user', createUser);
router.get('/users', getAllUsers);

// Super Admin Enhanced
router.get('/stats', getGlobalStats);
router.get('/parents', getParents);
router.post('/reset-password', resetUserPassword);
router.get('/bookings', getAllBookings);

export default router;
