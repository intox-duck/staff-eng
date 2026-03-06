import { rewrite } from "@vercel/functions";
import { parseCookies, SESSION_COOKIE_NAME, verifySessionToken } from "./auth.js";

export const config = {
  matcher: ["/", "/index.html", "/login", "/login.html"]
};

function getAllowedUsernames() {
  const configured = typeof process.env.APP_ALLOWED_USERNAMES === "string"
    ? process.env.APP_ALLOWED_USERNAMES
    : "";
  const fromList = configured
    .split(",")
    .map(function(name) { return name.trim().toLowerCase(); })
    .filter(Boolean);
  const primary = typeof process.env.APP_USERNAME === "string"
    ? process.env.APP_USERNAME.trim().toLowerCase()
    : "";

  if (primary) {
    fromList.push(primary);
  }

  return Array.from(new Set(fromList));
}

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
  const secret = process.env.APP_AUTH_SECRET;
  const allowedUsernames = getAllowedUsernames();

  if (!secret || allowedUsernames.length === 0) {
    return new Response("Missing APP_AUTH_SECRET and/or APP_USERNAME(APP_ALLOWED_USERNAMES) in the Vercel environment.", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }

  const session = await getSession(request);
  const isAuthenticated = Boolean(
    session &&
    typeof session.username === "string" &&
    allowedUsernames.includes(session.username.toLowerCase())
  );

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
