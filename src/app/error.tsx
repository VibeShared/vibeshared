"use client";

import { useEffect } from "react";
import style from '@/styles/componenet/Home/Error.module.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-gray-100  text-center">
       <div className={`${style.err}`} >
         <h1 className="text-3xl font-bold mt-5 text-red-600">⚠️ Oops! Something went wrong.</h1>
        <p className="mt-2 text-gray-700">{error.message}</p>

        <button
          onClick={() => reset()}
          className="mt-5 px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
       </div>
      </body>
    </html>
  );
}
