 import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          'https://restcountries.com/v3.1/all?fields=name,currencies'
        );
        setCountries(response.data);
      } catch (err) {
        console.error('Failed to fetch countries');
      }
    };
    fetchCountries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password, country);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={country} onChange={(e) => setCountry(e.target.value)} required>
          <option value="">Select Country</option>
          {countries.map((c, index) => (
            <option key={index} value={c.name.common}>
              {c.name.common}
            </option>
          ))}
        </select>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;

