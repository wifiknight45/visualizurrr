/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time failures in the visualizer subtree so a broken
 * pattern or component shows a recoverable message instead of taking
 * down the whole app.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Visualizer error boundary caught:', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-950 p-6 text-center">
          <p className="text-sm font-medium text-zinc-200">
            The visualizer hit a problem and stopped.
          </p>
          <p className="max-w-md font-mono text-xs text-zinc-500">
            {this.state.error.message}
          </p>
          <button
            onClick={this.handleRetry}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Restart visualizer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
