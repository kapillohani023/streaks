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
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <SsCard variant="elevated" padding="lg" className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-muted text-foreground mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <ListChecks size={28} />
          </div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Streaks
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
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
        <p className="text-muted-foreground mt-6 text-center text-xs">
          By signing in, you agree to our{" "}
          <a href="/terms" className="hover:text-foreground underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </a>
          .
        </p>
      </SsCard>
    </div>
  );
}
