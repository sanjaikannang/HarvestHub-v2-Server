import cloudinary from 'cloudinary';

import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


// Function to upload Image
const handleUpload = async (file) => {
  try {
    // console.log(file);
    const res = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
    });

    // console.log('Cloudinary upload result:', res);

    return res;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Error uploading image to Cloudinary');
  }
};

export default handleUpload;
