import { clearSessionCookie } from "../auth.js";

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

  return jsonResponse({ ok: true }, {
    headers: {
      "set-cookie": clearSessionCookie(request)
    }
  });
}
