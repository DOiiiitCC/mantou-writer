export function BunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* steam left */}
      <path d="M8 3c-.5-1-1.8-1-2 0" opacity="0.6" />
      {/* steam middle */}
      <path d="M12 2v2" opacity="0.8" />
      {/* steam right */}
      <path d="M16 3c.5-1 1.8-1 2 0" opacity="0.6" />
      {/* bun body — dome top */}
      <path d="M5 14c0-4 3.5-6.5 7-6.5s7 2.5 7 6.5" />
      {/* bun bottom */}
      <path d="M4 14h16c0 3-2.5 5.5-5.5 5.5h-5C7 19.5 4 17 4 14z" />
      {/* pleat lines */}
      <path d="M9 9c.5-1 1.5-1.5 2.5-1" opacity="0.4" />
    </svg>
  );
}
