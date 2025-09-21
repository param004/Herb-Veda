import { Router } from 'express';
import { sendContactMessage } from '../controllers/contact.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Authenticated endpoint: Contact form submission allowed only for logged in users
router.post('/', requireAuth, sendContactMessage);

export default router;
