import { SsCard } from "@/components/ui/SsCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">Last updated: May 6, 2026</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              When you use Streaks, we collect:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-base text-foreground">
              <li>
                <span className="font-medium">Account information</span>{" "}
                &mdash; your name, email, and profile picture from Google
                Sign-In
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
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Your information is used to:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-base text-foreground">
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
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              3. Journal Encryption
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Journal entries are encrypted in your browser before being sent
              to our servers, using AES-256-GCM with a key derived from your
              passphrase via PBKDF2-SHA256 (200,000 iterations) and a
              per-entry random salt and IV. Your passphrase is never
              transmitted to or stored by Streaks. We cannot read your
              entries, and if you lose your passphrase they cannot be
              recovered.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              4. Data Storage
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Your data is stored in a secured PostgreSQL database. We do not
              sell, share, or distribute your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              5. Third-Party Services
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              Streaks integrates with:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-base text-foreground">
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
                to generate responses. Encrypted journal ciphertext is never
                sent to AI providers.
              </li>
            </ul>
            <p className="mt-2 text-base leading-relaxed text-foreground">
              These services have their own privacy policies. We encourage
              you to review them.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              6. Data Deletion
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              You can delete your streaks and journal entries at any time
              from the app. Deleting your account removes all associated
              data.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              7. Security
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              We take reasonable measures to protect your data. However, no
              system is completely secure and we cannot guarantee absolute
              protection.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              8. Changes to This Policy
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              We may update this privacy policy from time to time. Changes
              will be reflected on this page with an updated date. Continued
              use of the service constitutes acceptance of the revised
              policy.
            </p>
          </section>
        </div>
      </SsCard>
    </div>
  );
}
