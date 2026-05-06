import { signIn, auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { SsCard } from "@/components/ui/SsCard";
import { SsButton } from "@/components/ui/SsButton";

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SsCard variant="default" padding="lg" className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">
          Streaks - Build habits better
        </h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <SsButton
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </SsButton>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-zinc-700">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-zinc-700">
            Privacy Policy
          </a>
          .
        </p>
      </SsCard>
    </div>
  );
}
