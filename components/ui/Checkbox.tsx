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
  labelClassName = 'text-sm font-medium text-gray-700',
}: CheckboxProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
    </div>
  );
}
