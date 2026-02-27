import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Booking from '../models/Booking';
import School from '../models/School';
import Service from '../models/Service';
import Parent from '../models/Parent';
import { v4 as uuidv4 } from 'uuid';
import Child from '../models/Child';
import SchoolSlot from '../models/SchoolSlot';
import Review from '../models/Review';
import SchoolSlotPrice from '../models/SchoolSlotPrice';

export const createBooking = async (req: Request, res: Response) => {
    try {
        console.log('Create Booking Request Payload:', req.body);
        const { userId, schoolId, serviceId, date, childId, slotId } = req.body;

        if (!userId || !schoolId || !serviceId || !date || !childId) {
            return res.status(400).json({ error: 'Missing required fields: userId, schoolId, serviceId, date, or childId' });
        }

        // 1. Get Parent ID from User ID
        const parent = await Parent.findOne({ where: { userId } });
        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        // 1a. Validate Child
        let targetChildId = childId;
        // Verify the child belongs to this parent
        const child = await Child.findOne({ where: { id: targetChildId, parentId: parent.id } });
        if (!child) {
            return res.status(404).json({ error: 'Child not found or does not belong to this parent.' });
        }

        // 1b. Get Service to calculate amount
        const service = await Service.findByPk(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // 2. Validate Date
        const bookingDate = new Date(date);
        // Ensure the date is valid
        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part

        // Allow booking for today as well
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30); // Extended to 30 days just in case, or keep 20

        if (bookingDate < today) {
            return res.status(400).json({ error: 'Cannot book for past dates.' });
        }
        if (bookingDate > maxDate) {
            return res.status(400).json({ error: 'Booking date must be within the next 30 days' });
        }

        // 2a. Avoid Duplicate Bookings (One per parent per day across all schools)
        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBooking = await Booking.findOne({
            where: {
                parentId: parent.id,
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: { [Op.not]: 'cancelled' }
            }
        });

        if (existingBooking) {
            return res.status(400).json({
                error: 'Duplicate Booking',
                message: 'Duplicate booking not allowed. You already made the booking'
            });
        }

        // 3. Validate Slot and Check Availability
        let slotAmount = service.cost; // Default: base service cost

        if (slotId) {
            const slot = await SchoolSlot.findByPk(slotId);
            if (!slot) {
                return res.status(404).json({ error: 'Selected slot not found' });
            }

            // ── Look up price from school_slot_prices ──────────────────────
            // Priority: service-specific price > global slot price (serviceId IS NULL)
            const slotPrice = await SchoolSlotPrice.findOne({
                where: {
                    schoolId,
                    slotName: slot.slotName,
                    serviceId,   // service-specific price first
                }
            }) || await SchoolSlotPrice.findOne({
                where: {
                    schoolId,
                    slotName: slot.slotName,
                    serviceId: null, // global default for the slot
                }
            });

            if (slotPrice) {
                slotAmount = Number(slotPrice.price);
            }
            // else: keep service.cost as fallback

            // ── Capacity check ─────────────────────────────────────────────
            const bookingsCount = await Booking.count({
                where: {
                    schoolId,
                    date: bookingDate,
                    slotId,
                    status: { [Op.not]: 'cancelled' }
                }
            });

            if (bookingsCount >= slot.capacity) {
                return res.status(409).json({ error: 'Slot is fully booked.' });
            }
        }

        // 4. Generate Confirmation Number
        const confirmationNo = `BK-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

        // 5. Create Booking with correct slot price
        const booking = await Booking.create({
            parentId: parent.id,
            schoolId,
            serviceId,
            childId: targetChildId,
            amount: slotAmount,   // ← from school_slot_prices (or service.cost fallback)
            date: bookingDate,
            status: 'booked',
            bookingIdStr: confirmationNo,
            slotId: slotId || null
        });

        console.log('Booking created successfully:', booking.toJSON());
        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking creation failed:', error);
        // @ts-ignore
        if (error.errors) {
            // @ts-ignore
            error.errors.forEach(e => console.error('Validation Error:', e.message));
        }
        res.status(500).json({ error: 'Failed to create booking. Please check server logs.' });
    }
};

export const getMyBookings = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        console.log(`[DEBUG] getMyBookings: Fetching for userId ${userId}`);

        const parent = await Parent.findOne({ where: { userId } });
        if (!parent) {
            console.log(`[DEBUG] getMyBookings: No parent profile found for userId ${userId}`);
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        console.log(`[DEBUG] getMyBookings: Found parentId ${parent.id} for userId ${userId}`);

        const bookings = await Booking.findAll({
            where: { parentId: parent.id },
            include: [
                { model: School, as: 'school', attributes: ['name', 'image1', 'city'] },
                { model: Service, as: 'service', attributes: ['name', 'cost'] },
                {
                    model: SchoolSlot,
                    as: 'slot',
                    attributes: ['startTime', 'endTime', 'slotName'],
                },
                { model: Review, as: 'review' }
            ],
            order: [['date', 'ASC']]
        });

        // ── Enrich each booking with the correct slot price ─────────────────
        // The `amount` stored on the booking IS the correct price (set at creation).
        // But if old bookings were created before the slot-price fix, we re-resolve
        // it here so the app always shows the right figure.
        const enriched = await Promise.all(
            bookings.map(async (b) => {
                const raw = b.toJSON() as any;

                if (b.slotId) {
                    // Look up the slot price for this booking's service + slot
                    const slot = (raw as any).slot;
                    if (slot?.slotName) {
                        const slotPrice = await SchoolSlotPrice.findOne({
                            where: {
                                schoolId: b.schoolId,
                                slotName: slot.slotName,
                                serviceId: b.serviceId,
                            }
                        }) || await SchoolSlotPrice.findOne({
                            where: {
                                schoolId: b.schoolId,
                                slotName: slot.slotName,
                                serviceId: null,
                            }
                        });

                        if (slotPrice) {
                            raw.amount = Number(slotPrice.price); // override with slot price
                        }
                    }
                }
                return raw;
            })
        );

        console.log(`[DEBUG] getMyBookings: Returning ${enriched.length} bookings for parentId ${parent.id}`);
        res.status(200).json(enriched);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const booking = await Booking.findByPk(Number(id));

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        // Validate Cancellation Policy: Can only delete future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(booking.date);

        if (bookingDate <= today) {
            return res.status(400).json({ error: 'Cannot cancel current or past bookings' });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = cancellationReason || 'No reason provided';
        await booking.save();

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const booking = await Booking.findByPk(Number(id));
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.status = status;
        if (reason) {
            booking.cancellationReason = reason;
        }

        await booking.save();

        res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error('Failed to update booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
};
