import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ÉLANÉ collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-site max-w-3xl py-14">
      <h1 className="text-4xl sm:text-5xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl text-foreground">1. What we collect</h2>
          <p className="mt-2">
            When you place an order we collect your name, phone number, email address, delivery address and payment
            details (processed securely by Paystack and never stored by us). If you create an account, we store your
            profile details and order history.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-foreground">2. How we use it</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Fulfilling and delivering your orders</li>
            <li>Communicating order updates via SMS, WhatsApp or email</li>
            <li>Processing payments and preventing fraud</li>
            <li>Sending marketing messages only if you opt in (unsubscribe any time)</li>
            <li>Improving our store and recommendations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl text-foreground">3. Payments</h2>
          <p className="mt-2">
            Payments are handled by Paystack. Card details are tokenised by Paystack and never pass through our servers.
            Mobile Money numbers are used only for the transaction you requested.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-foreground">4. Sharing</h2>
          <p className="mt-2">
            We never sell your data. We share it only with service providers essential to running the store (delivery
            partners, payment processors, hosting) under strict data-protection terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-foreground">5. Your rights</h2>
          <p className="mt-2">
            You may request a copy of your personal data, correct it, or ask us to delete it. Contact us at{" "}
            <a href={`mailto:${brand.email}`} className="text-champagne-deep underline-offset-2 hover:underline">
              {brand.email}
            </a>{" "}
            and we&apos;ll respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-foreground">6. Cookies</h2>
          <p className="mt-2">
            We use cookies for essential store functions (cart, sign-in). We don&apos;t serve ad-tracking cookies to
            Ghanaian visitors by default.
          </p>
        </section>
      </div>
    </div>
  );
}