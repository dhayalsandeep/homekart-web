'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { buttonClass } from '@/components/ui/button';
import { StatePanel } from '@/components/ui/states';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[homekart] route error', error);
  }, [error]);

  return (
    <div className="shell py-16">
      <h1 className="mb-5 font-display text-3xl font-bold">Something went wrong</h1>
      <StatePanel
        tone="error"
        title="This page could not be rendered"
        description={
          error.digest
            ? `The failure was logged with reference ${error.digest}. The technical message is in the server console.`
            : 'The technical message is in the server console.'
        }
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reset} className={buttonClass('primary', 'md')}>
              Try again
            </button>
            <Link href="/" className={buttonClass('secondary', 'md')}>
              Back to home
            </Link>
          </div>
        }
      />
    </div>
  );
}
