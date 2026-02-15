import { Router } from 'express';
import { signup, login, forgotPassword, deleteAccount, updateProfile, changePassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected Routes
router.use(authMiddleware.verifyToken);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

router.get('/user', (req, res) => {
    res.json({ message: 'This is a protected user content.' });
});

export default router;
