import express from 'express';
import { addUser, login } from '../controllers/authController.js';

const router = express.Router();

// Logic Check: These are relative to the prefix in server.js
// If server.js uses /api/auth, then these become /api/auth/register
router.post('/register', addUser);
router.post('/login', login);

export default router;