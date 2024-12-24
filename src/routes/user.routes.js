import express from 'express';
import { signup, login } from '../controllers/user.controller.js';

const router = express.Router();

// SignUp Routes
router.post('/signup', signup);

// Login Routes
router.post('/login', login);

export default router;
