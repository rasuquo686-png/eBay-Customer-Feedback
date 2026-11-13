import React from 'react';

interface RatingScaleProps {
  id: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  value: number | null;
  onChange: (value: number) => void;
  hasError?: boolean;
  describedBy?: string;
  firstInputRef?: React.Ref<HTMLInputElement>;
}

export function RatingScale({
  id,
  min,
  max,
  minLabel,
  maxLabel,
  value,
  onChange,
  hasError = false,
  describedBy,
  firstInputRef,
}: RatingScaleProps) {
  const numbers: number[] = [];
  for (let n = min; n <= max; n += 1) {
    numbers.push(n);
  }

  // Use 6 columns on mobile for 0-10 (row 1: 0-5, row 2: 6-10) and 5 columns for 1-5.
  const gridClass =
    numbers.length === 11
      ? 'grid grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-2'
      : 'grid grid-cols-5 gap-2 sm:gap-3';

  return (
    <div>
      <div className={gridClass} role="radiogroup" aria-invalid={hasError}>
        {numbers.map((num, idx) => {
          const isSelected = value === num;
          const inputId = `${id}-opt-${num}`;
          return (
            <label
              key={num}
              htmlFor={inputId}
              className="relative block cursor-pointer select-none"
            >
              <input
                ref={idx === 0 ? firstInputRef : undefined}
                id={inputId}
                type="radio"
                name={id}
                value={num}
                checked={isSelected}
                onChange={() => onChange(num)}
                aria-invalid={hasError}
                aria-describedby={describedBy}
                className="sr-only peer"
              />
              <span
                className={`flex items-center justify-center w-full min-h-[48px] min-w-[44px] rounded-[12px] border text-base font-bold tabular-nums transition-colors duration-150 peer-focus-visible:ring-4 peer-focus-visible:ring-[#86A5FF] peer-focus-visible:outline-none ${
                  isSelected
                    ? 'bg-[#3665F3] border-[#3665F3] text-white'
                    : 'bg-white border-[#C7C7C7] text-[#191919] hover:border-[#3665F3] hover:text-[#3665F3]'
                }`}
              >
                {num}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex items-start justify-between gap-4 mt-2.5 text-xs sm:text-sm text-[#707070]">
        <span>{minLabel}</span>
        <span className="text-right">{maxLabel}</span>
      </div>
    </div>
  );
}
