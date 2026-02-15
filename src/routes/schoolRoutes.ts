import { Router } from 'express';
import {
    getAllSchools, getSchoolStats, getBookingDetails, getSchoolBookings,
    getServices, createService, updateService, deleteService,
    getBlockedDates, blockDate, unblockDate, getRevenue,
    getSchoolProfile, updateSchoolProfile, updateSchoolLocation,
    uploadSchoolImage,
    getSchoolSlots, createSchoolSlot, updateSchoolSlot, deleteSchoolSlot,
    getSlotAvailability, updateSlotAvailability,
    getSchoolSlotPrices, updateSchoolSlotPrices
} from '../controllers/schoolController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public / Parent
router.get('/', getAllSchools);
router.get('/search', getAllSchools);

// School Profile (for school admin)
router.get('/:schoolId/profile', getSchoolProfile);
router.put('/:schoolId/profile', authMiddleware.verifyToken, updateSchoolProfile);
router.post('/:schoolId/upload', authMiddleware.verifyToken, upload.single('image'), uploadSchoolImage);
router.put('/:schoolId/location', authMiddleware.verifyToken, updateSchoolLocation);

// Stats
router.get('/:schoolId/stats', getSchoolStats);
router.get('/:schoolId/bookings', getSchoolBookings);
router.get('/booking/:id', getBookingDetails);

// Services
router.get('/:schoolId/services', getServices);
router.post('/:schoolId/service', authMiddleware.verifyToken, createService);
router.put('/service/:id', authMiddleware.verifyToken, updateService);
router.delete('/service/:id', authMiddleware.verifyToken, deleteService);

// Slots
router.get('/:schoolId/slots', getSchoolSlots);
router.post('/:schoolId/slots', authMiddleware.verifyToken, createSchoolSlot);
router.put('/slots/:slotId', authMiddleware.verifyToken, updateSchoolSlot);
router.delete('/slots/:slotId', authMiddleware.verifyToken, deleteSchoolSlot);
router.get('/:schoolId/slots/availability', getSlotAvailability);
router.put('/:schoolId/slots/availability', authMiddleware.verifyToken, updateSlotAvailability);
router.get('/:schoolId/slot-prices', getSchoolSlotPrices);
router.post('/:schoolId/slot-prices', authMiddleware.verifyToken, updateSchoolSlotPrices);

// Schedule
router.get('/:schoolId/schedule', getBlockedDates);
router.post('/schedule/block', authMiddleware.verifyToken, blockDate);
router.delete('/:schoolId/schedule/:id', authMiddleware.verifyToken, unblockDate);

// Revenue
router.get('/:schoolId/revenue', getRevenue);

export default router;
