import crypto from "crypto";

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlJSON(obj) {
  return b64url(JSON.stringify(obj));
}
export function sign(payload, expiresInSec = 30, secret = process.env.CONTENT_TOKEN_SECRET || "dev_secret") {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const part1 = b64urlJSON(header);
  const part2 = b64urlJSON(body);
  const data = `${part1}.${part2}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${data}.${sig}`;
}
export function verify(token, secret = process.env.CONTENT_TOKEN_SECRET || "dev_secret") {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [p1, p2, sig] = token.split(".");
  const data = `${p1}.${p2}`;
  const expect = crypto.createHmac("sha256", secret).update(data).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  if (expect !== sig) return null;
  const payload = JSON.parse(Buffer.from(p2.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;
  return payload;
}
