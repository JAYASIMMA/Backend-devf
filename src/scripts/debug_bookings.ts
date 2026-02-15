
import sequelize from '../config/database';
import Booking from '../models/Booking';
import School from '../models/School';
import Service from '../models/Service';
import SchoolSlot from '../models/SchoolSlot';
import defineAssociations from '../models/associations';
import Parent from '../models/Parent';
import * as fs from 'fs';

function log(msg: string) {
    fs.appendFileSync('debug_log.txt', msg + '\n');
}

async function testFetch() {
    try {
        await sequelize.authenticate();
        log("Database connected.");

        // Initialize associations
        defineAssociations();

        // Sync to ensure latest schema (optional, but good for debugging)
        await sequelize.sync({ alter: true });
        log("Database synced.");

        // Try to fetch all bookings with includes
        const bookings = await Booking.findAll({
            include: [
                { model: School, attributes: ['name', 'image1'] },
                { model: Service, attributes: ['name', 'cost'] },
                { model: SchoolSlot, as: 'slot', attributes: ['startTime', 'endTime', 'slotName'] }
            ],
            limit: 5
        });

        log(`Successfully fetched ${bookings.length} bookings.`);
        log(JSON.stringify(bookings, null, 2));

    } catch (error: any) {
        log("FATAL ERROR FETCHING BOOKINGS:");
        log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } finally {
        await sequelize.close();
    }
}

testFetch();
