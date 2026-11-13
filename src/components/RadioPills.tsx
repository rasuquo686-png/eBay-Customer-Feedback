import React from 'react';

interface RadioPillsProps {
  id: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  describedBy?: string;
  firstInputRef?: React.Ref<HTMLInputElement>;
}

export function RadioPills({
  id,
  options,
  value,
  onChange,
  hasError = false,
  describedBy,
  firstInputRef,
}: RadioPillsProps) {
  return (
    <div
      className="flex flex-wrap gap-3"
      role="radiogroup"
      aria-invalid={hasError}
    >
      {options.map((option, idx) => {
        const isSelected = value === option;
        const inputId = `${id}-opt-${idx}`;
        return (
          <label
            key={option}
            htmlFor={inputId}
            className="relative cursor-pointer select-none flex-1 min-w-[96px] sm:flex-none"
          >
            <input
              ref={idx === 0 ? firstInputRef : undefined}
              id={inputId}
              type="radio"
              name={id}
              value={option}
              checked={isSelected}
              onChange={() => onChange(option)}
              aria-invalid={hasError}
              aria-describedby={describedBy}
              className="sr-only peer"
            />
            <span
              className={`flex items-center justify-center gap-2 min-h-[48px] px-6 py-2.5 rounded-full border text-sm sm:text-base font-semibold transition-colors duration-150 peer-focus-visible:ring-4 peer-focus-visible:ring-[#86A5FF] peer-focus-visible:outline-none ${
                isSelected
                  ? 'bg-[#3665F3] border-[#3665F3] text-white'
                  : 'bg-white border-[#C7C7C7] text-[#191919] hover:border-[#3665F3] hover:text-[#3665F3]'
              }`}
            >
              {isSelected && (
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{option}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
