import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-950/40 border border-red-500/50 rounded-lg text-white max-w-lg mx-auto my-12" role="alert">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-red-300 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
