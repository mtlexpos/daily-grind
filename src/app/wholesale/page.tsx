import type { Metadata } from "next";
import InquiryForm, { type Field } from "@/components/InquiryForm";
import { submitWholesale } from "@/lib/inquiries";

export const metadata: Metadata = {
  title: "Wholesale · Daily Grind",
  description:
    "Serve Daily Grind at your café, office, or shop. Apply for a wholesale account and our team will be in touch.",
};

const benefits = [
  {
    title: "Roasted to order",
    text: "We roast on a schedule built around your volume, so every bag arrives fresh.",
  },
  {
    title: "Tiered pricing",
    text: "Wholesale rates that scale with your order size, with no hidden fees.",
  },
  {
    title: "A real partner",
    text: "Dialed-in brew guides, training, and a dedicated contact for your account.",
  },
];

const fields: Field[] = [
  {
    name: "business",
    label: "Business name",
    required: true,
    placeholder: "Corner Café Co.",
  },
  { name: "name", label: "Contact name", required: true, placeholder: "Jane Doe" },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "you@business.com",
  },
  { name: "phone", label: "Phone", type: "tel", placeholder: "(555) 123-4567" },
  {
    name: "location",
    label: "City / region",
    required: true,
    placeholder: "Montréal, QC",
  },
  {
    name: "volume",
    label: "Estimated monthly volume",
    type: "select",
    options: [
      "Under 10 lb",
      "10–25 lb",
      "25–50 lb",
      "50–100 lb",
      "100 lb+",
    ],
  },
  {
    name: "message",
    label: "Tell us about your business",
    type: "textarea",
    placeholder: "What you serve, where you're located, and what you're looking for.",
  },
];

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Wholesale
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Pour Daily Grind at your place
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-foreground/70">
          Cafés, restaurants, offices, and shops — serve coffee you&apos;re proud
          of. Apply below and our wholesale team will reach out to set up your
          account.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-amber-900/10 bg-amber-900/[0.02] p-6 dark:border-amber-100/10 dark:bg-amber-100/[0.03]"
          >
            <h2 className="font-semibold">{b.title}</h2>
            <p className="mt-2 text-sm text-foreground/70">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight">Apply for an account</h2>
        <p className="mt-2 text-foreground/70">
          Tell us a little about your business — fields marked{" "}
          <span className="text-amber-700">*</span> are required.
        </p>
        <div className="mt-8">
          <InquiryForm
            action={submitWholesale}
            fields={fields}
            submitLabel="Submit application"
            successTitle="Application received"
          />
        </div>
      </div>
    </div>
  );
}
