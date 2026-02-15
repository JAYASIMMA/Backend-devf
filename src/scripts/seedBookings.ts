import sequelize from '../config/database';
import School from '../models/School';
import User from '../models/user';
import Parent from '../models/Parent';
import Child from '../models/Child';
import Service from '../models/Service';
import Booking from '../models/Booking';

const seedBookings = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Find or Create School
        const [school] = await School.findOrCreate({
            where: { name: 'Holy cross Maddonnas Metric School' },
            defaults: {
                name: 'Holy cross Maddonnas Metric School',
                tag: 'Special Education Center',
                address: '123 Holy Cross St',
                city: 'Chennai',
                description: 'A premier institute for special education.',
                latitude: 13.0827,
                longitude: 80.2707
            }
        });
        console.log('School ID:', school.id);

        // 2. Find or Create Parent User
        const [parentUser] = await User.findOrCreate({
            where: { mobileNumber: '9999999999' },
            defaults: {
                mobileNumber: '9999999999',
                password: 'password123',
                role: 'parent',
                email: 'parent@example.com',
                username: 'ParentUser'
            }
        });
        console.log('Parent User ID:', parentUser.id);

        // 3. Find or Create Parent Profile
        const [parent] = await Parent.findOrCreate({
            where: { userId: parentUser.id },
            defaults: {
                userId: parentUser.id,
                fatherName: 'John Doe',
                motherName: 'Jane Doe',
                primaryContact: '9999999999',
                address: '456 Parent Lane',
                location: 'Chennai'
            }
        });
        console.log('Parent ID:', parent.id);

        // 4. Find or Create Child
        const [child] = await Child.findOrCreate({
            where: { parentId: parent.id, name: 'Baby Doe' },
            defaults: {
                parentId: parent.id,
                name: 'Baby Doe',
                age: 5,
                disabilityType: 'Autism',
                disabilityPercent: 40,
                aadharNumber: '123456789012'
            }
        });
        console.log('Child ID:', child.id);

        // 5. Create Services
        const [service1] = await Service.findOrCreate({
            where: { schoolId: school.id, name: 'Full Day Care' },
            defaults: {
                schoolId: school.id,
                name: 'Full Day Care',
                cost: 1500,
                duration: '8 hours',
                description: 'Complete day care service',
                advancedBookingEnabled: false
            }
        });

        const [service2] = await Service.findOrCreate({
            where: { schoolId: school.id, name: 'Therapy Session' },
            defaults: {
                schoolId: school.id,
                name: 'Therapy Session',
                cost: 800,
                duration: '1 hour',
                description: 'One hour specialized therapy',
                advancedBookingEnabled: false
            }
        });

        console.log('Services created/found.');

        // 6. Create Bookings
        const bookingsData = [
            {
                schoolId: school.id,
                parentId: parent.id,
                childId: child.id,
                serviceId: service1.id,
                date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
                status: 'booked',
                amount: service1.cost,
                bookingIdStr: `BK-${Date.now()}-1`
            },
            {
                schoolId: school.id,
                parentId: parent.id,
                childId: child.id,
                serviceId: service2.id,
                date: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
                status: 'booked',
                amount: service2.cost,
                bookingIdStr: `BK-${Date.now()}-2`
            },
            {
                schoolId: school.id,
                parentId: parent.id,
                childId: child.id,
                serviceId: service1.id,
                date: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
                status: 'completed',
                amount: service1.cost,
                bookingIdStr: `BK-${Date.now()}-3`
            },
            {
                schoolId: school.id,
                parentId: parent.id,
                childId: child.id,
                serviceId: service2.id,
                date: new Date(new Date().setDate(new Date().getDate() + 10)), // 10 days from now
                status: 'cancelled',
                amount: service2.cost,
                bookingIdStr: `BK-${Date.now()}-4`
            },
            {
                schoolId: school.id,
                parentId: parent.id,
                childId: child.id,
                serviceId: service1.id,
                date: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 days from now
                status: 'booked',
                amount: service1.cost,
                bookingIdStr: `BK-${Date.now()}-5`
            }
        ];

        for (const data of bookingsData) {
            // Check if booking ID exists to avoid duplicates if run multiple times
            // Though bookingIdStr uses Date.now(), it changes every run. 
            // We'll just create new ones.
            await Booking.create(data as any);
        }

        console.log('5 Bookings created successfully.');

    } catch (error) {
        console.error('Error seeding bookings:', error);
    } finally {
        await sequelize.close();
    }
};

seedBookings();
