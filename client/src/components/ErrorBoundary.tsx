// Route-level error boundary: renders a real, accessible error state instead
// of a blank screen when a child component throws during render.
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches render-time errors in its subtree and shows a recovery message. */
export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="card status-message status-message--error" role="alert">
          <h2>An unexpected error occurred</h2>
          <p className="muted">We were unable to load this section. Try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
