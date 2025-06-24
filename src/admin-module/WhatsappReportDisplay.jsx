import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-4 text-center">
          Error: {this.state.errorMessage}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WhatsappReportDisplay({ response }) {
  if (!response || !response.success) {
    return response?.message ? (
      <div className="bg-red-100 border border-red-300 text-red-800 rounded-md p-4 text-center">
        {response.message.includes('E11000 duplicate key error')
          ? 'Duplicate report detected. This report already exists.'
          : response.message || 'No report data available.'}
      </div>
    ) : null;
  }

  const {
    message = 'Report successfully generated.',
    processed_batches = [],
    report = {},
  } = response;
  const createdBatches = processed_batches.filter(b => b?.status === 'new');
  const skipped = processed_batches.filter(b => b?.status === 'skipped');
  const existing = processed_batches.filter(b => b?.status === 'existing');

  // Parse and format the message
  const formatMessage = msg => {
    const locationMatch = msg.match(/location '([^']+)'/);
    const dateMatch = msg.match(/week '([^']+)'/);

    let formattedMessage = msg;
    if (locationMatch && locationMatch[1]) {
      const formattedLocation =
        locationMatch[1].charAt(0).toUpperCase() +
        locationMatch[1].slice(1).toLowerCase();
      formattedMessage = formattedMessage.replace(
        `location '${locationMatch[1]}'`,
        `location <span class="font-bold">${formattedLocation}</span>`
      );
    }
    if (dateMatch && dateMatch[1]) {
      const formattedDate = dateMatch[1].replace('_to_', ' to ');
      formattedMessage = formattedMessage.replace(
        `week '${dateMatch[1]}'`,
        `week <span class="font-bold">${formattedDate}</span>`
      );
    }
    return formattedMessage;
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8 mt-8">
        <div
          className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-center font-medium"
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />

        {createdBatches.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Created Reports
            </h3>
            <div className="space-y-6">
              {createdBatches.map(batch => (
                <div
                  key={batch.batch}
                  className="bg-gray-50 rounded-md border border-gray-200 p-4"
                >
                  <h4 className="text-base font-medium text-gray-700 mb-3">
                    {batch?.batch || 'Unknown Batch'}
                  </h4>
                  <div className="text-sm text-gray-600">
                    {batch?.message || 'No message provided'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {existing.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Existing Reports
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {existing.map((b, i) => (
                <li key={i}>
                  <strong>{b?.batch || 'Unknown Batch'}</strong>:{' '}
                  {b?.message || 'No message provided'}
                </li>
              ))}
            </ul>
          </section>
        )}

        {skipped.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Skipped Reports
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {skipped.map((b, i) => (
                <li key={i}>
                  <strong>{b?.batch || 'Unknown Batch'}</strong>:{' '}
                  {b?.message || 'No message provided'}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </ErrorBoundary>
  );
}
