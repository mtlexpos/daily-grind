"use server";

/**
 * Server Actions backing the Contact and Wholesale forms.
 *
 * Validation runs server-side and returns a structured result the client form
 * renders inline.
 *
 * Delivery order of preference:
 *   1. Email via Resend — set RESEND_API_KEY + INQUIRY_TO_EMAIL (and optionally
 *      INQUIRY_FROM_EMAIL; defaults to Resend's onboarding sender). Submissions
 *      are emailed to you.
 *   2. Webhook — set INQUIRY_WEBHOOK_URL (Formspree / Zapier / your own API).
 *   3. Fallback — logged server-side so nothing is lost until 1 or 2 is set.
 */

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Echo back submitted values so the form can repopulate after an error. */
  values?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

const LABELS: Record<string, string> = {
  business: "Business",
  name: "Name",
  email: "Email",
  phone: "Phone",
  location: "City / region",
  volume: "Monthly volume",
  subject: "Subject",
  message: "Message",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Render an inquiry as a simple email (subject + text + html). */
function renderEmail(
  kind: "contact" | "wholesale",
  data: Record<string, string>,
) {
  const heading =
    kind === "wholesale" ? "New wholesale application" : "New contact message";
  const who = data.business || data.name || data.email;
  const subject =
    kind === "wholesale"
      ? `Wholesale application — ${who}`
      : `Contact form — ${data.subject || who}`;

  const rows = Object.entries(data).filter(([, v]) => v);
  const text =
    `${heading}\n\n` +
    rows.map(([k, v]) => `${LABELS[k] ?? k}: ${v}`).join("\n");
  const html =
    `<h2 style="font-family:system-ui,sans-serif">${heading}</h2>` +
    `<table style="font-family:system-ui,sans-serif;border-collapse:collapse">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;vertical-align:top;color:#6b5544;font-weight:600">${
            LABELS[k] ?? k
          }</td><td style="padding:4px 0">${escapeHtml(v).replace(
            /\n/g,
            "<br>",
          )}</td></tr>`,
      )
      .join("") +
    `</table>`;

  return { subject, text, html, replyTo: data.email || undefined };
}

/** Ship an inquiry: email via Resend, else webhook, else log it. */
async function deliverInquiry(
  kind: "contact" | "wholesale",
  data: Record<string, string>,
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;

  // 1. Email via Resend (HTTPS API — no SDK needed).
  if (resendKey && to) {
    const { subject, text, html, replyTo } = renderEmail(kind, data);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM_EMAIL ?? "Daily Grind <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
    }
    return;
  }

  // 2. Generic webhook.
  const webhook = process.env.INQUIRY_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, submittedAt: new Date().toISOString(), ...data }),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Inquiry webhook failed: ${res.status}`);
    }
    return;
  }

  // 3. No destination configured yet — keep a server-side record.
  console.info(`[inquiry:${kind}]`, JSON.stringify(data));
}

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    name: str(formData, "name"),
    email: str(formData, "email"),
    subject: str(formData, "subject"),
    message: str(formData, "message"),
  };

  const errors: Record<string, string> = {};
  if (!values.name) errors.name = "Please tell us your name.";
  if (!values.email) errors.email = "An email is required.";
  else if (!EMAIL_RE.test(values.email)) errors.email = "That email looks off.";
  if (!values.message || values.message.length < 10)
    errors.message = "Please add a little more detail (10+ characters).";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  try {
    await deliverInquiry("contact", values);
  } catch (err) {
    console.error("submitContact delivery failed:", err);
    return {
      ok: false,
      message: "Something went wrong sending your message. Please try again.",
      values,
    };
  }

  return {
    ok: true,
    message: "Thanks for reaching out — we'll get back to you shortly.",
  };
}

export async function submitWholesale(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    business: str(formData, "business"),
    name: str(formData, "name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    location: str(formData, "location"),
    volume: str(formData, "volume"),
    message: str(formData, "message"),
  };

  const errors: Record<string, string> = {};
  if (!values.business) errors.business = "Please add your business name.";
  if (!values.name) errors.name = "Please add a contact name.";
  if (!values.email) errors.email = "An email is required.";
  else if (!EMAIL_RE.test(values.email)) errors.email = "That email looks off.";
  if (!values.location) errors.location = "Where are you based?";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  try {
    await deliverInquiry("wholesale", values);
  } catch (err) {
    console.error("submitWholesale delivery failed:", err);
    return {
      ok: false,
      message: "Something went wrong sending your application. Please try again.",
      values,
    };
  }

  return {
    ok: true,
    message:
      "Thanks! Your wholesale application is in — our team will reach out within 2 business days.",
  };
}
