import React, { useState, useContext } from 'react';
import expenseService from '../../services/expenseService';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ExpenseSubmission = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    amount: '',
    currency: user?.company?.currency || 'USD',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setReceipt(file);
    setError('');
    
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setReceipt(null);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed');
        setReceipt(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    if (!receipt) {
      setError('Please select a receipt image first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setOcrProcessing(true);
    setError('');
    setMessage('');
    
    const ocrFormData = new FormData();
    ocrFormData.append('receipt', receipt);

    try {
      const token = localStorage.getItem('token');
      console.log('Sending OCR request...');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/ocr/process`,
        ocrFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('OCR Response:', response.data);

      // Update form with extracted data
      setFormData({
        ...formData,
        amount: response.data.amount || formData.amount,
        description: response.data.description || formData.description,
        date: response.data.date || formData.date,
      });

      setMessage(`✅ Receipt processed! Extracted: $${response.data.amount || 'N/A'}. Please review and adjust if needed.`);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('OCR error:', error);
      const errorMsg = error.response?.data?.message || 'OCR processing failed. Please enter details manually.';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const submitFormData = new FormData();
    submitFormData.append('amount', formData.amount);
    submitFormData.append('currency', formData.currency);
    submitFormData.append('category', formData.category);
    submitFormData.append('description', formData.description);
    submitFormData.append('date', formData.date);
    
    if (receipt) {
      submitFormData.append('receipt', receipt);
    }

    try {
      console.log('Submitting expense...');
      const response = await expenseService.submitExpense(submitFormData);
      console.log('Expense submitted:', response);
      
      setMessage('Expense submitted successfully! 🎉');
      setFormData({
        amount: '',
        currency: user?.company?.currency || 'USD',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setReceipt(null);
      setPreviewUrl(null);
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Submit expense error:', error);
      setError(error.response?.data?.message || 'Failed to submit expense. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Travel: '✈️',
      Food: '🍔',
      Accommodation: '🏨',
      'Office Supplies': '📎',
      Entertainment: '🎬',
      Other: '📋',
    };
    return icons[category] || '📋';
  };

  return (
    <div className="expense-submission-container">
      <div className="submission-header">
        <h2>💰 Submit New Expense</h2>
        <p className="subtitle">Fill in the details or upload a receipt for automatic extraction</p>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="submission-layout">
        <div className="form-section">
          <form onSubmit={handleSubmit} className="expense-form-modern">
            <div className="form-group">
              <label>
                Amount <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">💵</span>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  disabled={submitting || ocrProcessing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Currency <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="currency"
                  placeholder="USD"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  disabled={submitting || ocrProcessing}
                />
              </div>

              <div className="form-group">
                <label>
                  Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  disabled={submitting || ocrProcessing}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Category <span className="required">*</span>
              </label>
              <div className="category-grid">
                {['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Entertainment', 'Other'].map(
                  (cat) => (
                    <label key={cat} className="category-option">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={formData.category === cat}
                        onChange={handleChange}
                        disabled={submitting || ocrProcessing}
                      />
                      <span className="category-card">
                        <span className="category-icon">{getCategoryIcon(cat)}</span>
                        <span className="category-name">{cat}</span>
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Enter expense description..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                disabled={submitting || ocrProcessing}
              />
            </div>

            <button type="submit" className="btn-submit-expense" disabled={submitting || ocrProcessing}>
              {submitting ? '⏳ Submitting...' : '✅ Submit Expense'}
            </button>
          </form>
        </div>

        <div className="receipt-section">
          <div className="receipt-upload-card">
            <h3>📸 Upload Receipt (Optional)</h3>
            <p className="receipt-subtitle">Upload a receipt to auto-fill expense details using OCR</p>

            <div className="upload-area">
              {previewUrl ? (
                <div className="preview-container">
                  <img src={previewUrl} alt="Receipt preview" className="receipt-preview" />
                  <button
                    type="button"
                    className="btn-remove-receipt"
                    onClick={() => {
                      setReceipt(null);
                      setPreviewUrl(null);
                    }}
                    disabled={submitting || ocrProcessing}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    style={{ display: 'none' }}
                    disabled={submitting || ocrProcessing}
                  />
                  <div className="upload-placeholder">
                    <div className="upload-icon">📁</div>
                    <p>Click to upload or drag and drop</p>
                    <small>PNG, JPG or PDF (max. 10MB)</small>
                  </div>
                </label>
              )}
            </div>

            {receipt && (
              <button
                type="button"
                className="btn-ocr"
                onClick={handleOCR}
                disabled={ocrProcessing || submitting}
              >
                {ocrProcessing ? '🔄 Processing OCR...' : '🤖 Extract Data with OCR'}
              </button>
            )}
          </div>

          <div className="info-card">
            <h4>💡 Tips</h4>
            <ul>
              <li>Upload clear, well-lit receipt images</li>
              <li>OCR will auto-extract amount, date, and merchant</li>
              <li>Review extracted data before submitting</li>
              <li>Include detailed descriptions for faster approval</li>
              <li>Supported formats: JPEG, PNG, PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSubmission;
