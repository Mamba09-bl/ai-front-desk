import type { InputHTMLAttributes, ReactNode } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  trailing?: ReactNode;
};

export function AuthInput({ label, name, error, trailing, ...props }: AuthInputProps) {
  const id = `auth-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-lg border bg-zinc-950/60 px-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition outline-none focus:ring-4 ${
            trailing ? "pr-16" : ""
          } ${
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
              : "border-zinc-800 hover:border-zinc-700 focus:border-violet-500 focus:ring-violet-500/15"
          }`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
