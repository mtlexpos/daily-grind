import type { Metadata } from "next";
import InquiryForm, { type Field } from "@/components/InquiryForm";
import { submitContact } from "@/lib/inquiries";

export const metadata: Metadata = {
  title: "Contact · Daily Grind",
  description:
    "Questions about your order, our beans, or anything else? Send the Daily Grind team a message.",
};

const fields: Field[] = [
  { name: "name", label: "Your name", required: true, placeholder: "Jane Doe" },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    name: "subject",
    label: "Subject",
    full: true,
    placeholder: "What's this about?",
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    placeholder: "How can we help?",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Contact
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Get in touch
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-foreground/70">
          Questions about an order, our roasts, or wholesale? Drop us a line and
          we&apos;ll get back to you, usually within a business day.
        </p>
      </div>

      <div className="mt-12">
        <InquiryForm
          action={submitContact}
          fields={fields}
          submitLabel="Send message"
          successTitle="Message sent"
        />
      </div>
    </div>
  );
}
