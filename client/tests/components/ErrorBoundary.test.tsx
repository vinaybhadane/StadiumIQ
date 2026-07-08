import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppErrorBoundary } from '../../src/components/ErrorBoundary.js';

function Bomb(): React.JSX.Element {
  throw new Error('boom');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AppErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <AppErrorBoundary>
        <p>safe content</p>
      </AppErrorBoundary>,
    );
    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('shows an accessible recovery message when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred');
  });
});
