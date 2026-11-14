"use client";

import { useState, type ChangeEvent, type FocusEvent, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  signupSchema,
  type SignupFieldErrors,
  type SignupInput,
} from "@/lib/validations/signup";

type Field = keyof SignupInput;

const initialValues: SignupInput = { username: "", email: "", password: "" };

const passwordChecks = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase", test: (v: string) => /[a-z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
];

const strengthColors = [
  "bg-zinc-700",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-emerald-500",
];

function validate(values: SignupInput): SignupFieldErrors {
  const result = signupSchema.safeParse(values);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

export default function SignupPage() {
  const router = useRouter();
  const [values, setValues] = useState<SignupInput>(initialValues);
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const passed = passwordChecks.filter((c) => c.test(values.password)).length;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    setServerError(null);
    if (touched[e.target.name as Field]) setErrors(validate(next));
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(values));
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });

    const result = signupSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.message ?? "Something went wrong. Try again.");
        setStatus("idle");
        return;
      }

      // Keep the button in its loading state while navigating away.
      router.replace("/onboarding");
    } catch {
      setServerError("Network error. Check your connection and try again.");
      setStatus("idle");
    }
  }

  const fieldError = (name: Field) => (touched[name] ? errors[name]?.[0] : undefined);

  return (
    <AuthShell>
      <>
          <div className="mb-8">
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-sm text-zinc-400">Join in seconds. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <AuthInput
              label="Username"
              name="username"
              placeholder="johndoe"
              autoComplete="username"
              value={values.username}
              error={fieldError("username")}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={values.email}
              error={fieldError("email")}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <div>
              <AuthInput
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={values.password}
                error={fieldError("password")}
                onChange={handleChange}
                onBlur={handleBlur}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                }
              />

              {values.password && (
                <div className="mt-3">
                  <div className="flex gap-1.5">
                    {passwordChecks.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i < passed ? strengthColors[passed] : "bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
                    {passwordChecks.map((c) => {
                      const ok = c.test(values.password);
                      return (
                        <li
                          key={c.label}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            ok ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-zinc-600"}`} />
                          {c.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative mt-2 flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:shadow-violet-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-violet-400 transition hover:text-violet-300">
              Sign in
            </Link>
          </p>
      </>
    </AuthShell>
  );
}
