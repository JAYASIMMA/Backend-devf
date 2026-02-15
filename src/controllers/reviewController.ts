import { Request, Response } from 'express';
import Parent from '../models/Parent';
import Review from '../models/Review';
import Booking from '../models/Booking';
import School from '../models/School';

export const createReview = async (req: Request, res: Response) => {
    try {
        const { schoolId, parentId: userId, bookingId, rating, comment } = req.body;

        // Parent profile identification: frontend sends 'userId' as 'parentId'
        const parent = await Parent.findOne({ where: { userId } });
        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        // 1. Validate Booking
        const booking = await Booking.findByPk(Number(bookingId));
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.parentId !== parent.id) {
            return res.status(403).json({ message: 'Unauthorized to review this booking' });
        }

        // Allow reviews for 'completed' bookings OR 'booked' bookings that are in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        const isPast = bookingDate < today;

        if (booking.status !== 'completed' && !(booking.status === 'booked' && isPast)) {
            return res.status(400).json({ message: 'Only completed or past sessions can be reviewed' });
        }

        // 2. Check for duplicate review
        const existingReview = await Review.findOne({ where: { bookingId: Number(bookingId) } });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already submitted for this booking' });
        }

        // 3. Create Review
        const review = await Review.create({
            schoolId,
            parentId: parent.id,
            bookingId,
            rating,
            comment
        });

        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    } catch (error: any) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getSchoolReviews = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const reviews = await Review.findAll({
            where: { schoolId },
            include: [
                {
                    model: Booking,
                    as: 'booking',
                    attributes: ['id', 'date', 'bookingIdStr']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(reviews);
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
