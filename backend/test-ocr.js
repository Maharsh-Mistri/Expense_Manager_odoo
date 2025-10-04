const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const testOCR = async () => {
  console.log('Testing OCR.space API directly...\n');

  const apiKey = 'K84203801888957';
  const apiUrl = 'https://api.ocr.space/parse/image';

  // Test with a simple image URL
  const testImageUrl = 'https://api.ocr.space/Content/Images/receipt-ocr-original.jpg';

  try {
    console.log('Sending test request to OCR.space...');
    
    const response = await axios.post(apiUrl, {
      url: testImageUrl,
      apikey: apiKey,
      language: 'eng',
      isOverlayRequired: false,
      OCREngine: 2
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });

    console.log('Response received!');
    console.log('Exit Code:', response.data.OCRExitCode);
    console.log('Is Error:', response.data.IsErroredOnProcessing);
    
    if (response.data.ParsedResults) {
      console.log('Text extracted:', response.data.ParsedResults[0].ParsedText.substring(0, 200));
      console.log('\n✅ OCR API is working correctly!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testOCR();
