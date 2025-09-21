import { Router } from 'express';
import { login, register, updateProfile, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset', resetPassword);
router.get('/me', requireAuth, (req, res) => {
	res.json({ user: { email: req.user.email, name: req.user.name, id: req.user.sub } });
});
router.put('/profile', requireAuth, updateProfile);

export default router;
