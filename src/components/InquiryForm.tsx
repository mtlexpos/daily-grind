"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/inquiries";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  /** Span both columns on the sm+ grid. */
  full?: boolean;
  /** Options for a select field. */
  options?: string[];
};

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const initialState: FormState = { ok: false };

const inputClass =
  "mt-1.5 w-full rounded-xl border border-amber-900/15 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-amber-700 dark:border-amber-100/15 dark:focus:border-amber-400";

export default function InquiryForm({
  action,
  fields,
  submitLabel,
  successTitle = "You're all set",
}: {
  action: Action;
  fields: Field[];
  submitLabel: string;
  successTitle?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-amber-700/40 bg-amber-700/[0.06] p-8 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-amber-700 text-lg text-amber-50">
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold">{successTitle}</h2>
        <p className="mt-2 text-foreground/70">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2" noValidate>
      {fields.map((field) => {
        const error = state.errors?.[field.name];
        const defaultValue = state.values?.[field.name] ?? "";
        return (
          <div
            key={field.name}
            className={field.full || field.type === "textarea" ? "sm:col-span-2" : ""}
          >
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-amber-700"> *</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={5}
                placeholder={field.placeholder}
                defaultValue={defaultValue}
                aria-invalid={Boolean(error)}
                className={inputClass}
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                defaultValue={defaultValue}
                aria-invalid={Boolean(error)}
                className={inputClass}
              >
                <option value="">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                defaultValue={defaultValue}
                aria-invalid={Boolean(error)}
                className={inputClass}
              />
            )}

            {error && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {state.message && !state.ok && (
        <p
          aria-live="polite"
          className="sm:col-span-2 rounded-xl border border-red-600/30 bg-red-600/[0.06] px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {pending ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
