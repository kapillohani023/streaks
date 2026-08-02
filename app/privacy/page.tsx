import { SsCard } from "@/components/ui/SsCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="text-muted-foreground mb-6 text-sm">
          Last updated: May 6, 2026
        </p>

        <div className="space-y-6">
          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              1. Information We Collect
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              When you use Streaks, we collect:
            </p>
            <ul className="text-foreground mt-2 list-inside list-disc space-y-1 text-base">
              <li>
                <span className="font-medium">Account information</span> &mdash;
                your name, email, and profile picture from Google Sign-In
              </li>
              <li>
                <span className="font-medium">Streak data</span> &mdash; the
                streaks you create and your daily check-ins
              </li>
              <li>
                <span className="font-medium">Journal entries</span> &mdash;
                stored as ciphertext only; the date title and timestamp are
                stored in plaintext
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              2. How We Use Your Information
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Your information is used to:
            </p>
            <ul className="text-foreground mt-2 list-inside list-disc space-y-1 text-base">
              <li>Authenticate your identity and manage your account</li>
              <li>Display your streaks, progress, and journal entries</li>
              <li>
                Power optional AI features via the T2A API at{" "}
                <a
                  href="https://t2a.kapillohani.site"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://t2a.kapillohani.site
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              3. Journal Entries
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Journal entries are stored as plain text in our database and are
              readable by anyone with administrative access to it. They are
              transmitted over HTTPS and are only served back to your
              authenticated account, but they are not end-to-end encrypted.
              Please keep this in mind when writing sensitive information. You
              can permanently delete any entry at any time from the journal.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              4. Data Storage
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Your data is stored in a secured PostgreSQL database. We do not
              sell, share, or distribute your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              5. Third-Party Services
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              Streaks integrates with:
            </p>
            <ul className="text-foreground mt-2 list-inside list-disc space-y-1 text-base">
              <li>
                <span className="font-medium">Google OAuth</span> &mdash; for
                authentication
              </li>
              <li>
                <span className="font-medium">T2A API</span> &mdash; messages
                you send to AI features are forwarded to{" "}
                <a
                  href="https://t2a.kapillohani.site"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://t2a.kapillohani.site
                </a>{" "}
                to generate responses. Journal entries are never sent to AI
                providers.
              </li>
            </ul>
            <p className="text-foreground mt-2 text-base leading-relaxed">
              These services have their own privacy policies. We encourage you
              to review them.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              6. Data Deletion
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              You can delete your streaks and journal entries at any time from
              the app. Deleting your account removes all associated data.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              7. Security
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              We take reasonable measures to protect your data. However, no
              system is completely secure and we cannot guarantee absolute
              protection.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              8. Changes to This Policy
            </h2>
            <p className="text-foreground text-base leading-relaxed">
              We may update this privacy policy from time to time. Changes will
              be reflected on this page with an updated date. Continued use of
              the service constitutes acceptance of the revised policy.
            </p>
          </section>
        </div>
      </SsCard>
    </div>
  );
}
