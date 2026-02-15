import { Router } from 'express';
import { createReview, getSchoolReviews } from '../controllers/reviewController';

const router = Router();

router.post('/', createReview);
router.get('/school/:schoolId', getSchoolReviews);

export default router;
