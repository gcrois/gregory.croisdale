import React, { useState } from 'react';
import RandExp from 'randexp';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [currentRegex, setCurrentRegex] = useState('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=.{12,})[A-Za-z\\d@#$%^&+=!]{12,64}$');
  const [selectedOption, setSelectedOption] = useState('strong');

  const regexOptions = [
    {
      value: 'strong',
      regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=.{12,})[A-Za-z\\d@#$%^&+=!]{12,64}$',
      label: 'Strong Password',
      description: 'At least 12 characters, max 64. Includes uppercase, lowercase, number, and special character.'
    },
    {
      value: 'very-strong',
      regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=.{16,})[A-Za-z\\d@#$%^&+=!]{16,128}$',
      label: 'Very Strong Password',
      description: 'At least 16 characters, max 128. Includes uppercase, lowercase, number, and special character.'
    },
    {
      value: 'memorable',
      regex: '^([A-Z][a-z]{6,12}){3}\\d{2,4}[@#$%^&+=!]{1,2}$',
      label: 'Memorable Password',
      description: '3 capitalized words (6-12 chars each), followed by 2-4 digits and 1-2 special characters.'
    },
    {
      value: 'pin',
      regex: '\\d{6}',
      label: 'PIN',
      description: '6-digit PIN number.'
    },
  ];

  const generatePassword = () => {
    try {
      const randexp = new RandExp(new RegExp(currentRegex));
      setPassword(randexp.gen());
    } catch (error) {
      setPassword('Invalid regex pattern');
    }
  };

  const handleRegexChange = (e) => {
    setCurrentRegex(e.target.value);
    setSelectedOption('custom');
  };

  const handleOptionChange = (e) => {
    const selected = regexOptions.find(option => option.value === e.target.value);
    setSelectedOption(selected.value);
    setCurrentRegex(selected.regex);
  };

  return (
    <div>
      <h2>Password Generator</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="regexInput">Custom Regex Pattern:</label>
        <input
          id="regexInput"
          type="text"
          value={currentRegex}
          onChange={handleRegexChange}
          style={{ width: '100%', padding: '5px', marginTop: '5px' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Preset Patterns:</h3>
        {regexOptions.map((option) => (
          <div key={option.value} style={{ marginBottom: '10px' }}>
            <input
              type="radio"
              id={option.value}
              name="regexOption"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={handleOptionChange}
            />
            <label htmlFor={option.value} style={{ marginLeft: '10px' }}>
              <strong>{option.label}</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>{option.description}</p>
            </label>
          </div>
        ))}
      </div>
      
      <button 
        onClick={generatePassword} 
        style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}
      >
        Generate Password
      </button>
      
      {password && (
        <div style={{ marginTop: '20px' }}>
          <h3>Generated Password:</h3>
          <p style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '5px', 
            wordBreak: 'break-all' 
          }}>
            {password}
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;