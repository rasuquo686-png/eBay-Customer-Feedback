import React, { useMemo, useRef, useState } from 'react';
import { ChipMultiSelect } from './components/ChipMultiSelect';
import { FormField } from './components/FormField';
import { RadioPills } from './components/RadioPills';
import { RatingScale } from './components/RatingScale';
import { TextAreaField } from './components/TextAreaField';
import { ThankYou } from './components/ThankYou';
import { INITIAL_FORM_STATE, QUESTIONS } from './config/questions';
import type {
  FeedbackFormState,
  FeedbackPayload,
  FormErrors,
  QuestionConfig,
  QuestionId,
} from './types/feedback';

// Apps Script Web App URL ending in /exec for persisting feedback in Google Sheets.
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyFRbEhqQ4_dMzsIVbr9wMaeMGx0CoMChobOYj6g1Jr89TLMNreqKlmUp4KL9OSxXCs/exec';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function countNonSpaceChars(value: string): number {
  return value.replace(/\s+/g, '').length;
}

function validateQuestion(
  question: QuestionConfig,
  state: FeedbackFormState
): string | undefined {
  switch (question.type) {
    case 'rating': {
      const val = state[question.id as 'Q1' | 'Q3' | 'Q7'];
      // Q3 allows 0, so check explicitly for null rather than falsiness.
      if (question.required && val === null) {
        return 'This question is required';
      }
      return undefined;
    }
    case 'textarea': {
      const val = state[question.id as 'Q2' | 'Q4' | 'Q6' | 'Q9' | 'Q11'];
      if (!question.required) return undefined;
      const nonSpace = countNonSpaceChars(val);
      if (nonSpace === 0) {
        return 'This question is required';
      }
      if (nonSpace < 3) {
        return 'Please enter at least 3 non-space characters';
      }
      return undefined;
    }
    case 'radio-pills': {
      const val = state.Q5;
      if (question.required && !val) {
        return 'This question is required';
      }
      return undefined;
    }
    case 'select': {
      const val = state.Q10;
      if (question.required && !val) {
        return 'This question is required';
      }
      return undefined;
    }
    case 'email': {
      const trimmed = state.Q12.trim();
      if (trimmed.length > 0 && !EMAIL_REGEX.test(trimmed)) {
        return 'Please enter a valid email address';
      }
      return undefined;
    }
    case 'chip-multi':
      return undefined;
  }
}

function isRequiredQuestionAnswered(
  question: QuestionConfig,
  state: FeedbackFormState
): boolean {
  return validateQuestion(question, state) === undefined;
}

