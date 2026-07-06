import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12" role="status" aria-label="Loading content">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-505"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
