import React from 'react';

interface TextAreaFieldProps {
  id: string;
  rows: number;
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  describedBy?: string;
  placeholder?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}

export function TextAreaField({
  id,
  rows,
  maxLength,
  value,
  onChange,
  onBlur,
  hasError = false,
  describedBy,
  placeholder,
  inputRef,
}: TextAreaFieldProps) {
  return (
    <div>
      <textarea
        ref={inputRef}
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={`w-full px-3.5 py-3 bg-white border rounded-[12px] text-base text-[#191919] placeholder:text-[#707070] resize-y transition-colors focus:outline-none focus:ring-4 focus:ring-[#86A5FF] ${
          hasError
            ? 'border-[#C6382E] focus:border-[#C6382E]'
            : 'border-[#C7C7C7] focus:border-[#3665F3]'
        }`}
      />
      <div className="flex justify-end mt-1.5">
        <span
          className="text-xs text-[#707070] tabular-nums"
          aria-live="polite"
        >
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
