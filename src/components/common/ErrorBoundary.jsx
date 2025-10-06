import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to logging service in production
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-500 bg-opacity-20 rounded-full mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title and Message */}
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-400 text-center mb-6">
              We're sorry for the inconvenience. The application encountered an
              unexpected error.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 bg-slate-900 rounded-lg p-4 border border-red-500 border-opacity-30">
                <p className="text-xs font-mono text-red-400 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs font-mono text-slate-400">
                    <summary className="cursor-pointer hover:text-slate-300">
                      Stack trace
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Support Info */}
            <p className="mt-6 text-center text-sm text-slate-500">
              If the problem persists, please contact your system administrator.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
