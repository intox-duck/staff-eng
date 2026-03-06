import { createSessionCookie, createSessionToken } from "../auth.js";

export const config = {
  runtime: "edge"
};

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
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, {
      status: 405,
      headers: {
        allow: "POST"
      }
    });
  }

  const expectedUsername = process.env.APP_USERNAME;
  const expectedPassword = process.env.APP_PASSWORD;
  const secret = process.env.APP_AUTH_SECRET;

  if (!expectedUsername || !expectedPassword || !secret) {
    return jsonResponse({ error: "Authentication is not fully configured." }, { status: 500 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, { status: 400 });
  }

  const username = typeof payload.username === "string" ? payload.username.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (username !== expectedUsername || password !== expectedPassword) {
    return jsonResponse({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken(expectedUsername, secret);

  return jsonResponse({ ok: true }, {
    status: 200,
    headers: {
      "set-cookie": createSessionCookie(request, token)
    }
  });
}
