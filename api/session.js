import { parseCookies, SESSION_COOKIE_NAME, verifySessionToken } from "../auth.js";

export const config = {
  runtime: "edge"
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

function jsonResponse(body, init) {
  const headers = new Headers(init && init.headers ? init.headers : {});

  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");

  return new Response(JSON.stringify(body), {
    status: init && init.status ? init.status : 200,
    headers: headers
  });
}

export default async function handler(request) {
  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed." }, {
      status: 405,
      headers: { allow: "GET" }
    });
  }

  const secret = process.env.APP_AUTH_SECRET;
  const allowedUsernames = getAllowedUsernames();

  if (!secret || allowedUsernames.length === 0) {
    return jsonResponse({ error: "Authentication is not fully configured." }, { status: 500 });
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return jsonResponse({ ok: false }, { status: 401 });
  }

  const session = await verifySessionToken(token, secret);
  const username = session && typeof session.username === "string"
    ? session.username.toLowerCase()
    : "";

  if (!username || !allowedUsernames.includes(username)) {
    return jsonResponse({ ok: false }, { status: 401 });
  }

  return jsonResponse({ ok: true, username: username }, { status: 200 });
}
