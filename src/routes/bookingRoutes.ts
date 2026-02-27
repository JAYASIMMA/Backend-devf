import { Router } from 'express';
import { createBooking, getMyBookings, deleteBooking, updateBookingStatus } from '../controllers/bookingController';

const router = Router();

router.post('/', createBooking);
router.get('/user/:userId', getMyBookings);
router.delete('/:id', deleteBooking);
router.put('/:id/status', updateBookingStatus);

export default router;
