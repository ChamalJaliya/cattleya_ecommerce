import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryDevToolsProps {
  initialIsOpen?: boolean;
}

const QueryDevTools: React.FC<QueryDevToolsProps> = ({ initialIsOpen = false }) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <ReactQueryDevtools
      initialIsOpen={initialIsOpen}
    />
  );
};

export default QueryDevTools; 