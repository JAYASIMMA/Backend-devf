import sequelize from '../config/database';
import School from '../models/School';
import Booking from '../models/Booking';

const verifyBookings = async () => {
    try {
        await sequelize.authenticate();

        const school = await School.findOne({
            where: { name: 'Holy cross Maddonnas Metric School' }
        });

        if (!school) {
            console.log('School not found!');
            return;
        }

        const bookings = await Booking.findAll({
            where: { schoolId: school.id }
        });

        console.log(`Found ${bookings.length} bookings for school ${school.name}`);
        bookings.forEach(b => console.log(`- ID: ${b.bookingIdStr}, Status: ${b.status}, Date: ${b.date}`));

    } catch (error) {
        console.error('Error verifying bookings:', error);
    } finally {
        await sequelize.close();
    }
};

verifyBookings();
