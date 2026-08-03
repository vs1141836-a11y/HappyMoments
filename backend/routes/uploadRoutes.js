import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File validation
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images Only! (jpg, jpeg, png, webp)'));
  }
}

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

// Configure Cloudinary if valid keys exist
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName || cloudName.includes('dummy') ||
    !apiKey || apiKey.includes('12345') ||
    !apiSecret || apiSecret.includes('dummy')
  ) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
};

// @desc    Upload image (Admin only)
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image to upload' });
    }

    const cInstance = configureCloudinary();
    
    if (cInstance) {
      // Upload to Cloudinary
      const result = await cInstance.uploader.upload(req.file.path, {
        folder: 'happymoments',
        use_filename: true,
      });

      // Remove temp file from local folder
      fs.unlinkSync(req.file.path);

      return res.json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary',
        url: result.secure_url,
      });
    } else {
      // Local fallback: serving file statically
      const host = req.get('host');
      const protocol = req.protocol;
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        message: 'Image saved locally (Cloudinary offline fallback)',
        url: fileUrl,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
