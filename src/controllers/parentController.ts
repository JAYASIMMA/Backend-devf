import { Request, Response } from 'express';
import Parent from '../models/Parent';
import Child from '../models/Child';

export const getParentProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const parent = await Parent.findOne({
            where: { userId },
            include: [{ model: Child, as: 'children' }]
        });

        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        const responseData = parent.get({ plain: true });

        // Ensure consistency for frontend keys
        console.log('Sending profile data to frontend for userId:', userId);

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateParentProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { fatherName, motherName, guardianName, email, address, location, state, pincode } = req.body;

        const parent = await Parent.findOne({ where: { userId } });

        if (!parent) {
            return res.status(404).json({ error: 'Parent profile not found' });
        }

        // Note: primaryContact (mobile) is NOT updated as per requirements

        let imageUrl = parent.profileImage;
        if (req.file) {
            // S3 Migration: Use location property from multer-s3
            const file = req.file as any;
            imageUrl = file.location;
        }

        await parent.update({
            fatherName,
            motherName,
            guardianName,
            email,
            address,
            location,
            state,
            pincode,
            profileImage: imageUrl
        });

        res.status(200).json({ message: 'Profile updated successfully', parent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const updateChildProfile = async (req: Request, res: Response) => {
    try {
        const { childId } = req.params;
        const updateData = req.body;
        console.log('Updating child profile. childId:', childId, 'updateData:', JSON.stringify(updateData, null, 2));

        const child = await Child.findByPk(Number(childId));

        if (!child) {
            console.log('Child not found for update, childId:', childId);
            return res.status(404).json({ error: 'Child not found' });
        }

        const {
            name,
            age,
            dob,
            gender,
            disabilityType,
            disabilityPercent,
            aadharNumber,
            uuid,
            schoolName,
            schoolAddress,
            schoolContactPerson,
            schoolContactNumber
        } = req.body;

        if (req.file) {
            const file = req.file as any;
            const imageUrl = file.location;
            console.log('Updating child with image:', imageUrl);
            await child.update({
                name,
                age,
                dob,
                gender,
                disabilityType,
                disabilityPercent,
                aadharNumber,
                uuid,
                schoolName,
                schoolAddress,
                schoolContactPerson,
                schoolContactNumber,
                profileImage: imageUrl
            });
        } else {
            console.log('Updating child without image');
            await child.update({
                name,
                age,
                dob,
                gender,
                disabilityType,
                disabilityPercent,
                aadharNumber,
                uuid,
                schoolName,
                schoolAddress,
                schoolContactPerson,
                schoolContactNumber
            });
        }

        console.log('Child profile updated successfully');
        res.status(200).json({ message: 'Child profile updated successfully', child });
    } catch (error) {
        console.error('Update Child Error:', error);
        res.status(500).json({ error: 'Failed to update child profile' });
    }
};
