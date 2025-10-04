import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CompanySettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    companyName: user?.company?.name || '',
    country: user?.company?.country || '',
    currency: user?.company?.currency || '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement company settings update API
    setMessage('Company settings updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="company-settings-container">
      <h2>🏢 Company Settings</h2>
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            value={settings.country}
            onChange={(e) => setSettings({ ...settings, country: e.target.value })}
            required
            disabled
          />
        </div>

        <div className="form-group">
          <label>Currency</label>
          <input
            type="text"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            required
            disabled
          />
        </div>

        <button type="submit" className="btn-submit">
          💾 Save Settings
        </button>
      </form>
    </div>
  );
};

export default CompanySettings;
