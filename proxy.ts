import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

const { auth } = NextAuth(authConfig);
export const proxy = auth;

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico|manifest.webmanifest|sw.js|logo.png|logo-192.png|privacy|terms|signin|login).*)"],
};
