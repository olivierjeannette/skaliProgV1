'use client';

import { ThemeProvider } from 'next-themes';
import { ErrorLoggerInit, ErrorBoundary } from './error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorLoggerInit />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ThemeProvider>
  );
}
