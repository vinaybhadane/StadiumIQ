import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from '../src/components/shared/SkipLink';
import { MetricsPanel } from '../src/components/Dashboard/MetricsPanel';
import { WayfindingPanel } from '../src/components/Navigation/WayfindingPanel';
import { AssistPanel } from '../src/components/Assist/AssistPanel';
import { Stadium } from '../src/types';

describe('Accessibility Requirements (WCAG 2.2)', () => {
  test('SkipLink has correct href and target content', () => {
    const { container } = render(<SkipLink />);
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveTextContent('Skip to content');
  });

  test('MetricsPanel includes region role and polite aria-live status', () => {
    const mockStadium: Stadium = {
      stadium_id: 'S1',
      name: 'Test Arena',
      city: 'City',
      total_capacity: 50000,
      zones: [],
      gates: [],
    };

    const { container } = render(<MetricsPanel stadium={mockStadium} />);
    const region = container.querySelector('[role="region"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  test('WayfindingPanel includes proper section aria labelling', () => {
    render(<WayfindingPanel />);
    const heading = screen.getByRole('heading', { name: 'Smart Indoor Navigation (Feature 8)' });
    expect(heading).toBeInTheDocument();
  });

  test('AssistPanel includes proper section aria labelling and language selector label', () => {
    render(<AssistPanel />);
    const selector = screen.getByLabelText('Select Your Profile');
    expect(selector).toBeInTheDocument();
    const langSelector = screen.getByLabelText('Select language');
    expect(langSelector).toBeInTheDocument();
  });
});
