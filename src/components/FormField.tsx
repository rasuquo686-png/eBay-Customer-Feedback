import React from 'react';
import type { QuestionId } from '../types/feedback';

interface FormFieldProps {
  id: QuestionId;
  question: string;
  required: boolean;
  helperText?: string;
  error?: string;
  as?: 'fieldset' | 'div';
  htmlFor?: string;
  onFieldBlur?: (event: React.FocusEvent<HTMLFieldSetElement>) => void;
  children: React.ReactNode;
}

export function FormField({
  id,
  question,
  required,
  helperText,
  error,
  as = 'div',
  htmlFor,
  onFieldBlur,
  children,
}: FormFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const titleContent = (
    <>
      <span className="font-bold text-[#191919] mr-1.5">{id}.</span>
      <span>{question}</span>
      {required ? (
        <span className="text-[#C6382E] ml-1 font-bold" aria-hidden="true">
          *
        </span>
      ) : (
        <span className="text-[#707070] font-normal ml-1.5 text-sm">
          (optional)
        </span>
      )}
    </>
  );

  const cardClasses = `bg-[#F7F7F7] rounded-[16px] p-4 sm:p-6 border transition-colors ${
    error ? 'border-[#C6382E]' : 'border-transparent'
  }`;

  const errorBlock = error ? (
    <p
      id={errorId}
      role="alert"
      className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-[#C6382E]"
    >
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </p>
  ) : null;

  if (as === 'fieldset') {
    return (
      <fieldset
        id={`${id}-container`}
        className={cardClasses}
        onBlur={onFieldBlur}
        aria-describedby={
          [helperId, errorId].filter(Boolean).join(' ') || undefined
        }
      >
        <legend className="block w-full text-base sm:text-[17px] font-semibold leading-snug text-[#191919] mb-1">
          {titleContent}
        </legend>
        {helperText && (
          <p id={helperId} className="text-sm text-[#707070] mb-3.5">
            {helperText}
          </p>
        )}
        <div className={helperText ? '' : 'mt-3'}>{children}</div>
        {errorBlock}
      </fieldset>
    );
  }

  return (
    <div id={`${id}-container`} className={cardClasses}>
      <label
        htmlFor={htmlFor}
        className="block text-base sm:text-[17px] font-semibold leading-snug text-[#191919] mb-1 cursor-pointer"
      >
        {titleContent}
      </label>
      {helperText && (
        <p id={helperId} className="text-sm text-[#707070] mb-3">
          {helperText}
        </p>
      )}
      <div className={helperText ? '' : 'mt-3'}>{children}</div>
      {errorBlock}
    </div>
  );
}
