import { signIn, auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { SsCard } from "@/components/ui/SsCard";
import { SsButton } from "@/components/ui/SsButton";
import { SsTypography } from "@/components/ui/SsTypography";

export async function SignIn() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SsCard variant="elevated" className="w-full max-w-md space-y-8 border-gray-100 p-10">
        <div className="text-center">
          <SsTypography variant="h3" className="mt-6 text-3xl tracking-tight text-gray-900">
            Build habits better with Streaks
          </SsTypography>
          <SsTypography variant="muted" className="mt-2 text-gray-600">
            Sign in to start tracking your habits
          </SsTypography>
        </div>

        <div className="mt-8 space-y-6">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <SsButton
              type="submit"
              variant="secondary"
              block
              className="group gap-3 border border-gray-300 py-3 text-sm text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900"
              leftIcon={<FcGoogle className="h-6 w-6" />}
            >
              Sign in with Google
            </SsButton>
          </form>
          <div className="flex flex-col items-center gap-2">
            <SsTypography variant="caption" className="text-gray-400">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 transition-colors hover:text-gray-600"
              >
                Terms of Service
              </Link>
            </SsTypography>
            <Link
              href="/privacy"
              className="text-xs text-gray-400 underline underline-offset-4 transition-colors hover:text-gray-600"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </SsCard>
    </div>
  );
}
