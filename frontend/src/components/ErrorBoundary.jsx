import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            An unexpected error occurred
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            Something went wrong. Please try again or return to the dashboard.
          </p>
          {this.state.error && (
            <p className="text-xs text-slate-400 font-mono bg-slate-100 rounded-lg p-2 mb-6 text-left break-all">
              {this.state.error.message}
            </p>
          )}
          <button onClick={this.handleReset} className="btn-primary mx-auto">
            <RefreshCw className="w-4 h-4" />Back to dashboard
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
