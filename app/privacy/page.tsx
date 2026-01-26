import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | Streaks",
    description: "Learn how we handle your data and privacy at Streaks.",
};

export default function PrivacyPolicy() {
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
                        Privacy Policy
                    </h1>
                    <div className="h-1 w-20 bg-black mb-6"></div>
                    <p className="text-lg font-medium text-gray-400">Last updated: {lastUpdated}</p>
                </header>

                <div className="space-y-10 leading-relaxed text-gray-700">
                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">Introduction</h2>
                        <p>
                            Welcome to <strong>Streaks</strong>. We are committed to protecting your personal
                            information and your right to privacy. If you have any questions or concerns about our
                            policy or our practices with regards to your personal information, please contact us.
                        </p>
                        <p className="mt-4">
                            When you use our application, you trust us with your personal information. We take
                            your privacy very seriously. In this privacy policy, we seek to explain to you in the
                            clearest way possible what information we collect, how we use it, and what rights you
                            have in relation to it.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">Information We Collect</h2>
                        <p>
                            We collect personal information that you provide to us when you sign in through Google
                            OAuth. This includes:
                        </p>
                        <ul className="mt-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Account Data:</strong> We collect your name, email address, and profile
                                picture provided by Google to create and manage your account.
                            </li>
                            <li>
                                <strong>App Data:</strong> We collect and store the data you input into the app,
                                specifically your habits, streaks, and completion history.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">How We Use Your Information</h2>
                        <p>We use the information we collect or receive:</p>
                        <ul className="mt-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>To facilitate account creation and logon process:</strong> We use the
                                information you allowed us to collect from Google to facilitate the creation of your
                                account and the logon process.
                            </li>
                            <li>
                                <strong>To provide the service:</strong> We use your habit and streak data to
                                display your progress and provide the core functionality of the app.
                            </li>
                            <li>
                                <strong>To improve our service:</strong> We may use your feedback and data (in an
                                anonymized form) to understand usage patterns and enhance the user experience.
                            </li>
                            <li>
                                <strong>AI Features:</strong> If you use our AI features, some of your input data
                                may be processed by Google Gemini to provide intelligent insights and assistance.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">
                            How Your Information Is Shared
                        </h2>
                        <p>
                            We only share information with your consent, to comply with laws, to provide you with
                            services, to protect your rights, or to fulfill business obligations.
                        </p>
                        <ul className="mt-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Third-Party Service Providers:</strong> We use Google for authentication and
                                Google Gemini for AI features. These providers have their own privacy policies.
                            </li>
                            <li>
                                <strong>Hosting:</strong> Our app and database are hosted on secure infrastructure
                                that complies with industry standards.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">Data Retention</h2>
                        <p>
                            We keep your information for as long as necessary to fulfill the purposes outlined in
                            this privacy policy unless otherwise required by law. You can request deletion of
                            your account and data at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">Your Privacy Rights</h2>
                        <p>
                            Depending on your location, you may have certain rights regarding your personal
                            information, such as the right to access, correct, or delete your data. You may
                            exercise these rights by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-2xl font-semibold text-black">Updates To This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. The updated version will be
                            indicated by an updated "Last Updated" date and the updated version will be effective
                            as soon as it is accessible.
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
