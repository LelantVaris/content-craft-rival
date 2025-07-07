
import React from 'react';

const Magic = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m12 1 3 6 6 3-6 3-3 6-3-6-6-3 6-3z"
        fill="currentColor"
      />
      <path
        d="m19 9 1.5 3 3 1.5-3 1.5L19 18l-1.5-3-3-1.5 3-1.5z"
        fill="currentColor"
      />
      <path
        d="m5 15 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Magic;
