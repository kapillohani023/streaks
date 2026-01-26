import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

const { auth } = NextAuth(authConfig);
export const middleware = auth;

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico|privacy|terms|signin|login).*)"],
};
