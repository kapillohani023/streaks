import { SsCard } from "@/components/ui/SsCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-10">
      <SsCard variant="elevated" padding="lg" className="w-full max-w-2xl">
        <Link
          href="/signin"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">Last updated: May 6, 2026</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              By accessing or using Streaks, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, do not
              use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              2. Description of Service
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Streaks helps you track daily habits and keep an encrypted
              personal journal. AI-assisted features are available to help
              you reflect on your progress.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              3. User Accounts
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              You must sign in with a valid Google account. You are
              responsible for all activity under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              4. Journal Encryption &amp; Passphrase Responsibility
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Journal entries are encrypted in your browser using AES-256-GCM
              with a key derived from a passphrase you choose. The
              passphrase is never sent to or stored by Streaks. You are
              solely responsible for remembering your passphrase. If you
              lose it, the corresponding entries are permanently
              unreadable, and we cannot assist in their recovery.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              5. Acceptable Use
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              You agree not to:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-base text-foreground">
              <li>Use the service for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorized access to other users&apos;
                accounts or data
              </li>
              <li>Abuse or overload the service infrastructure</li>
              <li>
                Generate content that violates third-party rights or
                applicable laws
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              6. Intellectual Property
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              You retain ownership of the streaks and journal entries you
              create. Streaks retains ownership of the platform, its code,
              and its design.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              7. Limitation of Liability
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Streaks is provided &quot;as is&quot; without warranties of
              any kind. We are not liable for any damages arising from your
              use of the service, including but not limited to loss of
              journal entries following passphrase loss.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              8. Termination
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              We reserve the right to suspend or terminate your account at
              any time for violation of these terms. You may delete your
              account and data at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              9. Changes to Terms
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              We may update these terms from time to time. Continued use of
              the service after changes constitutes acceptance of the
              updated terms.
            </p>
          </section>
        </div>
      </SsCard>
    </div>
  );
}
