import { rewrite } from "@vercel/functions";
import { parseCookies, SESSION_COOKIE_NAME, verifySessionToken } from "./auth.js";

export const config = {
  matcher: ["/", "/index.html", "/login", "/login.html"]
};

function redirectToLogin(request) {
  return Response.redirect(new URL("/login", request.url), 307);
}

function rewriteToFile(request, pathname) {
  return rewrite(new URL(pathname, request.url));
}

async function getSession(request) {
  const secret = process.env.APP_AUTH_SECRET;

  if (!secret) {
    return null;
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  return verifySessionToken(token, secret);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const expectedUsername = process.env.APP_USERNAME;
  const secret = process.env.APP_AUTH_SECRET;

  if (!expectedUsername || !secret) {
    return new Response("Missing APP_USERNAME or APP_AUTH_SECRET in the Vercel environment.", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }

  const session = await getSession(request);
  const isAuthenticated = Boolean(session && session.username === expectedUsername);

  if (url.pathname === "/login" || url.pathname === "/login.html") {
    if (isAuthenticated) {
      return Response.redirect(new URL("/", request.url), 307);
    }

    return rewriteToFile(request, "/login.html");
  }

  if (!isAuthenticated) {
    return redirectToLogin(request);
  }

  return rewriteToFile(request, "/index.html");
}
