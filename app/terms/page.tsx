import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service | Streaks",
    description: "Read the terms and conditions for using Streaks.",
};

export default function TermsOfService() {
    const lastUpdated = "January 26, 2026";

    return (
        <div className="min-h-screen bg-white pb-24 font-sans text-gray-900 selection:bg-black selection:text-white">
            <div className="mx-auto max-w-3xl px-6 pt-16">
                <Link
                    href="/signin"
                    className="group mb-12 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-black"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Back to Sign In
                </Link>

                <header className="mb-16">
                    <div className="mb-4 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-bold tracking-widest text-gray-500 uppercase">
                        Legal
                    </div>
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-black sm:text-6xl">
                        Terms of Service
                    </h1>
                    <div className="h-1 w-20 bg-black mb-6"></div>
                    <p className="text-lg font-medium text-gray-400">Last updated: {lastUpdated}</p>
                </header>

                <div className="space-y-10 leading-relaxed text-gray-700">
                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using <strong>Streaks</strong>, you agree to be bound by these Terms
                            of Service and all applicable laws and regulations. If you do not agree with any of
                            these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">2. Use License</h2>
                        <p>
                            Permission is granted to use Streaks for personal, non-commercial use. This is the
                            grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="mt-4 list-inside list-disc space-y-2">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose;</li>
                            <li>Attempt to decompile or reverse engineer any software contained in Streaks;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">3. Disclaimer</h2>
                        <p>
                            The materials on Streaks are provided on an 'as is' basis. Streaks makes no
                            warranties, expressed or implied, and hereby disclaims and negates all other
                            warranties including, without limitation, implied warranties or conditions of
                            merchantability, fitness for a particular purpose, or non-infringement of
                            intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">4. Limitations</h2>
                        <p>
                            In no event shall Streaks or its suppliers be liable for any damages (including,
                            without limitation, damages for loss of data or profit, or due to business
                            interruption) arising out of the use or inability to use Streaks, even if Streaks or
                            a Streaks authorized representative has been notified orally or in writing of the
                            possibility of such damage.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">5. Content Accuracy</h2>
                        <p>
                            The materials appearing on Streaks could include technical, typographical, or
                            photographic errors. Streaks does not warrant that any of the materials on its website
                            are accurate, complete or current. Streaks may make changes to the materials contained
                            on its website at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">6. Links</h2>
                        <p>
                            Streaks has not reviewed all of the sites linked to its website and is not responsible
                            for the contents of any such linked site. The inclusion of any link does not imply
                            endorsement by Streaks of the site. Use of any such linked website is at the user's
                            own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">7. Modifications</h2>
                        <p>
                            Streaks may revise these terms of service for its website at any time without notice.
                            By using this website you are agreeing to be bound by the then current version of
                            these terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">8. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws
                            and you irrevocably submit to the exclusive jurisdiction of the courts in that State
                            or location.
                        </p>
                    </section>

                    <footer className="border-t border-gray-100 pt-10 text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Streaks. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
