// Static UI content for the fan assistant: supported languages and the
// quick-action prompts shown as chips.
import type { SupportedLanguage } from '../../lib/api-types.js';

/** A language option offered in the assistant's language selector. */
export interface LocaleChoice {
  code: SupportedLanguage;
  label: string;
}

/** Languages the assistant answers in (native names for recognisability). */
export const LOCALE_CHOICES: LocaleChoice[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
];

/** One-tap questions covering navigation, accessibility and transport. */
export const SUGGESTED_QUERIES: string[] = [
  'Which entry gate serves seat section 150?',
  'How do I find a step-free path to wheelchair zones?',
  'Where is the multi-faith space located?',
  'What is the route to the local light rail station?',
  'Where are the clean drinking water fountains?',
];
