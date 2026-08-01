import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

const { auth } = NextAuth(authConfig);
export const proxy = auth;

export const config = {
  // `api/mcp` and `api/cron` are server-to-server endpoints with no session
  // cookie — they authenticate themselves with a shared secret, so the session
  // proxy must not intercept them or it redirects the caller to /signin.
  matcher: [
    "/((?!api/auth|api/mcp|api/cron|_next|favicon.ico|manifest.webmanifest|sw.js|logo.png|logo-192.png|privacy|terms|signin|login).*)",
  ],
};
