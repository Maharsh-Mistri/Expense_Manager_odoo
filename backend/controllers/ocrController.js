const axios = require('axios');
const fs = require('fs');
const path = require('path');

// OCR.space API configuration
const OCR_API_KEY = process.env.OCR_API_KEY || 'K84203801888957';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

// Process receipt with OCR.space API
const processReceipt = async (req, res) => {
  let uploadedFilePath = null;

  try {
    console.log('\n========================================');
    console.log('OCR PROCESSING STARTED');
    console.log('Time:', new Date().toISOString());
    console.log('========================================\n');
    
    // Check if file exists
    if (!req.file) {
      console.log('❌ ERROR: No file in request');
      return res.status(400).json({ 
        success: false,
        message: 'No receipt file uploaded. Please select an image.' 
      });
    }

    uploadedFilePath = req.file.path;
    
    console.log('✅ File received:');
    console.log('   Filename:', req.file.filename);
    console.log('   Original:', req.file.originalname);
    console.log('   Path:', req.file.path);
    console.log('   Size:', req.file.size, 'bytes');
    console.log('   Type:', req.file.mimetype);

    // Verify file exists
    if (!fs.existsSync(uploadedFilePath)) {
      console.log('❌ ERROR: File does not exist at path');
      return res.status(500).json({ 
        success: false,
        message: 'File upload failed. Please try again.' 
      });
    }

    // Read file as base64 (more reliable than stream for Windows)
    console.log('\n📖 Reading file as base64...');
    const imageBuffer = fs.readFileSync(uploadedFilePath);
    const base64Image = imageBuffer.toString('base64');
    console.log('✅ File read successfully, size:', base64Image.length, 'chars');

    // Prepare request data
    const requestData = {
      base64Image: `data:${req.file.mimetype};base64,${base64Image}`,
      apikey: OCR_API_KEY,
      language: 'eng',
      isOverlayRequired: false,
      detectOrientation: true,
      scale: true,
      OCREngine: 2
    };

    console.log('\n🚀 Calling OCR.space API...');
    console.log('   API URL:', OCR_API_URL);
    console.log('   API Key:', OCR_API_KEY.substring(0, 8) + '...');
    console.log('   Engine: 2 (better for receipts)');

    // Call OCR API
    const response = await axios.post(OCR_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000 // 30 seconds
    });

    console.log('\n✅ OCR API Response received');
    console.log('   Exit Code:', response.data.OCRExitCode);
    console.log('   Processing Time:', response.data.ProcessingTimeInMilliseconds, 'ms');

    // Check for errors
    if (response.data.IsErroredOnProcessing) {
      const errorMsg = response.data.ErrorMessage?.[0] || 'OCR processing failed';
      console.log('❌ OCR Error:', errorMsg);
      cleanupFile(uploadedFilePath);
      return res.status(500).json({ 
        success: false,
        message: errorMsg,
        hint: 'Try a different image format or clearer image'
      });
    }

    // Extract text
    const ocrResult = response.data.ParsedResults?.[0];
    if (!ocrResult) {
      console.log('❌ No results returned from OCR');
      cleanupFile(uploadedFilePath);
      return res.status(500).json({ 
        success: false,
        message: 'Could not extract text from image',
        hint: 'Make sure the image contains readable text'
      });
    }

    const extractedText = ocrResult.ParsedText || '';
    console.log('\n📝 TEXT EXTRACTED:');
    console.log('   Length:', extractedText.length, 'characters');
    console.log('   Preview:', extractedText.substring(0, 200));
    console.log('   ...');

    // Parse the text
    console.log('\n⚙️ Parsing receipt data...');
    const parsedData = parseReceiptText(extractedText);
    
    console.log('\n✅ PARSED RESULTS:');
    console.log('   Amount: $' + (parsedData.amount || 'Not found'));
    console.log('   Date:', parsedData.date);
    console.log('   Merchant:', parsedData.merchantName || 'Not found');
    console.log('   Description:', parsedData.description.substring(0, 50) + '...');

    // Clean up file
    cleanupFile(uploadedFilePath);

    console.log('\n========================================');
    console.log('OCR PROCESSING COMPLETED SUCCESSFULLY');
    console.log('========================================\n');

    // Return success
    res.json({
      success: true,
      rawText: extractedText,
      confidence: 90,
      ...parsedData,
      message: '✅ Receipt processed successfully! Please review the extracted data.',
    });

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ OCR ERROR OCCURRED');
    console.error('========================================');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('\nAPI Response Error:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('\nNo Response from API');
      console.error('This usually means network/timeout issue');
    } else {
      console.error('\nGeneral Error:');
      console.error('Stack:', error.stack);
    }
    console.error('========================================\n');
    
    // Clean up
    if (uploadedFilePath) {
      cleanupFile(uploadedFilePath);
    }
    
    // Return error
    res.status(500).json({ 
      success: false,
      message: 'Failed to process receipt. Please enter details manually.',
      error: error.message,
      hint: 'Try uploading a clearer PNG or JPEG image'
    });
  }
};

// Helper: Clean up file
const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️  Cleaned up:', path.basename(filePath));
    }
  } catch (err) {
    console.error('⚠️  Error cleaning file:', err.message);
  }
};

// Helper: Parse receipt text
const parseReceiptText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      amount: '',
      date: new Date().toISOString().split('T')[0],
      merchantName: '',
      description: 'No text extracted',
      expenseLines: [],
    };
  }

  const lines = text.split(/[\r\n]+/).filter(line => line.trim().length > 0);
  
  let amount = null;
  let date = null;
  let merchantName = null;

  // Extract merchant (first non-empty, non-date, non-number line)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 2 && line.length < 60 && 
        !/^\d+$/.test(line) && !line.match(/\d{1,2}[\/\-\.]\d{1,2}/)) {
      merchantName = line;
      break;
    }
  }

  // Extract amount
  const amountRegex = /(?:total|amount|balance)[:\s]*\$?\s*(\d+[.,]\d{2})|(\d+\.\d{2})/gi;
  let maxAmount = 0;
  
  lines.forEach(line => {
    const matches = [...line.matchAll(amountRegex)];
    matches.forEach(match => {
      const num = parseFloat((match[1] || match[2]).replace(',', '.'));
      if (num > maxAmount && num < 100000) {
        maxAmount = num;
      }
    });
  });
  
  if (maxAmount > 0) amount = maxAmount;

  // Extract date
  const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      try {
        const year = match[3].length === 2 ? '20' + match[3] : match[3];
        const testDate = new Date(year, parseInt(match[1]) - 1, match[2]);
        if (!isNaN(testDate.getTime()) && testDate <= new Date()) {
          date = testDate.toISOString().split('T')[0];
          break;
        }
      } catch (e) {
        // Skip invalid dates
      }
    }
  }

  // Create description
  let description = merchantName ? `Receipt from ${merchantName}` : 'Receipt processed via OCR';
  if (description.length > 200) {
    description = description.substring(0, 197) + '...';
  }

  return {
    amount: amount || '',
    date: date || new Date().toISOString().split('T')[0],
    merchantName: merchantName || '',
    description: description,
    expenseLines: lines.slice(0, 5),
  };
};

module.exports = { processReceipt };
