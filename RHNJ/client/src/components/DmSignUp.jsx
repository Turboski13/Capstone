import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DmSignUp } from '../functions/userFunctions'; // Adjust import based on your file structure */

export default function DmSignUpComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const newDM = { username, password, email };
      await DmSignUp(newDM); // Make sure this function exists in your userFunctions
      navigate('/dm-home'); // Redirect to DM home after successful signup
    } catch (err) {
      const errorMessage = err.response
        ? err.response.data
        : 'Signup failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h2>DM Signup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='username'>Username:</label>
          <input
            type='text'
            id='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='email'>Email:</label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type='submit'>Sign Up</button>
      </form>
    </div>
  );
}
