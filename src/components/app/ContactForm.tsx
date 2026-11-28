"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { useToast } from "../ToastProvider";

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function ContactForm() {
  const { toast } = useToast();
  const [state, setState] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof state, value: string) {
    setState((s) => ({ ...s, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    setSending(false);

    if (res.status === 422) {
      const data = await res.json();
      setErrors(data.errors ?? {});
      toast({ kind: "error", title: "A couple of things to fix", description: "Check the highlighted fields." });
      return;
    }
    if (!res.ok) {
      toast({ kind: "error", title: "Message not sent", description: "Please try again in a moment." });
      return;
    }
    setSent(true);
    toast({ kind: "success", title: "Message sent", description: "Thank you — we read every one." });
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-emerald-500" />
        <h2 className="text-xl font-extrabold">Got it, thank you</h2>
        <p className="max-w-sm text-sm muted">
          Your note is safely with us. We usually reply within a couple of days — no autoresponder chains.
        </p>
        <button type="button" className="btn-secondary" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="contact-name"
          label="Your name"
          value={state.name}
          error={errors.name}
          onChange={(v) => update("name", v)}
          autoComplete="name"
        />
        <Field
          id="contact-email"
          label="Email"
          type="email"
          value={state.email}
          error={errors.email}
          onChange={(v) => update("email", v)}
          autoComplete="email"
        />
      </div>
      <Field
        id="contact-subject"
        label="Subject"
        value={state.subject}
        error={errors.subject}
        onChange={(v) => update("subject", v)}
      />
      <div>
        <label htmlFor="contact-message" className="label">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={state.message}
          onChange={(e) => update("message", e.target.value)}
          maxLength={2000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
          className="field resize-y"
          placeholder="Tell us what's on your mind — feature ideas, bugs, or just a hello."
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.message ? (
            <p id="contact-message-error" role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-300">
              {errors.message}
            </p>
          ) : (
            <p id="contact-message-hint" className="text-xs muted">
              Up to 2000 characters.
            </p>
          )}
          <span className="text-xs muted">{state.message.length}/2000</span>
        </div>
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={state.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={sending}>
        <Send aria-hidden="true" className="h-4 w-4" />
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
