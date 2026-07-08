import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MatchGuidePage } from '../../../src/features/assistant/AssistantPage.js';
import * as api from '../../../src/lib/api.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MatchGuidePage', () => {
  it('sends a typed question and renders the grounded answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'queryMatchGuide').mockResolvedValue({
      answer: 'Use Gate 6 for step-free access.',
      language: 'en',
      cached: false,
    });

    render(<MatchGuidePage />);
    await user.type(screen.getByLabelText('Enter your question'), 'Where is the accessible entrance?');
    await user.click(screen.getByRole('button', { name: 'Ask SmartStadium' }));

    const conversation = await screen.findByRole('list', { name: 'Conversation' });
    expect(within(conversation).getByText('Use Gate 6 for step-free access.')).toBeInTheDocument();
  });

  it('runs a quick action without typing', async () => {
    const user = userEvent.setup();
    const ask = vi.spyOn(api, 'queryMatchGuide').mockResolvedValue({
      answer: 'The prayer room is on Level 2.',
      language: 'en',
      cached: false,
    });

    render(<MatchGuidePage />);
    await user.click(screen.getByRole('button', { name: /multi-faith space/i }));

    await waitFor(() => {
      expect(ask).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('The prayer room is on Level 2.')).toBeInTheDocument();
  });

  it('shows an accessible error when the assistant fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'queryMatchGuide').mockRejectedValue(
      new api.ServiceError('GEMINI_UNAVAILABLE', 'The AI service is temporarily unavailable.'),
    );

    render(<MatchGuidePage />);
    await user.type(screen.getByLabelText('Enter your question'), 'hello');
    await user.click(screen.getByRole('button', { name: 'Ask SmartStadium' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('temporarily unavailable');
  });

  it('passes the selected language through to the API', async () => {
    const user = userEvent.setup();
    const ask = vi.spyOn(api, 'queryMatchGuide').mockResolvedValue({
      answer: 'La Puerta 6 es accesible.',
      language: 'es',
      cached: false,
    });

    render(<MatchGuidePage />);
    await user.selectOptions(screen.getByLabelText('Response language'), 'es');
    await user.type(screen.getByLabelText('Enter your question'), 'acceso accesible');
    await user.click(screen.getByRole('button', { name: 'Ask SmartStadium' }));

    await waitFor(() => {
      expect(ask).toHaveBeenCalledWith('acceso accesible', 'es');
    });
  });
});
