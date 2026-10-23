const encoder = new TextEncoder();

function signingKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createAdminToken(secret: string, now = Date.now()): Promise<string> {
  const expires = String(now + 24 * 60 * 60 * 1000);
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret), encoder.encode(expires));
  return `${expires}.${Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function verifyAdminToken(token: string | undefined, secret: string, now = Date.now()): Promise<boolean> {
  if (!secret || !token) return false;
  const match = /^(\d{13})\.([a-f0-9]{64})$/.exec(token);
  if (!match || Number(match[1]) <= now) return false;
  const signature = Uint8Array.from(match[2].match(/../g)!, hex => parseInt(hex, 16));
  return crypto.subtle.verify("HMAC", await signingKey(secret), signature, encoder.encode(match[1]));
}
