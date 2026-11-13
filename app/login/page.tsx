"use client";

import { useState, type ChangeEvent, type FocusEvent, type SubmitEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  loginSchema,
  type LoginFieldErrors,
  type LoginInput,
} from "@/lib/validations/login";

type Field = keyof LoginInput;

const initialValues: LoginInput = { identifier: "", password: "" };

function validate(values: LoginInput): LoginFieldErrors {
  const result = loginSchema.safeParse(values);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

export default function LoginPage() {
  const [values, setValues] = useState<LoginInput>(initialValues);
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [username, setUsername] = useState("");

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
    setTouched({ identifier: true, password: true });

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/login", {
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

      setUsername(data.user?.username ?? "");
      setStatus("success");
    } catch {
      setServerError("Network error. Check your connection and try again.");
      setStatus("idle");
    }
  }

  const fieldError = (name: Field) => (touched[name] ? errors[name]?.[0] : undefined);

  return (
    <AuthShell>
      {status === "success" ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
            <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {username}!</h1>
          <p className="mt-2 text-sm text-zinc-400">You&apos;re signed in.</p>
          <Link
            href="/"
            className="mt-8 inline-block text-sm font-medium text-violet-400 transition hover:text-violet-300"
          >
            Go to home
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-zinc-400">Sign in to continue to your account.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <AuthInput
              label="Email or username"
              name="identifier"
              placeholder="you@example.com"
              autoComplete="username"
              value={values.identifier}
              error={fieldError("identifier")}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <AuthInput
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-violet-400 transition hover:text-violet-300">
              Create one
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
