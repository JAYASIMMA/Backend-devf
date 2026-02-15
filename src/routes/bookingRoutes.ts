import { Router } from 'express';
import { createBooking, getMyBookings, deleteBooking } from '../controllers/bookingController';

const router = Router();

router.post('/', createBooking);
router.get('/user/:userId', getMyBookings);
router.delete('/:id', deleteBooking);

export default router;
