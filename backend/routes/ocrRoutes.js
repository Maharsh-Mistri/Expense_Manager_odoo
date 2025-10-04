const express = require('express');
const { processReceipt } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');
const router = express.Router();

// POST /api/ocr/process - Process receipt with OCR
router.post('/process', protect, upload.single('receipt'), (req, res, next) => {
  console.log('OCR Route Hit!');
  console.log('User:', req.user?.email);
  console.log('File received in route:', req.file ? 'YES' : 'NO');
  if (req.file) {
    console.log('File details:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  }
  next();
}, processReceipt);

module.exports = router;
