// State and side effects for the fan assistant conversation. Keeps the page
// component declarative: it renders whatever this hook exposes.
import { useCallback, useState } from 'react';

import { queryMatchGuide, ServiceError } from '../../lib/api.js';
import type { SupportedLanguage } from '../../lib/api-types.js';

/** A single turn in the assistant conversation. */
export interface DialogEntry {
  id: string;
  role: 'fan' | 'assistant';
  text: string;
}

interface UseMatchGuideOutput {
  dialogs: DialogEntry[];
  locale: SupportedLanguage;
  isLoading: boolean;
  error: string | null;
  setLocale: (locale: SupportedLanguage) => void;
  queryGuide: (question: string) => Promise<void>;
}

function makeUniqueId(): string {
  return crypto.randomUUID();
}

/** Manages the assistant conversation, language selection and request state. */
export function useMatchGuide(): UseMatchGuideOutput {
  const [dialogs, setDialogs] = useState<DialogEntry[]>([]);
  const [locale, setLocale] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryGuide = useCallback(
    async (question: string): Promise<void> => {
      const cleanText = question.trim();
      if (cleanText === '' || isLoading) {
        return;
      }
      setError(null);
      setIsLoading(true);
      setDialogs((prev) => [...prev, { id: makeUniqueId(), role: 'fan', text: cleanText }]);
      try {
        const result = await queryMatchGuide(cleanText, locale);
        setDialogs((prev) => [...prev, { id: makeUniqueId(), role: 'assistant', text: result.answer }]);
      } catch (caught) {
        const message =
          caught instanceof ServiceError
            ? caught.message
            : 'The assistant is unavailable right now. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [locale, isLoading],
  );

  return { dialogs, locale, isLoading, error, setLocale, queryGuide };
}
