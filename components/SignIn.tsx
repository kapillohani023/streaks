import { signIn, auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/shared/BrandMark";
import { MonoLabel } from "@/components/ui/SsMono";

/** Google's mark as a single path, so it takes the button's ink colour. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="currentColor"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex h-full items-center justify-center px-4">
      {/* Two nested frames rather than one: the 2px gutter between them is the
          only ornament on the page, and it sets the instrument-panel tone
          before a single word is read. */}
      <div className="border-border bg-panel ss-animate-page-in w-full max-w-[400px] rounded-xl border p-0.5">
        <div className="border-divider rounded-[10px] border px-7 py-8">
          <div className="mb-7 flex items-center gap-2.5">
            <BrandMark size={36} glow />
            <div>
              <div className="text-foreground font-mono text-sm font-bold tracking-[0.18em]">
                STREAKS
              </div>
              <MonoLabel className="tracking-[0.12em]">HABIT SYSTEM</MonoLabel>
            </div>
          </div>

          <div className="mb-7 flex flex-col gap-1.5">
            <h1 className="text-foreground m-0 text-[22px] font-bold tracking-[-0.02em]">
              Consistency, measured.
            </h1>
            <p className="text-soft m-0 text-sm">
              Track daily habits, keep the chain alive, and see every day of the
              year at a glance.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="border-foreground bg-foreground text-background flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border px-5 py-3 text-[15px] font-semibold transition-all duration-200 ease-out hover:shadow-[0_0_24px_var(--glow-30)] active:scale-[0.98]"
            >
              <GoogleGlyph />
              Continue with Google
            </button>
          </form>

          <div className="text-faint mt-6 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.1em]">
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              TERMS
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              PRIVACY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
