import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssistPanel } from '../src/components/Assist/AssistPanel';

// Mock hook
vi.mock('../src/hooks/useAssist', () => ({
  useAssist: () => ({
    assistResponse: {
      response_text: 'Translated Hindi message',
      detected_language: 'hi',
      persona_type: 'fan',
      source: 'gemini',
    },
    askAssistant: vi.fn().mockResolvedValue({}),
    isLoading: false,
    error: null,
  }),
}));

describe('AssistPanel Component', () => {
  test('renders query inputs and selectors', () => {
    render(<AssistPanel />);
    expect(screen.getByText('AI Multilingual Assistant (Feature 9)')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Your Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Preferred Language')).toBeInTheDocument();
  });

  test('displays detected language and replies after asking', async () => {
    render(<AssistPanel />);

    const profileSelect = screen.getByLabelText('Select Your Profile');
    fireEvent.change(profileSelect, { target: { value: 'volunteer' } });

    const langSelect = screen.getByLabelText('Select language');
    fireEvent.change(langSelect, { target: { value: 'hi' } });

    const input = screen.getByPlaceholderText('e.g. Namaste! Gate 1 kidhar hai?');
    fireEvent.change(input, { target: { value: 'Namaste!' } });

    const button = screen.getByRole('button', { name: 'Ask Assistant' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Detected Language: HI')).toBeInTheDocument();
      expect(screen.getByText('Translated Hindi message')).toBeInTheDocument();
    });
  });
});
