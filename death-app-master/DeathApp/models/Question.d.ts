interface BaseQuestion {
  id: string; // DB unique id
  displayText: string; // Display string to be used as header
  type: string; // Enum: text, number, date, multiple choice, boolean
  category: 'ONBOARDING' | 'FIRST_STEPS' | 'GRIEF_AND_SELF_CARE' | 'FUNERAL_AND_CEREMONIES' | 'LEGAL_AND_FINANCIAL' | 'LIFE_ADMIN';
  isDefault: boolean;
  extraInfo: string;
}

interface Option {
  id: number;
  name: string;
}

interface QuestionText extends BaseQuestion {
  type: 'STRING';
  subText?: string; // Subtext to display below the question
  placeholderText: string; // Placeholder text, if applicable
}

interface QuestionDate extends BaseQuestion {
  type: 'DATE';
}

interface QuestionNumber extends BaseQuestion {
  type: 'NUMBER';
}

interface QuestionMultiSelect extends BaseQuestion {
  type: 'MULTI_SELECT';
  subText?: string; // Subtext to display below the question
  options: Option[];
  triggerTasks: { templateId: string, triggerValue: number[] }[];
  triggerQuestions: { questionId: string; triggerValue: number[] }[];
}

interface QuestionSingleSelect extends BaseQuestion {
  type: 'SINGLE_SELECT';
  subText?: string; // Subtext to display below the question
  options: Option[];
  triggerTasks: { templateId: string, triggerValue: number }[]; // TODO Do we need a special "ANY" trigger value?
  triggerQuestions: { questionId: string; triggerValue: number }[];
}

interface QuestionBoolean extends BaseQuestion {
  type: 'BOOLEAN';
  // If the answer value === triggerValue, add a task using the given templateId
  triggerTasks: { templateId: string, triggerValue: boolean }[];
  // If the answer value === triggerValue, show the question with the given questionId
  triggerQuestions: { questionId: string; triggerValue: boolean }[]; 
  // If the answer value === triggerValue, add an entity with the given entityId
  triggerEntities: { templateId: string; triggerValue: boolean }[];
}

type Question =
  | QuestionText
  | QuestionDate
  | QuestionMultiSelect
  | QuestionSingleSelect
  | QuestionBoolean
  | QuestionNumber;
