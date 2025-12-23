
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>}
      <input 
        className={`w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-medium placeholder:text-gray-400 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
};

export default Input;
