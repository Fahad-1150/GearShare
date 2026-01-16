import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}

      <input
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />

      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
};

export default Input;
