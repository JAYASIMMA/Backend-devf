import { Request, Response } from 'express';
import sequelize from '../config/database';
import School from '../models/School';
import Service from '../models/Service';
import Booking from '../models/Booking';
import SchoolSchedule from '../models/SchoolSchedule';
import SchoolSlot from '../models/SchoolSlot';
import SlotOverride from '../models/SlotOverride';
import Parent from '../models/Parent';
import Child from '../models/Child';
import SchoolSlotPrice from '../models/SchoolSlotPrice';
import { Op } from 'sequelize';

// --- Dashboard Stats ---

export const getAllSchools = async (req: Request, res: Response) => {
    try {
        const { name, location, serviceName } = req.query as { [key: string]: string };
        const whereClause: any = {};

        if (name) {
            whereClause.name = { [Op.iLike]: `%${name}%` };
        }
        if (location) {
            whereClause[Op.or] = [
                { city: { [Op.iLike]: `%${location}%` } },
                { address: { [Op.iLike]: `%${location}%` } }
            ];
        }

        const include: any[] = [{ model: Service, as: 'services' }];

        // Only filter by service if provided (requires filtering the parent School based on nested association)
        // Sequelize simple include where might filter the services, not the schools, or exclude schools without the service.
        // For simple MVP: Fetch all and filter, or use required: true
        if (serviceName) {
            include[0].where = { name: { [Op.iLike]: `%${serviceName}%` } };
            include[0].required = true; // Only return schools that have this service
        }

        const schools = await School.findAll({
            where: whereClause,
            include: include
        });

        res.json(schools);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getSchoolStats = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { service, year, month, status } = req.query;

        const whereClause: any = { schoolId };

        // Service Filter
        if (service) {
            whereClause.serviceId = service;
        }

        // Status Filter
        if (status) {
            // Map frontend status 'upcoming' to DB status 'booked' if necessary, 
            // assuming 'booked' implies active/upcoming in this system's convention
            if (status === 'upcoming') {
                whereClause.status = 'booked';
            } else {
                whereClause.status = status;
            }
        }

        // Date Filter (Year & Month)
        if (year) {
            const targetYear = Number(year);
            let startDate = new Date(targetYear, 0, 1);
            let endDate = new Date(targetYear, 11, 31, 23, 59, 59);

            if (month) {
                const targetMonth = Number(month) - 1; // JS months are 0-11
                startDate = new Date(targetYear, targetMonth, 1);
                // Get last day of month
                endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
            }

            whereClause.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        // 1. Booking Stats (Grouped by Service)
        const bookings = await Booking.findAll({
            where: whereClause,
            include: [{ model: Service, as: 'service' }]
        });

        // Group by Service & Calculate Stats
        const chartData: any = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let upcomingCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;
        let totalRevenue = 0;

        bookings.forEach((b: any) => {
            const serviceName = b.service?.name || 'Unknown';
            if (!chartData[serviceName]) chartData[serviceName] = 0;
            // Only count active/completed bookings for the chart distribution? 
            // Or all? existing logic counted all. Let's keep counting all for service popularity.
            chartData[serviceName]++;

            if (b.status === 'booked' && new Date(b.date) >= today) {
                upcomingCount++;
            } else if (b.status === 'completed') {
                completedCount++;
                if (b.amount) {
                    totalRevenue += Number(b.amount);
                }
            } else if (b.status === 'cancelled') {
                cancelledCount++;
            }
        });

        const totalBookings = bookings.length;

        const formattedChartData = Object.keys(chartData).map(key => ({
            name: key,
            bookings: chartData[key]
        }));

        // 2. Summary Bookings (Top 5 upcoming)
        const summaryBookings = await Booking.findAll({
            where: {
                schoolId,
                date: { [Op.gte]: today },
                status: 'booked'
            },
            include: [
                { model: Parent, as: 'parent' },
                { model: Child, as: 'child' },
                { model: Service, as: 'service' }
            ],
            order: [['date', 'ASC']],
            limit: 5
        });

        res.json({
            chartData: formattedChartData,
            upcomingBookings: summaryBookings,
            totalBookings,
            upcomingCount,
            completedCount,
            cancelledCount,
            totalRevenue // Currency formatted in frontend
        });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getSchoolBookings = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const whereClause: any = { schoolId };

        if (status && status !== 'all') {
            if (status === 'upcoming') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                whereClause.status = 'booked';
                whereClause.date = { [Op.gte]: today };
            } else if (status === 'cancelled') {
                whereClause.status = 'cancelled';
            } else if (status === 'completed') {
                whereClause.status = 'completed';
            } else {
                whereClause.status = status;
            }
        }

        const { count, rows } = await Booking.findAndCountAll({
            where: whereClause,
            include: [
                { model: Parent, as: 'parent' },
                { model: Child, as: 'child' },
                { model: Service, as: 'service' },
                { model: SchoolSlot, as: 'slot' }
            ],
            order: status === 'upcoming' ? [['date', 'ASC']] : [['date', 'DESC']],
            limit: Number(limit),
            offset: offset
        });

        res.json({
            bookings: rows,
            total: count,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getBookingDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(Number(id), {
            include: [
                { model: Parent, as: 'parent' },
                { model: Child, as: 'child' },
                { model: Service, as: 'service' }
            ]
        });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Services Management ---

export const getServices = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const services = await Service.findAll({
            where: { schoolId },
            include: [
                {
                    model: SchoolSlot,
                    as: 'slots'
                },
                {
                    model: SchoolSlotPrice,
                    as: 'slotPrices'
                }
            ],
            order: [
                ['id', 'ASC'], // Order services by ID
                [{ model: SchoolSlot, as: 'slots' }, 'startTime', 'ASC'] // Order nested slots
            ]
        });
        res.json(services);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createService = async (req: Request, res: Response) => {
    try {
        const { schoolId, name, description, cost, duration, phoneNumber, advancedBookingEnabled } = req.body;
        const service = await Service.create({ schoolId, name, description, cost, duration: duration || 180, phoneNumber, advancedBookingEnabled });

        // Initialize default slots with time-range based names
        const defaultSlots = [
            { slotName: '9:00 AM - 12:00 PM', startTime: '09:00', endTime: '12:00', capacity: 10 },
            { slotName: '12:00 PM - 3:00 PM', startTime: '12:00', endTime: '15:00', capacity: 10 },
            { slotName: '3:00 PM - 6:00 PM', startTime: '15:00', endTime: '18:00', capacity: 10 },
            { slotName: '6:00 PM - 9:00 PM', startTime: '18:00', endTime: '21:00', capacity: 10 },
        ];

        for (const slot of defaultSlots) {
            await SchoolSlot.create({
                schoolId,
                serviceId: service.id,
                ...slot,
                isActive: true,
            });
        }

        const serviceWithSlots = await Service.findByPk(service.id, {
            include: [{ model: SchoolSlot, as: 'slots' }]
        });

        res.status(201).json(serviceWithSlots);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, cost, duration, phoneNumber, slotUpdates, advancedBookingEnabled } = req.body;

        // Cast id to number for findByPk, assuming primary key is numeric
        const serviceId = Number(id);
        const service = await Service.findByPk(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        await service.update({ name, description, cost, duration, phoneNumber, advancedBookingEnabled });

        // Update slots if provided
        if (slotUpdates && Array.isArray(slotUpdates)) {
            const defaultSlots = [
                { slotName: '9:00 AM - 12:00 PM', startTime: '09:00', endTime: '12:00', capacity: 10 },
                { slotName: '12:00 PM - 3:00 PM', startTime: '12:00', endTime: '15:00', capacity: 10 },
                { slotName: '3:00 PM - 6:00 PM', startTime: '15:00', endTime: '18:00', capacity: 10 },
                { slotName: '6:00 PM - 9:00 PM', startTime: '18:00', endTime: '21:00', capacity: 10 },
            ];

            for (const update of slotUpdates) {
                if (update.id) {
                    await SchoolSlot.update(
                        {
                            isActive: update.isActive
                        },
                        { where: { id: update.id, serviceId: id } }
                    );
                } else {
                    // Try to find by slotName if ID is missing (to avoid duplicates for existing services)
                    const slotInfo = defaultSlots.find(d => d.slotName === update.slotName);
                    if (slotInfo) {
                        const [slotRecord, created] = await SchoolSlot.findOrCreate({
                            where: { serviceId: id, slotName: update.slotName },
                            defaults: {
                                schoolId: service.schoolId,
                                serviceId: Number(id),
                                ...slotInfo,
                                isActive: update.isActive ?? true
                            }
                        });

                        if (!created) {
                            await slotRecord.update({
                                isActive: update.isActive ?? true
                            });
                        }
                    }
                }
            }
        }

        res.json({ message: 'Service updated' });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Service.destroy({ where: { id } });
        res.json({ message: 'Service deleted' });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Schedule Management ---

export const getBlockedDates = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const blocked = await SchoolSchedule.findAll({ where: { schoolId } });
        res.json(blocked);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const blockDate = async (req: Request, res: Response) => {
    try {
        const { schoolId, serviceId, blockedDate, reason } = req.body;

        // Check for existing bookings on this date
        const startOfDay = new Date(blockedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(blockedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const whereClause: any = {
            schoolId,
            status: 'booked',
            date: {
                [Op.gte]: startOfDay,
                [Op.lte]: endOfDay
            }
        };

        if (serviceId) {
            whereClause.serviceId = serviceId;
        }

        const bookingCount = await Booking.count({ where: whereClause });

        if (bookingCount > 0) {
            return res.status(400).json({ message: `Cannot block this date. There are ${bookingCount} active bookings.` });
        }

        const schedule = await SchoolSchedule.create({ schoolId, serviceId, blockedDate, reason });
        res.status(201).json(schedule);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const unblockDate = async (req: Request, res: Response) => {
    try {
        const { schoolId, id } = req.params;
        const result = await SchoolSchedule.destroy({ where: { id, schoolId } });

        if (result === 0) {
            return res.status(404).json({ message: 'Blocked date not found' });
        }

        res.json({ message: 'Date unblocked successfully' });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Revenue ---

export const getRevenue = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { service, year, month } = req.query;

        const whereClause: any = {
            schoolId,
            status: 'completed'
        };

        if (service) {
            whereClause.serviceId = service;
        }

        if (year) {
            const targetYear = Number(year);
            let startDate = new Date(targetYear, 0, 1);
            let endDate = new Date(targetYear, 11, 31, 23, 59, 59);

            if (month) {
                const targetMonth = Number(month) - 1;
                startDate = new Date(targetYear, targetMonth, 1);
                endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
            }

            whereClause.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const bookings = await Booking.findAll({
            where: whereClause,
            attributes: ['amount', 'date'],
            include: [{ model: Parent, as: 'parent', attributes: ['fatherName', 'motherName'] }]
        });

        // Process in JS
        const revenueByMonth: any = {};

        bookings.forEach((b: any) => {
            const date = new Date(b.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-M

            if (!revenueByMonth[monthKey]) {
                revenueByMonth[monthKey] = {
                    month: monthKey,
                    total: 0,
                    transactions: []
                };
            }

            revenueByMonth[monthKey].total += b.amount;
            revenueByMonth[monthKey].transactions.push(b);
        });

        // Fill in missing months if filtering by Year but not specific month
        if (year && !month) {
            for (let i = 1; i <= 12; i++) {
                const key = `${year}-${i}`;
                if (!revenueByMonth[key]) {
                    revenueByMonth[key] = {
                        month: key,
                        total: 0,
                        transactions: []
                    };
                }
            }
        }

        // Sort by date key part
        const sortedData = Object.values(revenueByMonth).sort((a: any, b: any) => {
            const [y1, m1] = a.month.split('-').map(Number);
            const [y2, m2] = b.month.split('-').map(Number);
            return y1 - y2 || m1 - m2;
        });

        res.json(sortedData);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- School Profile Management ---

export const getSchoolProfile = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;

        const school = await School.findByPk(Number(schoolId), {
            include: [{ model: Service, as: 'services' }]
        });

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.json(school);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateSchoolProfile = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const {
            name,
            tag,
            address,
            city,
            landmark,
            busStand,
            metroStation,
            latitude,
            longitude,
            description,
            achievements,
            amenities,
            servicesOffered,
            logoUrl,
            principalPhoto,
            image1, image2, image3, image4, image5,
            image6, image7, image8, image9, image10,
            schoolNumber
        } = req.body;

        const school = await School.findByPk(Number(schoolId));

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        await school.update({
            name: name || school.name,
            tag: tag !== undefined ? tag : school.tag,
            address: address || school.address,
            city: city || school.city,
            landmark: landmark !== undefined ? landmark : school.landmark,
            busStand: busStand !== undefined ? busStand : school.busStand,
            metroStation: metroStation !== undefined ? metroStation : school.metroStation,
            latitude: latitude !== undefined ? latitude : school.latitude,
            longitude: longitude !== undefined ? longitude : school.longitude,
            description: description !== undefined ? description : school.description,
            achievements: achievements !== undefined ? achievements : school.achievements,
            amenities: amenities !== undefined ? amenities : school.amenities,
            servicesOffered: servicesOffered !== undefined ? servicesOffered : school.servicesOffered,
            logoUrl: logoUrl !== undefined ? logoUrl : school.logoUrl,
            principalPhoto: principalPhoto !== undefined ? principalPhoto : school.principalPhoto,
            image1: image1 !== undefined ? image1 : school.image1,
            image2: image2 !== undefined ? image2 : school.image2,
            image3: image3 !== undefined ? image3 : school.image3,
            image4: image4 !== undefined ? image4 : school.image4,
            image5: image5 !== undefined ? image5 : school.image5,
            image6: image6 !== undefined ? image6 : school.image6,
            image7: image7 !== undefined ? image7 : school.image7,
            image8: image8 !== undefined ? image8 : school.image8,
            image9: image9 !== undefined ? image9 : school.image9,
            image10: image10 !== undefined ? image10 : school.image10,
            schoolNumber: schoolNumber !== undefined ? schoolNumber : school.schoolNumber
        });

        res.json({ message: 'School profile updated successfully', school });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateSchoolLocation = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const school = await School.findByPk(Number(schoolId));

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        await school.update({ latitude, longitude });

        res.json({ message: 'School location updated successfully', school });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
export const uploadSchoolImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // multer-s3 adds 'location' property with the S3 URL
        const file = req.file as Express.MulterS3.File;
        const fileUrl = file.location;

        res.json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- School Slots Management ---

// Helper function to initialize default slots for a school
export const initializeDefaultSlots = async (schoolId: number, serviceId: number) => {
    const defaultSlots = [
        { slotName: '9:00 AM - 12:00 PM', startTime: '09:00', endTime: '12:00', capacity: 10, price: 0 },
        { slotName: '12:00 PM - 3:00 PM', startTime: '12:00', endTime: '15:00', capacity: 10, price: 0 },
        { slotName: '3:00 PM - 6:00 PM', startTime: '15:00', endTime: '18:00', capacity: 10, price: 0 },
        { slotName: '6:00 PM - 9:00 PM', startTime: '18:00', endTime: '21:00', capacity: 10, price: 0 },
    ];

    for (const slot of defaultSlots) {
        await SchoolSlot.create({
            schoolId,
            serviceId,
            ...slot,
            isActive: true,
        });
    }
};

export const getSchoolSlots = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { serviceId, page, limit } = req.query;

        const whereClause: any = { schoolId };
        if (serviceId) {
            whereClause.serviceId = serviceId;
        }

        const allPrices = await SchoolSlotPrice.findAll({
            where: { schoolId: Number(schoolId) }
        });

        const attachPrice = (s: any) => {
            const slotData = s.toJSON();
            // Try matching by serviceId and slotName first
            let priceEntry = allPrices.find(p => p.serviceId === s.serviceId && p.slotName === s.slotName);

            // Fallback 1: Match by serviceId and time range
            if (!priceEntry) {
                priceEntry = allPrices.find(p => p.serviceId === s.serviceId && p.startTime === s.startTime && p.endTime === s.endTime);
            }

            // Fallback 2: Match by global default (serviceId null) and slotName
            if (!priceEntry) {
                priceEntry = allPrices.find(p => p.serviceId === null && p.slotName === s.slotName);
            }

            // Fallback 3: Match by global default (serviceId null) and time range
            if (!priceEntry) {
                priceEntry = allPrices.find(p => p.serviceId === null && p.startTime === s.startTime && p.endTime === s.endTime);
            }

            slotData.price = priceEntry ? Number(priceEntry.price) : 0;
            return slotData;
        };

        if (page && limit) {
            const offset = (Number(page) - 1) * Number(limit);
            const { count, rows } = await SchoolSlot.findAndCountAll({
                where: whereClause,
                order: [['startTime', 'ASC']],
                limit: Number(limit),
                offset: offset
            });

            return res.json({
                slots: rows.map(attachPrice),
                total: count,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page)
            });
        }

        const slots = await SchoolSlot.findAll({
            where: whereClause,
            order: [['startTime', 'ASC']]
        });

        res.json(slots.map(attachPrice));
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createSchoolSlot = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { serviceId, slotName, startTime, endTime, capacity, price, isActive, fromDate, endDate, weekdays } = req.body;

        if (!serviceId) {
            return res.status(400).json({ message: 'Service ID is required' });
        }

        // Check for conflicts
        const conflict = await SchoolSlot.findOne({
            where: {
                schoolId: Number(schoolId),
                serviceId: Number(serviceId),
                startTime,
                endTime,
                fromDate: { [Op.lte]: endDate },
                endDate: { [Op.gte]: fromDate }
            }
        });

        if (conflict) {
            // Check weekday overlap
            const conflictWeekdays = conflict.weekdays || [];
            const newWeekdays = weekdays || [];
            const hasOverlap = newWeekdays.some((d: string) => conflictWeekdays.includes(d));

            if (hasOverlap) {
                return res.status(400).json({
                    message: `Slot conflict: A slot for ${slotName} (${startTime}-${endTime}) already exists for this service with overlapping dates and weekdays.`
                });
            }
        }

        const fromDateObj = fromDate ? new Date(fromDate) : new Date();
        const finalEndDate = endDate || new Date(fromDateObj.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const slot = await SchoolSlot.create({
            schoolId: Number(schoolId),
            serviceId: Number(serviceId),
            slotName,
            startTime,
            endTime,
            capacity: capacity || 10,
            fromDate: fromDate || fromDateObj.toISOString().split('T')[0],
            endDate: finalEndDate,
            weekdays,
            isActive: isActive !== undefined ? isActive : true,
            isRecurring: req.body.isRecurring || false
        });

        res.status(201).json(slot);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateSchoolSlot = async (req: Request, res: Response) => {
    try {
        const { slotId } = req.params;
        const { slotName, startTime, endTime, capacity, isActive } = req.body;

        // 1. Fetch current slot first
        const slot = await SchoolSlot.findByPk(Number(slotId));
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        const updateData: any = {};
        if (slotName !== undefined) updateData.slotName = slotName;
        if (startTime !== undefined) updateData.startTime = startTime;
        if (endTime !== undefined) updateData.endTime = endTime;
        if (isActive !== undefined) updateData.isActive = isActive;

        // 2. Capacity Validation
        if (capacity !== undefined) {
            updateData.capacity = capacity;

            // If reducing capacity, check for conflicts
            if (capacity < slot.capacity) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Fetch counts per date
                const bookingCounts = await Booking.findAll({
                    attributes: [
                        'date',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    where: {
                        slotId: slot.id,
                        schoolId: slot.schoolId,
                        status: 'booked',
                        date: { [Op.gte]: today }
                    },
                    group: ['date']
                });

                // Check in JS
                const conflict = bookingCounts.find((b: any) => {
                    const count = parseInt(b.getDataValue('count'));
                    return count > capacity;
                });

                if (conflict) {
                    const conflictDate = new Date((conflict as any).getDataValue('date')).toLocaleDateString();
                    const conflictCount = (conflict as any).getDataValue('count');
                    return res.status(400).json({
                        message: `Cannot reduce capacity to ${capacity}. Conflict on ${conflictDate} with ${conflictCount} bookings.`
                    });
                }
            }
        }

        await slot.update(updateData);

        const updatedSlot = await SchoolSlot.findByPk(Number(slotId));
        res.json(updatedSlot);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteSchoolSlot = async (req: Request, res: Response) => {
    try {
        const { slotId } = req.params;
        await SchoolSlot.destroy({ where: { id: slotId } });
        res.json({ message: 'Slot deleted successfully' });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getSlotAvailability = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { date, serviceId } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const dateStr = date as string; // Ensure we stick to YYYY-MM-DD
        const targetDate = new Date(dateStr);

        // Check for blocked dates
        const blockedSchedules = await SchoolSchedule.findAll({ where: { schoolId: Number(schoolId), blockedDate: dateStr } });
        const blockedServiceIds = blockedSchedules.map((s: any) => s.serviceId); // Might contain nulls
        const isAllBlocked = blockedSchedules.some((s: any) => !s.serviceId); // If any entry has no serviceId, it blocks all

        const whereClause: any = { schoolId: Number(schoolId) };
        if (serviceId) whereClause.serviceId = Number(serviceId);

        // 1. Get Base Slots
        const allSlots = await SchoolSlot.findAll({
            where: whereClause,
            order: [['startTime', 'ASC']]
        });

        console.log(`[getSlotAvailability] Found ${allSlots.length} base slots for school ${schoolId}, service ${serviceId}`);

        // Filter slots based on date range and weekdays
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getUTCDay()];
        console.log(`[getSlotAvailability] Target Date: ${dateStr}, Day: ${dayName}`);

        const slots = allSlots.filter((slot: any) => {
            // Blocked Check
            if (isAllBlocked) {
                console.log(`[getSlotAvailability] Slot ${slot.id} filtered: All blocked`);
                return false;
            }
            if (blockedServiceIds.includes(slot.serviceId)) {
                console.log(`[getSlotAvailability] Slot ${slot.id} filtered: Service ${slot.serviceId} blocked`);
                return false;
            }

            // Check Date Range (using string comparison for DATEONLY fields)
            if (slot.fromDate && slot.fromDate > dateStr) {
                console.log(`[getSlotAvailability] Slot ${slot.id} filtered: fromDate ${slot.fromDate} > ${dateStr}`);
                return false;
            }
            if (slot.endDate && slot.endDate < dateStr) {
                console.log(`[getSlotAvailability] Slot ${slot.id} filtered: endDate ${slot.endDate} < ${dateStr}`);
                return false;
            }

            // Check Weekdays
            if (slot.weekdays && Array.isArray(slot.weekdays) && slot.weekdays.length > 0) {
                if (!slot.weekdays.includes(dayName)) {
                    console.log(`[getSlotAvailability] Slot ${slot.id} filtered: Day ${dayName} not in ${JSON.stringify(slot.weekdays)}`);
                    return false;
                }
            }

            return true;
        });

        console.log(`[getSlotAvailability] ${slots.length} slots passed filtering`);

        // 3. Get Bookings Count
        const startOfDay = new Date(dateStr);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const bookings = await Booking.findAll({
            where: {
                schoolId: Number(schoolId),
                status: 'booked',
                date: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay
                },
                ...(serviceId && { serviceId: Number(serviceId) })
            } as any
        });

        // 4. Attach Price from SchoolSlotPrice
        const allPrices = await SchoolSlotPrice.findAll({
            where: { schoolId: Number(schoolId) }
        });

        const slotMap = slots.map(slot => {
            const slotData = slot.toJSON();
            const currentCapacity = slot.capacity;

            // Count Bookings for this slot using slotId for precision
            const bookingCount = bookings.filter(b => b.slotId === slot.id).length;

            // Try matching by serviceId and slotName first
            let priceEntry = allPrices.find(p => p.serviceId === slot.serviceId && p.slotName === slot.slotName);

            // Fallback 1: Match by serviceId and time range
            if (!priceEntry) {
                priceEntry = allPrices.find(p => p.serviceId === slot.serviceId && p.startTime === slot.startTime && p.endTime === slot.endTime);
            }

            // Fallback 2: Match by global default (serviceId null or undefined) and slotName
            if (!priceEntry) {
                priceEntry = allPrices.find(p => (p.serviceId === null || p.serviceId === undefined) && p.slotName === slot.slotName);
            }

            // Fallback 3: Match by global default (serviceId null or undefined) and time range
            if (!priceEntry) {
                priceEntry = allPrices.find(p => (p.serviceId === null || p.serviceId === undefined) && p.startTime === slot.startTime && p.endTime === slot.endTime);
            }

            return {
                ...slotData,
                price: priceEntry ? Number(priceEntry.price) : 0,
                baseCapacity: slot.capacity,
                currentCapacity,
                bookedCount: bookingCount,
                available: Math.max(0, currentCapacity - bookingCount),
                isOverridden: false
            };
        });

        // Deduplicate slots based on serviceId, startTime, endTime, and slotName
        const uniqueSlotsMap = new Map<string, any>();
        slotMap.forEach((s: any) => {
            const key = `${s.serviceId}-${s.startTime}-${s.endTime}-${s.slotName}`;
            if (!uniqueSlotsMap.has(key)) {
                uniqueSlotsMap.set(key, s);
            }
        });

        res.json(Array.from(uniqueSlotsMap.values()));
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateSlotAvailability = async (req: Request, res: Response) => {
    let transaction;
    try {
        const { updates } = req.body; // updates: [{ slotId, newCapacity, addCapacity }]

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: 'Invalid request data. Updates array is required.' });
        }

        // We use a transaction to ensure all slot updates are atomic
        transaction = await sequelize.transaction();
        const results = [];

        // Iterate over updates and apply directly to Master Slot Table (SchoolSlot) 
        // as requested by user ("update in the same table").
        for (const update of updates) {
            const { slotId, newCapacity, addCapacity } = update;

            // 1. Get Master Slot
            const slot = await SchoolSlot.findByPk(Number(slotId), { transaction });
            if (!slot) continue;

            let targetCapacity = slot.capacity;

            if (addCapacity !== undefined) {
                targetCapacity = slot.capacity + addCapacity;
            } else if (newCapacity !== undefined) {
                targetCapacity = newCapacity;
            } else {
                continue;
            }

            if (targetCapacity < 0) targetCapacity = 0;

            // 3. Safety Check: If reducing capacity, check for booking conflicts
            // We need to ensure that for any future date, the number of existing bookings does not exceed the new target capacity.
            if (targetCapacity < slot.capacity) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const bookingCounts = await Booking.findAll({
                    attributes: [
                        'date',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    where: {
                        slotId: slot.id,
                        schoolId: slot.schoolId,
                        status: 'booked',
                        date: { [Op.gte]: today }
                    },
                    group: ['date'],
                    transaction
                });

                const conflict = bookingCounts.find((b: any) => {
                    const count = parseInt(b.getDataValue('count'));
                    return count > targetCapacity;
                });

                if (conflict) {
                    const conflictDate = new Date((conflict as any).getDataValue('date')).toLocaleDateString();
                    const conflictCount = (conflict as any).getDataValue('count');
                    throw new Error(`Cannot reduce capacity to ${targetCapacity}. Conflict on ${conflictDate} with ${conflictCount} bookings for ${slot.slotName}.`);
                }
            }

            // 2. Update Master Slot
            slot.capacity = targetCapacity;
            if (targetCapacity === 0) {
                // Optionally mark inactive if 0? User said "cancel slot". 
                // Keeping it active but 0 capacity is effectively cancelled for booking.
                // But let's keep isActive true unless explicitly changed?
                // Actually, capacity 0 means no one can book.
            }

            await slot.save({ transaction });

            results.push(slot);
        }

        await transaction.commit();
        res.json({ message: 'Master slots updated successfully', data: results });

    } catch (error: any) {
        if (transaction) await transaction.rollback();
        console.error('Update Slot Error:', error);
        res.status(400).json({ message: error.message || 'Failed to update slots' });
    }
};

// --- Slot Price Management ---

export const getSchoolSlotPrices = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { serviceId } = req.query;
        const where: any = { schoolId: Number(schoolId) };

        if (serviceId) {
            where.serviceId = Number(serviceId);
        } else {
            where.serviceId = null; // Global defaults
        }

        const prices = await SchoolSlotPrice.findAll({
            where,
            order: [['startTime', 'ASC']]
        });
        res.json(prices);
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateSchoolSlotPrices = async (req: Request, res: Response) => {
    try {
        const { schoolId } = req.params;
        const { prices, serviceId } = req.body; // Expecting array of { slotName, startTime, endTime, price } and optional serviceId

        if (!Array.isArray(prices)) {
            return res.status(400).json({ message: 'Prices must be an array' });
        }

        for (const item of prices) {
            const [priceRecord, created] = await SchoolSlotPrice.findOrCreate({
                where: {
                    schoolId: Number(schoolId),
                    serviceId: serviceId ? Number(serviceId) : null,
                    slotName: item.slotName
                },
                defaults: {
                    schoolId: Number(schoolId),
                    serviceId: serviceId ? Number(serviceId) : null,
                    slotName: item.slotName,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    price: item.price || 0
                }
            });

            if (!created) {
                await priceRecord.update({
                    startTime: item.startTime,
                    endTime: item.endTime,
                    price: item.price || 0
                });
            }
        }

        res.json({ message: 'Slot prices updated successfully' });
    } catch (error: any) {
        console.error('[getSlotAvailability] CRITICAL ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
