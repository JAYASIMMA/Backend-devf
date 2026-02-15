import { Router } from 'express';
import { getParentProfile, updateParentProfile, updateChildProfile } from '../controllers/parentController';
import upload from '../utils/multerConfig';

const router = Router();

router.get('/:userId', getParentProfile);
router.put('/:userId', upload.single('profileImage'), updateParentProfile);
router.put('/child/:childId', upload.single('profileImage'), updateChildProfile);

export default router;
