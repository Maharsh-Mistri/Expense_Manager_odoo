const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination called');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('Multer filename called for:', file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log('Multer fileFilter called');
  console.log('File mimetype:', file.mimetype);
  console.log('File originalname:', file.originalname);
  
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log('File accepted');
    return cb(null, true);
  } else {
    console.log('File rejected');
    cb(new Error('Only images (JPEG, JPG, PNG) and PDFs are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: fileFilter,
});

// Add error handler for multer errors
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      error: err.code
    });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

module.exports = upload;
module.exports.multerErrorHandler = multerErrorHandler;
