 import React, { useState } from 'react';
import axios from 'axios';

const ReceiptUpload = ({ onDataExtracted }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/ocr/process`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onDataExtracted(response.data);
      setMessage('Receipt processed successfully!');
    } catch (error) {
      setMessage('Failed to process receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receipt-upload">
      <h3>Upload Receipt for OCR</h3>
      {message && <div className="message">{message}</div>}
      <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Process Receipt'}
      </button>
    </div>
  );
};

export default ReceiptUpload;

