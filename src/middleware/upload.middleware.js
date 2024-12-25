import multer from 'multer';
import { CustomError } from '../utils/customError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('Processing file:', file.originalname); // Debug log


  if (!file.mimetype.startsWith('image/')) {
    return cb(new CustomError('Only image files are allowed', 400), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3
  }
});