export type QuestionId =
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'Q6'
  | 'Q7'
  | 'Q8'
  | 'Q9'
  | 'Q10'
  | 'Q11'
  | 'Q12';

export type QuestionInputType =
  | 'rating'
  | 'textarea'
  | 'radio-pills'
  | 'chip-multi'
  | 'select'
  | 'email';

export interface BaseQuestionConfig {
  id: QuestionId;
  question: string;
  required: boolean;
  helperText?: string;
}

export interface RatingQuestionConfig extends BaseQuestionConfig {
  type: 'rating';
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface TextAreaQuestionConfig extends BaseQuestionConfig {
  type: 'textarea';
  rows: number;
  maxLength: number;
  placeholder?: string;
}

export interface RadioPillsQuestionConfig extends BaseQuestionConfig {
  type: 'radio-pills';
  options: readonly string[];
}

export interface ChipMultiQuestionConfig extends BaseQuestionConfig {
  type: 'chip-multi';
  options: readonly string[];
  exclusiveOption: string;
  otherOption: string;
}

export interface SelectQuestionConfig extends BaseQuestionConfig {
  type: 'select';
  placeholder: string;
  options: readonly string[];
}

export interface EmailQuestionConfig extends BaseQuestionConfig {
  type: 'email';
  placeholder?: string;
}

export type QuestionConfig =
  | RatingQuestionConfig
  | TextAreaQuestionConfig
  | RadioPillsQuestionConfig
  | ChipMultiQuestionConfig
  | SelectQuestionConfig
  | EmailQuestionConfig;

export interface FeedbackFormState {
  Q1: number | null;
  Q2: string;
  Q3: number | null;
  Q4: string;
  Q5: string;
  Q6: string;
  Q7: number | null;
  Q8: string[];
  Q8OtherText: string;
  Q9: string;
  Q10: string;
  Q11: string;
  Q12: string;
  website: string;
}

export interface FeedbackPayload {
  Q1: number;
  Q2: string;
  Q3: number;
  Q4: string;
  Q5: string;
  Q6: string;
  Q7: number;
  Q8: string[];
  Q9: string;
  Q10: string;
  Q11: string;
  Q12: string;
  website: string;
}

export type FormErrors = Partial<Record<QuestionId, string>>;