export default function App() {
  const [formState, setFormState] =
    useState<FeedbackFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fieldRefs = useRef<
    Partial<
      Record<
        QuestionId,
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
      >
    >
  >({});

  const requiredQuestions = useMemo(
    () => QUESTIONS.filter((q) => q.required),
    []
  );

  const answeredRequiredCount = useMemo(
    () =>
      requiredQuestions.filter((q) => isRequiredQuestionAnswered(q, formState))
        .length,
    [requiredQuestions, formState]
  );

  const progressPercentage = Math.round(
    (answeredRequiredCount / requiredQuestions.length) * 100
  );

  const syncFieldError = (
    questionId: QuestionId,
    nextState: FeedbackFormState
  ) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const nextError = validateQuestion(question, nextState);
      if (nextError === prev[questionId]) return prev;
      const updated = { ...prev };
      if (nextError) {
        updated[questionId] = nextError;
      } else {
        delete updated[questionId];
      }
      return updated;
    });
  };

  const updateField = <K extends keyof FeedbackFormState>(
    key: K,
    value: FeedbackFormState[K],
    questionId?: QuestionId
  ) => {
    setFormState((prev) => {
      const nextState = { ...prev, [key]: value };
      if (questionId) {
        syncFieldError(questionId, nextState);
      }
      return nextState;
    });
  };

  const handleFieldBlur = (question: QuestionConfig) => {
    const error = validateQuestion(question, formState);
    setErrors((prev) => {
      const updated = { ...prev };
      if (error) {
        updated[question.id] = error;
      } else {
        delete updated[question.id];
      }
      return updated;
    });
  };

  const handleFieldsetBlur = (
    event: React.FocusEvent<HTMLFieldSetElement>,
    question: QuestionConfig
  ) => {
    // Only validate when focus leaves the entire fieldset group, not between options inside it.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    handleFieldBlur(question);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setHasSubmittedAttempt(true);
    setSubmitError(null);

    const validationErrors: FormErrors = {};
    let firstInvalidId: QuestionId | null = null;

    for (const question of QUESTIONS) {
      const err = validateQuestion(question, formState);
      if (err) {
        validationErrors[question.id] = err;
        if (!firstInvalidId) {
          firstInvalidId = question.id;
        }
      }
    }

    setErrors(validationErrors);

    if (firstInvalidId) {
      const containerEl = document.getElementById(
        `${firstInvalidId}-container`
      );
      const inputEl = fieldRefs.current[firstInvalidId];
      containerEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        inputEl?.focus({ preventScroll: true });
      }, 150);
      return;
    }

    const q8Formatted = formState.Q8.map((option) => {
      if (option === 'Other') {
        const trimmedOther = formState.Q8OtherText.trim();
        return trimmedOther ? `Other: ${trimmedOther}` : 'Other';
      }
      return option;
    });

    const payload: FeedbackPayload = {
      Q1: formState.Q1 as number,
      Q2: formState.Q2.trim(),
      Q3: formState.Q3 as number,
      Q4: formState.Q4.trim(),
      Q5: formState.Q5,
      Q6: formState.Q6.trim(),
      Q7: formState.Q7 as number,
      Q8: q8Formatted,
      Q9: formState.Q9.trim(),
      Q10: formState.Q10,
      Q11: formState.Q11.trim(),
      Q12: formState.Q12.trim(),
      website: formState.website,
    };

    setIsSubmitting(true);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
    } catch {
      setSubmitError(
        'Something went wrong. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormState(INITIAL_FORM_STATE);
    setErrors({});
    setHasSubmittedAttempt(false);
    setSubmitError(null);
    setIsSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#191919]">
      {/* Header */}
      <header className="bg-[#FFFFFF] border-b border-[#E5E5E5]">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 pt-3.5 pb-3">
          <div className="flex items-center gap-4 sm:gap-5">
            <a
              href="https://www.ebay.com"
              target="_blank"
              rel="noopener"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#86A5FF] rounded"
            >
              <img
                src="https://i.ibb.co/4RDMc9Qg/download.png"
                alt="eBay"
                style={{ height: '48px', width: 'auto' }}
              />
            </a>
            <span className="text-xl sm:text-[26px] font-normal text-[#191919] tracking-tight">
              Customer Feedback
            </span>
          </div>

          <nav aria-label="Breadcrumb" className="mt-2.5 text-xs text-[#707070]">
            <ol className="flex items-center gap-1.5">
              <li>
                <a
                  href="https://www.ebay.com"
                  target="_blank"
                  rel="noopener"
                  className="hover:underline text-[#707070] hover:text-[#191919] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#86A5FF] rounded"
                >
                  Home
                </a>
              </li>
              <li aria-hidden="true">&gt;</li>
              <li aria-current="page" className="text-[#191919]">
                Customer Feedback
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* Pale-blue Hero Band */}
      <section className="bg-[#D3E3FD]">
        <div className="max-w-[720px] mx-auto px-4 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#191919] leading-tight">
            How was your eBay experience?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#191919]">
            Sharing your feedback takes about 3 minutes and helps us improve
            shopping on eBay.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-6 sm:py-8">
        {isSubmitted ? (
          <ThankYou onReset={handleReset} />
        ) : (
          <>
            {/* Slim Progress Indicator */}
            <div className="mb-6" aria-live="polite">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#707070] mb-2">
                <span className="tabular-nums">
                  {answeredRequiredCount} of {requiredQuestions.length} required
                  questions answered
                </span>
                <span className="tabular-nums">{progressPercentage}%</span>
              </div>
              <div
                className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={answeredRequiredCount}
                aria-valuemin={0}
                aria-valuemax={requiredQuestions.length}
                aria-label="Required questions progress"
              >
                <div
                  className="h-full bg-[#3665F3] transition-all duration-200 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Validation Summary Banner */}
            {hasSubmittedAttempt && errorCount > 0 && (
              <div
                role="alert"
                className="mb-6 rounded-[16px] border border-[#C6382E] bg-[#FDF3F2] px-4 py-3.5 text-sm text-[#C6382E]"
              >
                <p className="font-bold">
                  Please check {errorCount}{' '}
                  {errorCount === 1 ? 'question' : 'questions'} highlighted
                  below before submitting.
                </p>
              </div>
            )}

            {/* Submission Network Error Banner */}
            {submitError && (
              <div
                role="alert"
                className="mb-6 rounded-[16px] border border-[#C6382E] bg-[#FDF3F2] px-4 py-3.5 text-sm font-medium text-[#C6382E]"
              >
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Visually hidden honeypot field for bot protection */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
              >
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formState.website}
                  onChange={(e) => updateField('website', e.target.value)}
                />
              </div>

              {QUESTIONS.map((q) => {
                const error = errors[q.id];
                const describedBy =
                  [
                    q.helperText ? `${q.id}-helper` : undefined,
                    error ? `${q.id}-error` : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined;

                if (q.type === 'rating') {
                  const ratingKey = q.id as 'Q1' | 'Q3' | 'Q7';
                  return (
                    <FormField
                      key={q.id}
                      id={q.id}
                      question={q.question}
                      required={q.required}
                      helperText={q.helperText}
                      error={error}
                      as="fieldset"
                      onFieldBlur={(e) => handleFieldsetBlur(e, q)}
                    >
                      <RatingScale
                        id={q.id}
                        min={q.min}
                        max={q.max}
                        minLabel={q.minLabel}
                        maxLabel={q.maxLabel}
                        value={formState[ratingKey]}
                        onChange={(val) => updateField(ratingKey, val, q.id)}
                        hasError={Boolean(error)}
                        describedBy={describedBy}
                        firstInputRef={(el) => {
                          fieldRefs.current[q.id] = el;
                        }}
                      />
                    </FormField>
                  );
                }

                if (q.type === 'textarea') {
                  const textKey = q.id as 'Q2' | 'Q4' | 'Q6' | 'Q9' | 'Q11';
                  return (
                    <FormField
                      key={q.id}
                      id={q.id}
                      question={q.question}
                      required={q.required}
                      helperText={q.helperText}
                      error={error}
                      htmlFor={q.id}
                    >
                      <TextAreaField
                        id={q.id}
                        rows={q.rows}
                        maxLength={q.maxLength}
                        value={formState[textKey]}
                        onChange={(val) => updateField(textKey, val, q.id)}
                        onBlur={() => handleFieldBlur(q)}
                        hasError={Boolean(error)}
                        describedBy={describedBy}
                        placeholder={q.placeholder}
                        inputRef={(el) => {
                          fieldRefs.current[q.id] = el;
                        }}
                      />
                    </FormField>
                  );
                }

                if (q.type === 'radio-pills') {
                  return (
                    <FormField
                      key={q.id}
                      id={q.id}
                      question={q.question}
                      required={q.required}
                      helperText={q.helperText}
                      error={error}
                      as="fieldset"
                      onFieldBlur={(e) => handleFieldsetBlur(e, q)}
                    >
                      <RadioPills
                        id={q.id}
                        options={q.options}
                        value={formState.Q5}
                        onChange={(val) => updateField('Q5', val, q.id)}
                        hasError={Boolean(error)}
                        describedBy={describedBy}
                        firstInputRef={(el) => {
                          fieldRefs.current[q.id] = el;
                        }}
                      />
                    </FormField>
                  );
                }

                if (q.type === 'chip-multi') {
                  return (
                    <FormField
                      key={q.id}
                      id={q.id}
                      question={q.question}
                      required={q.required}
                      helperText={q.helperText}
                      error={error}
                      as="fieldset"
                    >
                      <ChipMultiSelect
                        id={q.id}
                        options={q.options}
                        exclusiveOption={q.exclusiveOption}
                        otherOption={q.otherOption}
                        selected={formState.Q8}
                        otherText={formState.Q8OtherText}
                        onChangeSelected={(next) => updateField('Q8', next)}
                        onChangeOtherText={(txt) =>
                          updateField('Q8OtherText', txt)
                        }
                      />
                    </FormField>
                  );
                }

                if (q.type === 'select') {
                  return (
                    <FormField
                      key={q.id}
                      id={q.id}
                      question={q.question}
                      required={q.required}
                      helperText={q.helperText}
                      error={error}
                      htmlFor={q.id}
                    >
                      <select
                        ref={(el) => {
                          fieldRefs.current[q.id] = el;
                        }}
                        id={q.id}
                        value={formState.Q10}
                        onChange={(e) =>
                          updateField('Q10', e.target.value, q.id)
                        }
                        onBlur={() => handleFieldBlur(q)}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy}
                        className={`w-full min-h-[48px] px-3.5 py-2.5 bg-white border rounded-[12px] text-base text-[#191919] transition-colors focus:outline-none focus:ring-4 focus:ring-[#86A5FF] ${
                          error
                            ? 'border-[#C6382E] focus:border-[#C6382E]'
                            : 'border-[#C7C7C7] focus:border-[#3665F3]'
                        }`}
                      >
                        <option value="">{q.placeholder}</option>
                        {q.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  );
                }

                return (
                  <FormField
                    key={q.id}
                    id={q.id}
                    question={q.question}
                    required={q.required}
                    helperText={q.helperText}
                    error={error}
                    htmlFor={q.id}
                  >
                    <input
                      ref={(el) => {
                        fieldRefs.current[q.id] = el;
                      }}
                      id={q.id}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={formState.Q12}
                      onChange={(e) => updateField('Q12', e.target.value, q.id)}
                      onBlur={() => handleFieldBlur(q)}
                      placeholder={q.placeholder}
                      aria-invalid={Boolean(error)}
                      aria-describedby={describedBy}
                      className={`w-full min-h-[48px] px-3.5 py-2.5 bg-white border rounded-[12px] text-base text-[#191919] placeholder:text-[#707070] transition-colors focus:outline-none focus:ring-4 focus:ring-[#86A5FF] ${
                        error
                          ? 'border-[#C6382E] focus:border-[#C6382E]'
                          : 'border-[#C7C7C7] focus:border-[#3665F3]'
                      }`}
                    />
                  </FormField>
                );
              })}

              {/* Submit Action */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-h-[48px] px-10 py-3 rounded-full bg-[#3665F3] hover:bg-[#2B50C2] disabled:opacity-70 disabled:cursor-not-allowed text-white text-base font-bold inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#86A5FF]"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit feedback</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] bg-[#FFFFFF] mt-8">
        <div className="max-w-[720px] mx-auto px-4 py-6 text-xs text-[#707070]">
          © eBay Inc. Customer Feedback
        </div>
      </footer>
    </div>
  );
}
