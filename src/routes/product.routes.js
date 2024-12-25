import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadProduct } from '../controllers/product.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/create-order', verifyToken, upload.array('photos', 3), uploadProduct);

export default router;