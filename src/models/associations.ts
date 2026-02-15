import User from './user';
import School from './School';
import Service from './Service';
import Booking from './Booking';
import SchoolSchedule from './SchoolSchedule';
import SchoolSlot from './SchoolSlot';
import Parent from './Parent';
import Child from './Child';
import SlotOverride from './SlotOverride';
import SuperAdmin from './SuperAdmin';
import SchoolAdmin from './SchoolAdmin';
import Review from './Review';
import SchoolSlotPrice from './SchoolSlotPrice';

const defineAssociations = () => {
    // User (Admin) <-> School
    School.hasMany(User, { foreignKey: 'schoolId', as: 'admins' });
    User.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    // School <-> Service
    School.hasMany(Service, { foreignKey: 'schoolId', as: 'services' });
    Service.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    // School <-> Booking
    School.hasMany(Booking, { foreignKey: 'schoolId', as: 'bookings' });
    Booking.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    // School <-> Schedule
    School.hasMany(SchoolSchedule, { foreignKey: 'schoolId', as: 'schedules' });
    SchoolSchedule.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    // Parent <-> Booking
    Parent.hasMany(Booking, { foreignKey: 'parentId', as: 'bookings' });
    Booking.belongsTo(Parent, { foreignKey: 'parentId', as: 'parent' });

    // Child <-> Booking
    Child.hasMany(Booking, { foreignKey: 'childId', as: 'bookings' });
    Booking.belongsTo(Child, { foreignKey: 'childId', as: 'child' });

    // Service <-> Booking
    Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
    Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

    // Service <-> Schedule (optional block for specific service)
    Service.hasMany(SchoolSchedule, { foreignKey: 'serviceId', as: 'schedules' });
    SchoolSchedule.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

    // Service <-> SchoolSlot
    Service.hasMany(SchoolSlot, { foreignKey: 'serviceId', as: 'slots' });
    SchoolSlot.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

    // SchoolSlot <-> Booking
    SchoolSlot.hasMany(Booking, { foreignKey: 'slotId', as: 'bookings' });
    Booking.belongsTo(SchoolSlot, { foreignKey: 'slotId', as: 'slot' });

    // SchoolSlot <-> SlotOverride
    SchoolSlot.hasMany(SlotOverride, { foreignKey: 'slotId', as: 'overrides' });
    SlotOverride.belongsTo(SchoolSlot, { foreignKey: 'slotId', as: 'slot' });

    // User <-> SuperAdmin (One-to-One)
    User.hasOne(SuperAdmin, { foreignKey: 'userId', as: 'superAdminProfile' });
    SuperAdmin.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User <-> SchoolAdmin (One-to-One)
    User.hasOne(SchoolAdmin, { foreignKey: 'userId', as: 'schoolAdminProfile' });
    SchoolAdmin.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // School <-> SchoolAdmin (One-to-Many)
    School.hasMany(SchoolAdmin, { foreignKey: 'schoolId', as: 'schoolAdmins' });
    SchoolAdmin.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    // User <-> Parent
    User.hasOne(Parent, { foreignKey: 'userId', as: 'parentProfile' });
    Parent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Parent <-> Child
    Parent.hasMany(Child, { foreignKey: 'parentId', as: 'children' });
    Child.belongsTo(Parent, { foreignKey: 'parentId', as: 'parent' });

    // Review Associations
    School.hasMany(Review, { foreignKey: 'schoolId', as: 'reviews' });
    Review.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    Parent.hasMany(Review, { foreignKey: 'parentId', as: 'reviews' });
    Review.belongsTo(Parent, { foreignKey: 'parentId', as: 'parent' });

    Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
    Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

    // School <-> SlotPrice
    School.hasMany(SchoolSlotPrice, { foreignKey: 'schoolId', as: 'slotPrices' });
    SchoolSlotPrice.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });

    // Service <-> SlotPrice
    Service.hasMany(SchoolSlotPrice, { foreignKey: 'serviceId', as: 'slotPrices' });
    SchoolSlotPrice.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
};

export default defineAssociations;
