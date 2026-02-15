import cron from 'node-cron';
import SchoolSlot from '../models/SchoolSlot';
import { Op } from 'sequelize';

export const initRecurringSlotCron = () => {
    // Runs every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Checking for recurring slots to renew...');
        try {
            const today = new Date().toISOString().split('T')[0];

            // Find recurring slots that are expiring today or have already expired 
            // but haven't been renewed yet (no slot exists for the next period)
            const expiringSlots = await SchoolSlot.findAll({
                where: {
                    isRecurring: true,
                    isActive: true,
                    endDate: {
                        [Op.lte]: today
                    }
                }
            });

            for (const slot of expiringSlots) {
                // Check if a successor already exists to avoid duplicate renewals
                const nextStartDate = new Date(new Date(slot.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const existingNext = await SchoolSlot.findOne({
                    where: {
                        schoolId: slot.schoolId,
                        serviceId: slot.serviceId,
                        slotName: slot.slotName,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        fromDate: nextStartDate
                    }
                });

                if (!existingNext) {
                    const nextEndDate = new Date(new Date(nextStartDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                    await SchoolSlot.create({
                        schoolId: slot.schoolId,
                        serviceId: slot.serviceId,
                        slotName: slot.slotName,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        capacity: slot.capacity,
                        fromDate: nextStartDate,
                        endDate: nextEndDate,
                        weekdays: slot.weekdays,
                        isActive: true,
                        isRecurring: true
                    });

                    console.log(`[Cron] Renewed slot: ${slot.slotName} for school ${slot.schoolId} (New Period: ${nextStartDate} to ${nextEndDate})`);

                    // Optionally mark the old slot as non-recurring to avoid re-processing, 
                    // though the date check should handle it.
                    await slot.update({ isRecurring: false });
                }
            }
        } catch (error) {
            console.error('[Cron] Error renewing recurring slots:', error);
        }
    });
};
