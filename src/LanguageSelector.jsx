import React from 'react';

const LanguageSelector = ({ label, value, onChange, languages }) => {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange}>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;