const cloudinary = require('cloudinary').v2;
const logger = require('../config/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (file, folder = 'jobtoy') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    logger.error('Upload error:', error);
    throw error;
  }
};

module.exports = { uploadFile };