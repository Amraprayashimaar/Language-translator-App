import React from 'react';

const TextInput = ({ label, value, onChange }) => {
  return (
    <div>
      <label>{label}</label>
      <textarea
        rows="5"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default TextInput;