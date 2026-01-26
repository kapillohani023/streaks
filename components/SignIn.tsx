import { signIn, auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export async function SignIn() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-100 bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Build habits better with Streaks
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to start tracking your habits
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="group relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
            >
              <FcGoogle className="h-6 w-6" />
              Sign in with Google
            </button>
          </form>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-gray-600 transition-colors"
              >
                Terms of Service
              </Link>
            </p>
            <Link
              href="/privacy"
              className="text-xs text-gray-400 underline underline-offset-4 hover:text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
