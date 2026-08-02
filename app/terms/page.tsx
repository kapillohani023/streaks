import { SsCard } from "@/components/ui/SsCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="bg-background flex min-h-screen items-start justify-center px-4 py-10">
      <SsCard variant="elevated" padding="lg" className="w-full max-w-2xl">
        <Link
          href="/signin"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight">
          Terms of Service
        </h1>

        <p className="text-muted-foreground mb-6 text-sm">
          Last updated: May 6, 2026
        </p>

        <div className="space-y-6">
          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              1. Acceptance of Terms
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              By accessing or using Streaks, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, do not use
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              2. Description of Service
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Streaks helps you track daily habits and keep a personal journal.
              AI-assisted features are available to help you reflect on your
              progress.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              3. User Accounts
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              You must sign in with a valid Google account. You are responsible
              for all activity under your account.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              4. Journal Content
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Journal entries are stored as plain text and are not end-to-end
              encrypted. You are responsible for what you choose to write, and
              deleting an entry is permanent &mdash; deleted entries cannot be
              recovered.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              5. Acceptable Use
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              You agree not to:
            </p>
            <ul className="text-foreground mt-2 list-inside list-disc space-y-1 text-base">
              <li>Use the service for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorized access to other users&apos;
                accounts or data
              </li>
              <li>Abuse or overload the service infrastructure</li>
              <li>
                Generate content that violates third-party rights or applicable
                laws
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              6. Intellectual Property
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              You retain ownership of the streaks and journal entries you
              create. Streaks retains ownership of the platform, its code, and
              its design.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              7. Limitation of Liability
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Streaks is provided &quot;as is&quot; without warranties of any
              kind. We are not liable for any damages arising from your use of
              the service, including but not limited to loss of streaks or
              journal entries.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              8. Termination
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              We reserve the right to suspend or terminate your account at any
              time for violation of these terms. You may delete your account and
              data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              9. Changes to Terms
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </SsCard>
    </div>
  );
}
