"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold">An unexpected error occurred</h1>

          <p className="text-sm text-gray-600">
            An error occurred while loading the page. Try refreshing the page or going back to the homepage.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium"
            >
              Retry
            </button>

            <a
              href="/"
              className="px-4 py-2 rounded-full border text-sm font-medium"
            >
              Home Page
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
