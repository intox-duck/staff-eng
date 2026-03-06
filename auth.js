const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const SESSION_COOKIE_NAME = "app_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function toBase64Url(bytes) {
  let binary = "";

  bytes.forEach(function(byte) {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function createSigningKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value, secret) {
  const key = await createSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));

  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(username, secret) {
  const payload = {
    username: username,
    expiresAt: Date.now() + (SESSION_DURATION_SECONDS * 1000)
  };
  const encodedPayload = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload, secret);

  return encodedPayload + "." + signature;
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const encodedPayload = parts[0];
  const actualSignature = parts[1];
  const expectedSignature = await signValue(encodedPayload, secret);

  if (actualSignature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(textDecoder.decode(fromBase64Url(encodedPayload)));

    if (!payload.username || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader) {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(";").forEach(function(entry) {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const name = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();

    if (name) {
      cookies[name] = value;
    }
  });

  return cookies;
}

function buildCookieAttributes(request) {
  const attributes = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];

  if (new URL(request.url).protocol === "https:") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function createSessionCookie(request, token) {
  return SESSION_COOKIE_NAME + "=" + token + "; Max-Age=" + SESSION_DURATION_SECONDS + "; " + buildCookieAttributes(request);
}

export function clearSessionCookie(request) {
  return SESSION_COOKIE_NAME + "=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; " + buildCookieAttributes(request);
}
