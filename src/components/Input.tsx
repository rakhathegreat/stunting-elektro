import type { ChangeEventHandler, ReactNode } from 'react';

interface InputProps {
  name: string;
  placeholder: string;
  className?: string;
  type?: string;
  value?: string | number | null;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  disabled?: boolean;
  prefix?: ReactNode;
}

const Input = ({
  name,
  placeholder,
  className = '',
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  prefix,
}: InputProps) => {
  const inputId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {name}
      </label>
      <div className="relative">
        {prefix ? <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{prefix}</div> : null}
        <input
          type={type}
          id={inputId}
          name={inputId}
          className={`block w-full rounded-lg border border-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            prefix ? 'pl-10' : ''
          } ${className}`.trim()}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default Input;
