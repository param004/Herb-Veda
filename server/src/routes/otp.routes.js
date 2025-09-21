import { Router } from 'express';
import { requestLoginOtp, verifyLoginOtp, requestRegisterOtp, verifyRegisterOtp } from '../controllers/otp.controller.js';

const router = Router();

router.post('/login/request', requestLoginOtp);
router.post('/login/verify', verifyLoginOtp);

router.post('/register/request', requestRegisterOtp);
router.post('/register', requestRegisterOtp); // alias
router.post('/register/verify', verifyRegisterOtp);

export default router;
