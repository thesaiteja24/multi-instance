import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="max-w-md w-full text-center bg-white shadow-2xl rounded-2xl p-8 border border-red-300">
            <div className="flex justify-center items-center mb-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 text-3xl font-bold flex items-center justify-center rounded-full">
                !
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-700 mb-6">
              An unexpected error occurred. Please try one of the options below.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={this.handleRefresh}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleGoBack}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
