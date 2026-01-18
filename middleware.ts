export { auth as middleware } from "@/app/auth";

export const config = {
    matcher: ["/((?!api/auth|_next|favicon.ico|login).*)"],
};