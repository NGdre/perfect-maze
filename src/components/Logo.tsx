export default function Logo({ logoText }: { logoText: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-primary-500">
        <svg
          className="h-7 w-7"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 3h7v7H3z" className="stroke-accent-500"></path>
          <path d="M14 3h7v7h-7z"></path>
          <path d="M14 14h7v7h-7z"></path>
          <path d="M3 14h7v7H3z"></path>
        </svg>
      </div>
      <h1 className="from-primary-600 to-accent-600 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-wide text-transparent">
        {logoText}
      </h1>
    </div>
  );
}
