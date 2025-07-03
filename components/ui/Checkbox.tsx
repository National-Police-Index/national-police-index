import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
  labelClassName?: string;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  className = '',
  labelClassName = '',
}: CheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
      />
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
    </div>
  );
}
