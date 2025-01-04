import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getProducts, getSpecificProduct, uploadProduct, verifyProduct } from '../controllers/product.controller.js';
import multer from 'multer';

const router = express.Router();


const storage = multer.memoryStorage(); // Use memory storage for handling file buffers
const upload = multer({ storage: storage });
const myUploadMiddleware = upload.array('photos', 3); // 'photos' is the field name, and 3 is the maximum number of files


// Route for create order
router.post('/create-order', verifyToken, myUploadMiddleware, uploadProduct);


// Route for verify and approving a product by Admin
router.put('/verify/:productId', verifyToken, verifyProduct);


// Route for getting all products ( All Product )
router.get('/get-all-products-all', verifyToken, getProducts);


// Route for getting Specific product details 
router.get('/get-specific-product/:productId', verifyToken, getSpecificProduct);


export default router;