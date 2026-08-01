import { signIn, auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { ListChecks } from "lucide-react";
import { SsCard } from "@/components/ui/SsCard";
import { SsButton } from "@/components/ui/SsButton";

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SsCard variant="elevated" padding="lg" className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground">
            <ListChecks size={28} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Streaks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build habits better
          </p>
        </div>
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
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </SsCard>
    </div>
  );
}
