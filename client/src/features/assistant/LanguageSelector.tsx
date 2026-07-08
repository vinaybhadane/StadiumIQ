// Language selector for the assistant. A labelled native <select> so it is
// keyboard-complete and screen-reader friendly with no custom widget code.
import type { SupportedLanguage } from '../../lib/api-types.js';
import { LOCALE_CHOICES } from './assistant-content.js';

interface LocalePickerProps {
  value: SupportedLanguage;
  onChange: (locale: SupportedLanguage) => void;
  disabled: boolean;
}

/** Accessible dropdown for choosing the assistant's answer language. */
export function LocalePicker({
  value,
  onChange,
  disabled,
}: LocalePickerProps): React.JSX.Element {
  return (
    <div>
      <label className="field-label" htmlFor="assistant-language">
        Response language
      </label>
      <select
        id="assistant-language"
        className="select-input"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value as SupportedLanguage);
        }}
      >
        {LOCALE_CHOICES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
