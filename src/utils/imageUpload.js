import cloudinary from '../config/cloudinary.config.js';
import { CustomError } from './customError.js';
import { PRODUCT_CONSTANTS } from '../constants/product.constants.js';

export async function validateImages(files) {
  console.log('Files received:', files); // Debug log
  console.log('Number of files:', files?.length); // Debug log
  console.log('Files content:', JSON.stringify(files, null, 2)); // Debug detailed files content

  if (!files) {
    throw new CustomError('No files were uploaded', 400);
  }

  if (files.length !== 3) {
    throw new CustomError(`Exactly 3 images are required. Received: ${files.length}`, 400);
  }

  // Validate each file
  files.forEach((file, index) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new CustomError(`File ${index + 1} is not a valid image`, 400);
    }
  });
}

export async function uploadImages(files) {
  const imageUrls = [];

  for (const file of files) {
    if (!file.mimetype || !file.buffer) {
      throw new CustomError('Invalid file data', 400);
    }

    const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    try {
      const result = await cloudinary.uploader.upload(fileDataURI, {
        resource_type: 'auto',
      });
      imageUrls.push(result.secure_url);
    } catch (error) {
      throw new CustomError('Failed to upload image to cloud storage', 500);
    }
  }

  return imageUrls;
}